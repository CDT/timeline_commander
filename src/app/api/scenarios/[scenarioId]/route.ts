import { NextRequest } from "next/server";
import { apiOk, apiError } from "@/lib/api-helpers";
import {
  loadScenario,
  resolve,
  resolveArray,
} from "@/lib/engine/scenario-loader";
import { isLocale } from "@/lib/types";
import type { Locale } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ scenarioId: string }> }
) {
  const { scenarioId } = await params;
  const localeParam = request.nextUrl.searchParams.get("locale") ?? "en";
  if (!isLocale(localeParam)) {
    return apiError("INVALID_LOCALE", `Locale must be one of: en, ja, zh-CN`, 400);
  }
  const locale = localeParam as Locale;

  let scenario;
  try {
    scenario = loadScenario(scenarioId);
  } catch {
    return apiError("SCENARIO_NOT_FOUND", `Scenario not found: ${scenarioId}`, 404);
  }

  return apiOk({
    locale,
    scenario: {
      id: scenario.id,
      title: resolve(scenario.title, locale),
      period: resolve(scenario.period, locale),
      dates: scenario.dates,
      location: resolve(scenario.location, locale),
      historicalOverview: resolve(scenario.historicalOverview, locale),
      realWorldOutcome: resolve(scenario.realWorldOutcome, locale),
      difficulty: scenario.difficulty,
      tags: scenario.tags,
      keyFigures: scenario.keyFigures.map((f) => ({
        id: f.id,
        name: f.name,
        role: resolve(f.role, locale),
        faction: f.faction,
        description: resolve(f.description, locale),
      })),
      roles: scenario.roles.map((r) => ({
        id: r.id,
        name: r.name,
        title: resolve(r.title, locale),
        perspective: r.perspective,
        isHistoricalFigure: r.isHistoricalFigure,
        briefing: resolve(r.briefing, locale),
        objectives: resolveArray(r.objectives, locale),
        constraints: resolveArray(r.constraints, locale),
        pressures: resolveArray(r.pressures, locale),
        startingSceneId: r.startingSceneId,
      })),
    },
  });
}
