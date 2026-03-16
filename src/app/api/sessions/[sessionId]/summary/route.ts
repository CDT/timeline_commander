import { NextRequest } from "next/server";
import { apiError } from "@/lib/api-helpers";
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

  const fallbackEvaluations = buildFallbackEvaluations(decisionContexts);
  const provider = getProviderForSession(session);

  // Stream results as NDJSON so frontend can render progressively
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      function send(event: object) {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      }

      // Send base summary data immediately (no AI needed)
      const scenario = await import("@/lib/engine/scenario-loader").then(m => m.loadScenario(session.scenarioId));
      const role = scenario.roles.find((r: { id: string }) => r.id === session.roleId);
      send({
        type: "base",
        data: {
          sessionId: session.id,
          scenarioId: session.scenarioId,
          roleId: session.roleId,
          roleName: role?.name ?? session.roleId,
          locale: session.locale,
          status: session.status === "completed" ? "completed" : "abandoned",
          decisionCount: session.decisions.length,
          decisions: session.decisions,
          realHistoricalOutcome,
          aiProvider: session.aiProvider,
          generatedAt: new Date().toISOString(),
          // Defaults until AI results arrive
          alternateHistoryNarrative: "Your decisions shaped an alternate history that diverged from the real events.",
          divergenceAnalysis: realHistoricalOutcome,
          keyInfluences: session.decisions.map((d) => d.choiceText),
          choiceEvaluations: fallbackEvaluations,
          overallGrade: "C" as OverallGrade,
          overallAssessment: "Generating evaluation…",
        },
      });

      // Run AI calls in parallel, stream each result as it arrives
      const summaryPromise = generateSummary(provider, session)
        .then((result) => {
          send({ type: "summary", data: result });
        })
        .catch(() => {
          // Fallback already sent in base
        });

      const evalPromise = generateEvaluations(provider, session, decisionContexts)
        .then((result) => {
          send({ type: "evaluations", data: result });
        })
        .catch(() => {
          // Fallback already sent in base
        });

      await Promise.all([summaryPromise, evalPromise]);
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache",
      "Transfer-Encoding": "chunked",
    },
  });
}
