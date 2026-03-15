import fs from "fs";
import path from "path";
import type {
  Scenario,
  Scene,
  HistoricalRecord,
  LocalizedString,
  Locale,
} from "@/lib/types";
import { SUPPORTED_LOCALES } from "@/lib/types";

const CONTENT_ROOT = path.join(process.cwd(), "content", "scenarios");

// ─── Validation ─────────────────────────────────────────────────────────────

function validateLocalizedString(
  obj: unknown,
  fieldPath: string
): LocalizedString {
  if (typeof obj !== "object" || obj === null) {
    throw new Error(`${fieldPath} must be an object`);
  }
  for (const locale of SUPPORTED_LOCALES) {
    if (typeof (obj as Record<string, unknown>)[locale] !== "string") {
      throw new Error(
        `${fieldPath} is missing required locale "${locale}"`
      );
    }
  }
  return obj as LocalizedString;
}

function validateLocalizedStringArray(
  arr: unknown,
  fieldPath: string
): LocalizedString[] {
  if (!Array.isArray(arr)) {
    throw new Error(`${fieldPath} must be an array`);
  }
  return arr.map((item, i) =>
    validateLocalizedString(item, `${fieldPath}[${i}]`)
  );
}

function deepValidate(obj: unknown, fieldPath: string): void {
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => deepValidate(item, `${fieldPath}[${i}]`));
    return;
  }
  if (typeof obj !== "object" || obj === null) return;
  const record = obj as Record<string, unknown>;
  // If the object has exactly the locale keys it's a LocalizedString
  const keys = Object.keys(record);
  if (
    keys.length === SUPPORTED_LOCALES.length &&
    SUPPORTED_LOCALES.every((l) => keys.includes(l))
  ) {
    validateLocalizedString(record, fieldPath);
    return;
  }
  for (const key of keys) {
    deepValidate(record[key], `${fieldPath}.${key}`);
  }
}

// ─── Cache ──────────────────────────────────────────────────────────────────

const scenarioCache = new Map<string, Scenario>();
const sceneCache = new Map<string, Scene>();
const historyCache = new Map<string, HistoricalRecord>();

// ─── Public API ─────────────────────────────────────────────────────────────

export function listScenarioIds(): string[] {
  if (!fs.existsSync(CONTENT_ROOT)) return [];
  return fs
    .readdirSync(CONTENT_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

export function loadScenario(scenarioId: string): Scenario {
  if (scenarioCache.has(scenarioId)) return scenarioCache.get(scenarioId)!;
  const filePath = path.join(CONTENT_ROOT, scenarioId, "scenario.json");
  if (!fs.existsSync(filePath)) {
    throw new Error(`Scenario not found: ${scenarioId}`);
  }
  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Scenario;
  deepValidate(raw, `scenario(${scenarioId})`);
  scenarioCache.set(scenarioId, raw);
  return raw;
}

export function loadScene(scenarioId: string, sceneId: string): Scene {
  const cacheKey = `${scenarioId}:${sceneId}`;
  if (sceneCache.has(cacheKey)) return sceneCache.get(cacheKey)!;

  const scenesDir = path.join(CONTENT_ROOT, scenarioId, "scenes");
  if (!fs.existsSync(scenesDir)) {
    throw new Error(`Scenes directory not found for scenario: ${scenarioId}`);
  }

  // Scene files may be named anything — scan to find matching id
  const files = fs
    .readdirSync(scenesDir)
    .filter((f) => f.endsWith(".json"));

  for (const file of files) {
    const filePath = path.join(scenesDir, file);
    const raw = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Scene;
    if (raw.id === sceneId) {
      deepValidate(raw, `scene(${sceneId})`);
      sceneCache.set(cacheKey, raw);
      return raw;
    }
  }
  throw new Error(`Scene not found: ${sceneId} in scenario ${scenarioId}`);
}

export function loadHistory(scenarioId: string): HistoricalRecord {
  if (historyCache.has(scenarioId)) return historyCache.get(scenarioId)!;
  const filePath = path.join(CONTENT_ROOT, scenarioId, "history.json");
  if (!fs.existsSync(filePath)) {
    throw new Error(`History not found for scenario: ${scenarioId}`);
  }
  const raw = JSON.parse(
    fs.readFileSync(filePath, "utf-8")
  ) as HistoricalRecord;
  deepValidate(raw, `history(${scenarioId})`);
  historyCache.set(scenarioId, raw);
  return raw;
}

// ─── Locale resolver ────────────────────────────────────────────────────────

export function resolve(ls: LocalizedString, locale: Locale): string {
  return ls[locale] ?? ls["en"];
}

export function resolveArray(
  arr: LocalizedString[],
  locale: Locale
): string[] {
  return arr.map((ls) => resolve(ls, locale));
}
