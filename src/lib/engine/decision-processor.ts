import type {
  GameSession,
  DecisionRecord,
  ResolvedScene,
  ResolvedChoice,
  Locale,
} from "@/lib/types";
import { loadScenario, loadScene, resolve, resolveArray } from "./scenario-loader";
import { applyStateChanges, filterAvailableChoices } from "./state-evaluator";

export interface DecisionResult {
  session: GameSession;
  outcomePrompt: string;
  nextScene: ResolvedScene | null;
}

export function processDecision(
  session: GameSession,
  choiceId: string
): DecisionResult {
  const { scenarioId, locale, currentSceneId, gameState } = session;
  const scenario = loadScenario(scenarioId);
  const scene = loadScene(scenarioId, currentSceneId);

  const available = filterAvailableChoices(scene.choices, gameState);
  const choice = available.find((c) => c.id === choiceId);
  if (!choice) {
    throw new Error(`Invalid choice: ${choiceId}`);
  }

  const newState = applyStateChanges(gameState, choice.stateChanges);
  const choiceText = resolve(choice.text, locale);
  const outcomePrompt = resolve(choice.outcomePrompt, locale);

  const decisionRecord: DecisionRecord = {
    sceneId: currentSceneId,
    choiceId,
    choiceText,
    timestamp: new Date().toISOString(),
    stateChanges: choice.stateChanges,
  };

  const newHistory = [...newState.sceneHistory, currentSceneId];
  const updatedState = { ...newState, sceneHistory: newHistory };

  let nextSceneId: string | null = null;

  if (choice.nextSceneId) {
    nextSceneId = choice.nextSceneId;
  } else if (choice.nextScenePool && choice.nextScenePool.length > 0) {
    // Pick a scene from the pool that hasn't been visited yet
    const unvisited = choice.nextScenePool.filter(
      (id) => !newHistory.includes(id)
    );
    const pool = unvisited.length > 0 ? unvisited : choice.nextScenePool;
    nextSceneId = pool[Math.floor(Math.random() * pool.length)];
  }

  let nextScene: ResolvedScene | null = null;
  const isTerminal = scene.isTerminal || nextSceneId === null;

  const updatedSession: GameSession = {
    ...session,
    currentSceneId: nextSceneId ?? currentSceneId,
    gameState: updatedState,
    decisions: [...session.decisions, decisionRecord],
    status: isTerminal ? "completed" : "active",
    completedAt: isTerminal ? new Date().toISOString() : null,
    lastActivityAt: new Date().toISOString(),
  };

  if (!isTerminal && nextSceneId) {
    const rawNext = loadScene(scenarioId, nextSceneId);
    nextScene = resolveScene(rawNext, locale, updatedState);
  }

  return { session: updatedSession, outcomePrompt, nextScene };
}

export function resolveScene(
  scene: ReturnType<typeof loadScene>,
  locale: Locale,
  gameState: import("@/lib/types").GameState
): ResolvedScene {
  const available = filterAvailableChoices(scene.choices, gameState);
  const resolvedChoices: ResolvedChoice[] = available.map((c) => ({
    id: c.id,
    text: resolve(c.text, locale),
  }));

  return {
    id: scene.id,
    title: scene.title,
    date: resolve(scene.date, locale),
    location: resolve(scene.location, locale),
    narrative: resolve(scene.narrativePrompt, locale),
    situationReport: resolveArray(scene.situationReport, locale),
    objectives: resolveArray(scene.objectives, locale),
    constraints: resolveArray(scene.constraints, locale),
    choices: resolvedChoices,
    isTerminal: scene.isTerminal,
    historicalNote: scene.historicalNote
      ? resolve(scene.historicalNote, locale)
      : undefined,
  };
}
