import { NextRequest } from "next/server";
import { apiOk, apiError } from "@/lib/api-helpers";
import { getSession } from "@/lib/store";
import { buildSummaryInput, assembleSummary } from "@/lib/engine/summary-builder";
import { generateSummary, generateEvaluations, getProviderForSession } from "@/lib/ai/narration";
import type { ChoiceEvaluation, OverallGrade } from "@/lib/types";

export const runtime = "nodejs";

function buildFallbackEvaluations(
  decisionContexts: ReturnType<typeof buildSummaryInput>["decisionContexts"]
): ChoiceEvaluation[] {
  return decisionContexts.map((dc) => {
    const chosenOption = dc.allChoices.find((c) => c.id === dc.chosenId);
    const isHistorical = chosenOption?.historicalContext?.toLowerCase().includes("historical choice")
      || chosenOption?.historicalContext?.toLowerCase().includes("roughly the historical")
      || chosenOption?.historicalContext?.toLowerCase().includes("close to what happened");

    return {
      sceneId: dc.sceneId,
      sceneTitle: dc.sceneTitle,
      choiceId: dc.chosenId,
      choiceText: dc.chosenText,
      grade: isHistorical ? "A" as const : "C" as const,
      assessment: chosenOption?.historicalContext || "No assessment available.",
      misleadingFactors: "",
      historicalChoice: dc.allChoices
        .filter((c) => {
          const ctx = c.historicalContext.toLowerCase();
          return ctx.includes("historical choice") || ctx.includes("roughly the historical") || ctx.includes("close to what happened");
        })
        .map((c) => `${c.text} — ${c.historicalContext}`)
        .join(" ") || "See historical context above.",
      allOptions: dc.allChoices.map((c) => {
        const ctx = c.historicalContext.toLowerCase();
        const wasHistorical = ctx.includes("historical choice") || ctx.includes("roughly the historical") || ctx.includes("close to what happened");
        return {
          id: c.id,
          text: c.text,
          wasSelected: c.id === dc.chosenId,
          grade: wasHistorical ? "A" as const : "C" as const,
          briefAssessment: c.historicalContext,
        };
      }),
    };
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = await getSession(sessionId);
  if (!session) {
    return apiError("SESSION_NOT_FOUND", `Session not found: ${sessionId}`, 404);
  }

  const { roleName, realHistoricalOutcome, decisionContexts } = buildSummaryInput(session);

  let alternateHistoryNarrative =
    "Your decisions shaped an alternate history that diverged from the real events.";
  let divergenceAnalysis = realHistoricalOutcome;
  let keyInfluences: string[] = session.decisions.map((d) => d.choiceText);

  // Fallback evaluations from scene data (always available even if AI fails)
  let choiceEvaluations: ChoiceEvaluation[] = buildFallbackEvaluations(decisionContexts);
  let overallGrade: OverallGrade = "C";
  let overallAssessment = "AI evaluation was unavailable. Grades shown are based on historical accuracy of each option.";

  const provider = getProviderForSession(session);

  // Run summary and evaluations independently so one failure doesn't block the other
  const summaryPromise = generateSummary(provider, session).catch(() => null);
  const evalPromise = generateEvaluations(provider, session, decisionContexts).catch(() => null);

  const [aiResult, evalResult] = await Promise.all([summaryPromise, evalPromise]);

  if (aiResult) {
    alternateHistoryNarrative = aiResult.alternateHistoryNarrative;
    divergenceAnalysis = aiResult.divergenceAnalysis;
    keyInfluences = aiResult.keyInfluences;
  }

  if (evalResult) {
    choiceEvaluations = evalResult.choiceEvaluations;
    overallGrade = evalResult.overallGrade;
    overallAssessment = evalResult.overallAssessment;
  }

  const summary = assembleSummary(
    session,
    alternateHistoryNarrative,
    divergenceAnalysis,
    keyInfluences,
    choiceEvaluations,
    overallGrade,
    overallAssessment
  );

  return apiOk({ summary });
}
