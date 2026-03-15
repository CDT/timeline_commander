import type { GameSession, SessionSummary, ChoiceEvaluation, OverallGrade } from "@/lib/types";
import { loadScenario, loadHistory, loadScene, resolve } from "./scenario-loader";

export interface DecisionContext {
  sceneId: string;
  sceneTitle: string;
  chosenId: string;
  chosenText: string;
  historicalContext: string;
  allChoices: {
    id: string;
    text: string;
    historicalContext: string;
  }[];
}

export function buildSummaryInput(session: GameSession): {
  session: GameSession;
  roleName: string;
  realHistoricalOutcome: string;
  decisionTexts: string[];
  decisionContexts: DecisionContext[];
} {
  const scenario = loadScenario(session.scenarioId);
  const history = loadHistory(session.scenarioId);
  const role = scenario.roles.find((r) => r.id === session.roleId);

  const roleName = role?.name ?? session.roleId;
  const realHistoricalOutcome = resolve(history.outcome, session.locale);
  const decisionTexts = session.decisions.map(
    (d) => `Scene ${d.sceneId}: chose "${d.choiceText}"`
  );

  const decisionContexts: DecisionContext[] = session.decisions.map((d) => {
    try {
      const scene = loadScene(session.scenarioId, d.sceneId);
      return {
        sceneId: d.sceneId,
        sceneTitle: scene.title,
        chosenId: d.choiceId,
        chosenText: d.choiceText,
        historicalContext: scene.choices.find((c) => c.id === d.choiceId)?.historicalContext ?? "",
        allChoices: scene.choices.map((c) => ({
          id: c.id,
          text: resolve(c.text, session.locale),
          historicalContext: c.historicalContext,
        })),
      };
    } catch {
      return {
        sceneId: d.sceneId,
        sceneTitle: d.sceneId,
        chosenId: d.choiceId,
        chosenText: d.choiceText,
        historicalContext: "",
        allChoices: [],
      };
    }
  });

  return { session, roleName, realHistoricalOutcome, decisionTexts, decisionContexts };
}

export function assembleSummary(
  session: GameSession,
  alternateHistoryNarrative: string,
  divergenceAnalysis: string,
  keyInfluences: string[],
  choiceEvaluations: ChoiceEvaluation[],
  overallGrade: OverallGrade,
  overallAssessment: string
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
    choiceEvaluations,
    overallGrade,
    overallAssessment,
    aiProvider: session.aiProvider,
    generatedAt: new Date().toISOString(),
  };
}
