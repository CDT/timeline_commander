// ─── Locale ────────────────────────────────────────────────────────────────

export type Locale = "en" | "ja" | "zh-CN";
export const SUPPORTED_LOCALES: Locale[] = ["en", "ja", "zh-CN"];

export function isLocale(v: unknown): v is Locale {
  return SUPPORTED_LOCALES.includes(v as Locale);
}

/** All user-facing strings in content data use this type. */
export type LocalizedString = Record<Locale, string>;

// ─── AI Provider ───────────────────────────────────────────────────────────

export type AiProviderName = "claude" | "deepseek";

export interface AiProviderConfig {
  provider: AiProviderName;
  model: string;
}

export const DEFAULT_PROVIDER: AiProviderConfig = {
  provider: "deepseek",
  model: "deepseek-chat",
};

export const VALID_MODELS: Record<AiProviderName, string[]> = {
  claude: ["claude-sonnet-4-6", "claude-opus-4-6"],
  deepseek: ["deepseek-chat", "deepseek-reasoner"],
};

// ─── Content ───────────────────────────────────────────────────────────────

export interface Character {
  id: string;
  name: string;
  role: LocalizedString;
  faction: string;
  description: LocalizedString;
}

export interface StateChange {
  variable: string;
  operation: "add" | "set";
  value: number | boolean;
}

export interface Condition {
  variable: string;
  operator: "eq" | "gt" | "lt" | "gte" | "lte";
  value: number | boolean;
}

export interface Choice {
  id: string;
  text: LocalizedString;
  historicalContext: string;
  outcomePrompt: LocalizedString;
  nextSceneId: string | null;
  nextScenePool?: string[];
  stateChanges: StateChange[];
  conditions?: Condition[];
}

export interface Scene {
  id: string;
  scenarioId: string;
  title: string;
  date: LocalizedString;
  location: LocalizedString;
  narrativePrompt: LocalizedString;
  situationReport: LocalizedString[];
  objectives: LocalizedString[];
  constraints: LocalizedString[];
  choices: Choice[];
  roleFilter?: string[];
  isTerminal: boolean;
  historicalNote?: LocalizedString;
}

export interface Role {
  id: string;
  scenarioId: string;
  name: string;
  title: LocalizedString;
  perspective: "commander" | "political" | "civilian" | "journalist" | "other";
  isHistoricalFigure: boolean;
  briefing: LocalizedString;
  objectives: LocalizedString[];
  constraints: LocalizedString[];
  pressures: LocalizedString[];
  startingSceneId: string;
  initialState: Record<string, number | boolean>;
}

export interface Scenario {
  id: string;
  title: LocalizedString;
  period: LocalizedString;
  dates: { start: string; end: string };
  location: LocalizedString;
  historicalOverview: LocalizedString;
  realWorldOutcome: LocalizedString;
  keyFigures: Character[];
  roles: Role[];
  sceneIds: string[];
  tags: string[];
  difficulty: "introductory" | "intermediate" | "advanced";
}

export interface HistoricalEvent {
  date: string;
  description: LocalizedString;
}

export interface HistoricalRecord {
  scenarioId: string;
  timeline: HistoricalEvent[];
  outcome: LocalizedString;
  casualties?: LocalizedString;
  significance: LocalizedString;
  furtherReading?: string[];
}

// ─── Game State ─────────────────────────────────────────────────────────────

export type GameStateVariables = Record<string, number | boolean>;

export interface GameState {
  variables: GameStateVariables;
  sceneHistory: string[];
}

export interface DecisionRecord {
  sceneId: string;
  choiceId: string;
  choiceText: string; // locale-resolved at decision time
  timestamp: string;
  stateChanges: StateChange[];
}

// ─── Session ────────────────────────────────────────────────────────────────

export type SessionStatus = "active" | "completed" | "abandoned";

export interface GameSession {
  id: string;
  scenarioId: string;
  roleId: string;
  locale: Locale;
  currentSceneId: string;
  status: SessionStatus;
  gameState: GameState;
  decisions: DecisionRecord[];
  aiProvider: AiProviderConfig;
  startedAt: string;
  completedAt: string | null;
  lastActivityAt: string;
}

// ─── Session Summary ─────────────────────────────────────────────────────────

export interface SessionSummary {
  sessionId: string;
  scenarioId: string;
  roleId: string;
  roleName: string;
  locale: Locale;
  status: "completed" | "abandoned";
  decisionCount: number;
  decisions: DecisionRecord[];
  alternateHistoryNarrative: string;
  realHistoricalOutcome: string;
  divergenceAnalysis: string;
  keyInfluences: string[];
  aiProvider: AiProviderConfig;
  generatedAt: string;
}

// ─── API shapes (resolved — no LocalizedString) ──────────────────────────────

export interface ScenarioListItem {
  id: string;
  title: string;
  period: string;
  dates: { start: string; end: string };
  location: string;
  difficulty: string;
  tags: string[];
  roleCount: number;
}

export interface ResolvedChoice {
  id: string;
  text: string;
}

export interface ResolvedScene {
  id: string;
  title: string;
  date: string;
  location: string;
  narrative: string;
  situationReport: string[];
  objectives: string[];
  constraints: string[];
  choices: ResolvedChoice[];
  isTerminal: boolean;
  historicalNote?: string;
}

export interface ResolvedRole {
  id: string;
  name: string;
  title: string;
  perspective: string;
  isHistoricalFigure: boolean;
  briefing: string;
  objectives: string[];
  constraints: string[];
  pressures: string[];
}
