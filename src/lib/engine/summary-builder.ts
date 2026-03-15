import type { GameSession, SessionSummary } from "@/lib/types";
import { loadScenario, loadHistory, resolve } from "./scenario-loader";

export function buildSummaryInput(session: GameSession): {
  session: GameSession;
  roleName: string;
  realHistoricalOutcome: string;
  decisionTexts: string[];
} {
  const scenario = loadScenario(session.scenarioId);
  const history = loadHistory(session.scenarioId);
  const role = scenario.roles.find((r) => r.id === session.roleId);

  const roleName = role?.name ?? session.roleId;
  const realHistoricalOutcome = resolve(history.outcome, session.locale);
  const decisionTexts = session.decisions.map(
    (d) => `Scene ${d.sceneId}: chose "${d.choiceText}"`
  );

  return { session, roleName, realHistoricalOutcome, decisionTexts };
}

export function assembleSummary(
  session: GameSession,
  alternateHistoryNarrative: string,
  divergenceAnalysis: string,
  keyInfluences: string[]
): SessionSummary {
  const scenario = loadScenario(session.scenarioId);
  const history = loadHistory(session.scenarioId);
  const role = scenario.roles.find((r) => r.id === session.roleId);

  return {
    sessionId: session.id,
    scenarioId: session.scenarioId,
    roleId: session.roleId,
    roleName: role?.name ?? session.roleId,
    locale: session.locale,
    status: session.status === "completed" ? "completed" : "abandoned",
    decisionCount: session.decisions.length,
    decisions: session.decisions,
    alternateHistoryNarrative,
    realHistoricalOutcome: resolve(history.outcome, session.locale),
    divergenceAnalysis,
    keyInfluences,
    aiProvider: session.aiProvider,
    generatedAt: new Date().toISOString(),
  };
}
