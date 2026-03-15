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
import type { GameSession, GameState, ChoiceEvaluation, OverallGrade } from "@/lib/types";
import type { AiProvider } from "./provider";
import { createProvider } from "./provider";
import { loadScenario, loadHistory, resolve } from "@/lib/engine/scenario-loader";
import type { DecisionContext } from "@/lib/engine/summary-builder";

// ─── Token limits (configurable via .env.local) ─────────────────────────────

const MAX_TOKENS_NARRATION = Number(process.env.AI_MAX_TOKENS_NARRATION) || 1024;
const MAX_TOKENS_SUMMARY = Number(process.env.AI_MAX_TOKENS_SUMMARY) || 2048;
const MAX_TOKENS_EVALUATION = Number(process.env.AI_MAX_TOKENS_EVALUATION) || 3072;

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

  return provider.generateNarration(userPrompt, systemPrompt, MAX_TOKENS_NARRATION);
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

  return provider.generateNarration(userPrompt, systemPrompt, MAX_TOKENS_NARRATION);
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

  const raw = await provider.generateNarration(userPrompt, systemPrompt, MAX_TOKENS_SUMMARY);

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

// ─── Evaluation generation ────────────────────────────────────────────────────

export async function generateEvaluations(
  provider: AiProvider,
  session: GameSession,
  decisionContexts: DecisionContext[]
): Promise<{
  choiceEvaluations: ChoiceEvaluation[];
  overallGrade: OverallGrade;
  overallAssessment: string;
}> {
  const scenario = loadScenario(session.scenarioId);
  const history = loadHistory(session.scenarioId);
  const role = scenario.roles.find((r) => r.id === session.roleId);
  const roleName = role?.name ?? session.roleId;
  const roleTitle = role ? resolve(role.title, session.locale) : "";
  const realOutcome = resolve(history.outcome, session.locale);

  const langInstruction =
    session.locale === "ja"
      ? "Respond in Japanese for all assessment text, but keep JSON keys in English."
      : session.locale === "zh-CN"
      ? "Respond in Simplified Chinese for all assessment text, but keep JSON keys in English."
      : "Respond in English.";

  const systemPrompt = `You are a military history professor evaluating a student's decisions in an interactive historical simulation.
The scenario is: ${resolve(scenario.title, session.locale)}
The student played as: ${roleName}, ${roleTitle}
Real historical outcome: "${realOutcome}"

You must evaluate each decision based on:
1. Historical accuracy — did the player choose what actually happened, or something plausible?
2. Strategic wisdom — was the choice militarily/politically sound given available information?
3. Awareness of consequences — did the choice account for logistics, morale, political pressure?

Grade scale: A (excellent/historically accurate), B (good/reasonable alternative), C (mediocre/risky), D (poor/historically unsound), F (disastrous/ahistorical)
${langInstruction}`;

  const decisionsDetail = decisionContexts.map((dc, i) => {
    const choicesList = dc.allChoices.map((c) => {
      const marker = c.id === dc.chosenId ? " [PLAYER'S CHOICE]" : "";
      return `  - "${c.text}" (historical context: ${c.historicalContext})${marker}`;
    }).join("\n");
    return `Decision ${i + 1} — Scene: "${dc.sceneTitle}"
Available options:
${choicesList}`;
  }).join("\n\n");

  const userPrompt = `Evaluate the player's decisions in this completed game session.

${decisionsDetail}

Return a JSON object with exactly these keys:
- "evaluations": an array with one object per decision, each containing:
  - "choiceId": the ID of the player's chosen option
  - "grade": letter grade (A/B/C/D/F) for the player's choice
  - "assessment": 2-3 sentences explaining why this choice was good or bad historically and strategically
  - "misleadingFactors": 1-2 sentences about what might have made this option seem better or worse than it actually was — traps, hidden risks, or deceptive framing
  - "historicalChoice": 1-2 sentences describing what actually happened historically at this decision point
  - "allOptionGrades": an array of objects for ALL options in this decision (including unchosen ones), each with:
    - "id": the choice ID
    - "grade": letter grade (A/B/C/D/F)
    - "briefAssessment": one sentence assessment
- "overallGrade": a single letter grade (A/B/C/D/F) for the player's overall performance
- "overallAssessment": 2-3 sentences summarizing the player's overall strategic judgment

Respond ONLY with valid JSON. No markdown, no code blocks.`;

  const raw = await provider.generateNarration(userPrompt, systemPrompt, MAX_TOKENS_EVALUATION);

  try {
    const parsed = JSON.parse(raw) as {
      evaluations: {
        choiceId: string;
        grade: string;
        assessment: string;
        misleadingFactors: string;
        historicalChoice: string;
        allOptionGrades: { id: string; grade: string; briefAssessment: string }[];
      }[];
      overallGrade: string;
      overallAssessment: string;
    };

    const validGrades = ["A", "B", "C", "D", "F"] as const;
    const toGrade = (g: string): OverallGrade =>
      validGrades.includes(g as OverallGrade) ? (g as OverallGrade) : "C";

    const choiceEvaluations: ChoiceEvaluation[] = decisionContexts.map((dc, i) => {
      const evalData = parsed.evaluations?.[i];
      return {
        sceneId: dc.sceneId,
        sceneTitle: dc.sceneTitle,
        choiceId: dc.chosenId,
        choiceText: dc.chosenText,
        grade: toGrade(evalData?.grade ?? "C"),
        assessment: evalData?.assessment ?? "",
        misleadingFactors: evalData?.misleadingFactors ?? "",
        historicalChoice: evalData?.historicalChoice ?? "",
        allOptions: dc.allChoices.map((c) => {
          const optGrade = evalData?.allOptionGrades?.find((og) => og.id === c.id);
          return {
            id: c.id,
            text: c.text,
            wasSelected: c.id === dc.chosenId,
            grade: toGrade(optGrade?.grade ?? "C"),
            briefAssessment: optGrade?.briefAssessment ?? "",
          };
        }),
      };
    });

    return {
      choiceEvaluations,
      overallGrade: toGrade(parsed.overallGrade ?? "C"),
      overallAssessment: parsed.overallAssessment ?? "",
    };
  } catch {
    // Fallback: return empty evaluations
    return {
      choiceEvaluations: decisionContexts.map((dc) => ({
        sceneId: dc.sceneId,
        sceneTitle: dc.sceneTitle,
        choiceId: dc.chosenId,
        choiceText: dc.chosenText,
        grade: "C" as const,
        assessment: "Evaluation unavailable.",
        misleadingFactors: "",
        historicalChoice: "",
        allOptions: dc.allChoices.map((c) => ({
          id: c.id,
          text: c.text,
          wasSelected: c.id === dc.chosenId,
          grade: "C" as const,
          briefAssessment: "",
        })),
      })),
      overallGrade: "C",
      overallAssessment: "Evaluation unavailable.",
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
