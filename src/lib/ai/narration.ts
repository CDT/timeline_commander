/**
 * AI orchestration layer.
 *
 * Three operations:
 *   expandScene    — opening narration for a scene
 *   generateOutcome — consequence narration after a choice
 *   generateSummary — alternate-history summary + divergence analysis
 *
 * All inputs are already locale-resolved (plain strings).
 * All outputs are plain strings in the session locale.
 */
import type { GameSession, GameState, DecisionRecord } from "@/lib/types";
import type { AiProvider } from "./provider";
import { createProvider } from "./provider";
import { loadScenario, loadHistory, resolve } from "@/lib/engine/scenario-loader";

// ─── System prompt ───────────────────────────────────────────────────────────

function buildSystemPrompt(
  scenarioTitle: string,
  roleName: string,
  roleTitle: string,
  locale: string
): string {
  const langInstruction =
    locale === "ja"
      ? "Respond in Japanese."
      : locale === "zh-CN"
      ? "Respond in Simplified Chinese."
      : "Respond in English.";

  return `You are a narrative engine for an interactive historical role-playing game called Timeline Commander.
The current scenario is: ${scenarioTitle}
The player is: ${roleName}, ${roleTitle}

Your role:
- Write immersive, historically grounded prose from the perspective of the player's character.
- Stay within the bounds of historical plausibility. No fantasy, no anachronisms.
- Keep narration to 2–4 concise paragraphs unless instructed otherwise.
- Use a serious, documentary tone — vivid but not sensational.
- Never invent outcomes that contradict the provided scenario state.
${langInstruction}`;
}

// ─── Operations ──────────────────────────────────────────────────────────────

export async function expandScene(
  provider: AiProvider,
  sceneNarrativePrompt: string,
  scenarioTitle: string,
  roleName: string,
  roleTitle: string,
  locale: string,
  gameState: GameState
): Promise<string> {
  const systemPrompt = buildSystemPrompt(
    scenarioTitle,
    roleName,
    roleTitle,
    locale
  );
  const stateContext = Object.entries(gameState.variables)
    .filter(([, v]) => typeof v === "number")
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");

  const userPrompt = `Expand the following scene narrative seed into vivid, immersive prose (2–3 paragraphs).

Scene seed: "${sceneNarrativePrompt}"

Current situation context: ${stateContext || "start of game"}

Write as if you are describing the scene to the player in the second person ("You stand…", "You hear…"). Ground every sentence in the historical reality of this moment.`;

  return provider.generateNarration(userPrompt, systemPrompt);
}

export async function generateOutcome(
  provider: AiProvider,
  outcomePromptSeed: string,
  choiceText: string,
  scenarioTitle: string,
  roleName: string,
  roleTitle: string,
  locale: string,
  gameState: GameState
): Promise<string> {
  const systemPrompt = buildSystemPrompt(
    scenarioTitle,
    roleName,
    roleTitle,
    locale
  );

  const userPrompt = `The player has made a decision. Write the immediate consequences (2–3 paragraphs).

Decision taken: "${choiceText}"

Outcome seed: "${outcomePromptSeed}"

Write in second person. Show the immediate consequences of this choice, grounded in historical plausibility. End on a note that naturally leads into the next scene.`;

  return provider.generateNarration(userPrompt, systemPrompt);
}

export async function generateSummary(
  provider: AiProvider,
  session: GameSession
): Promise<{
  alternateHistoryNarrative: string;
  divergenceAnalysis: string;
  keyInfluences: string[];
}> {
  const scenario = loadScenario(session.scenarioId);
  const history = loadHistory(session.scenarioId);
  const role = scenario.roles.find((r) => r.id === session.roleId);
  const roleName = role?.name ?? session.roleId;
  const roleTitle = role ? resolve(role.title, session.locale) : "";
  const realOutcome = resolve(history.outcome, session.locale);

  const systemPrompt = buildSystemPrompt(
    resolve(scenario.title, session.locale),
    roleName,
    roleTitle,
    session.locale
  );

  const decisionLog = session.decisions
    .map((d, i) => `Decision ${i + 1}: "${d.choiceText}"`)
    .join("\n");

  const userPrompt = `The game session has ended. Generate a session summary with three parts.

Player's decisions:
${decisionLog}

Real historical outcome: "${realOutcome}"

Return your response as a JSON object with exactly these three keys:
- "alternateHistoryNarrative": a 3–4 paragraph alternate history narrative describing what happened in the player's version of events, written in past tense
- "divergenceAnalysis": a 2–3 paragraph analysis of where and why the player's history diverged from the real outcome
- "keyInfluences": an array of 3–5 short strings (one sentence each) identifying the decisions that most shaped the outcome

Respond ONLY with valid JSON. No markdown, no code blocks.`;

  const raw = await provider.generateNarration(userPrompt, systemPrompt);

  try {
    const parsed = JSON.parse(raw) as {
      alternateHistoryNarrative: string;
      divergenceAnalysis: string;
      keyInfluences: string[];
    };
    return {
      alternateHistoryNarrative: parsed.alternateHistoryNarrative ?? "",
      divergenceAnalysis: parsed.divergenceAnalysis ?? "",
      keyInfluences: Array.isArray(parsed.keyInfluences)
        ? parsed.keyInfluences
        : [],
    };
  } catch {
    // Graceful fallback if the model returns non-JSON
    return {
      alternateHistoryNarrative: raw,
      divergenceAnalysis: "",
      keyInfluences: [],
    };
  }
}

// ─── Convenience: get provider from session ──────────────────────────────────

export function getProviderForSession(session: GameSession): AiProvider {
  return createProvider(
    session.aiProvider.provider,
    session.aiProvider.model
  );
}
