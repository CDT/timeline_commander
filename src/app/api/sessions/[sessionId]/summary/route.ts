import { NextRequest } from "next/server";
import { apiError } from "@/lib/api-helpers";
import { getSession } from "@/lib/store";
import { buildSummaryInput } from "@/lib/engine/summary-builder";
import { generateSummary, generateEvaluations, getProviderForSession } from "@/lib/ai/narration";
import type { ChoiceEvaluation, OverallGrade } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AI_CALL_TIMEOUT_MS = 90_000;
const KEEPALIVE_INTERVAL_MS = 10_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("AI call timed out")), ms)
    ),
  ]);
}

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

  const { realHistoricalOutcome, decisionContexts } = buildSummaryInput(session);

  const fallbackEvaluations = buildFallbackEvaluations(decisionContexts);
  const provider = getProviderForSession(session);

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      function sendSSE(data: object) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      // Keepalive to prevent proxy/browser timeouts during AI generation
      const keepalive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(":\n\n"));
        } catch {
          clearInterval(keepalive);
        }
      }, KEEPALIVE_INTERVAL_MS);

      // Send base summary data immediately (no AI needed)
      const { loadScenario } = await import("@/lib/engine/scenario-loader");
      const scenario = loadScenario(session.scenarioId);
      const role = scenario.roles.find((r: { id: string }) => r.id === session.roleId);
      sendSSE({
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
          alternateHistoryNarrative: "Your decisions shaped an alternate history that diverged from the real events.",
          divergenceAnalysis: realHistoricalOutcome,
          keyInfluences: session.decisions.map((d) => d.choiceText),
          choiceEvaluations: fallbackEvaluations,
          overallGrade: "C" as OverallGrade,
          overallAssessment: "Generating evaluation…",
        },
      });

      // Run AI calls in parallel with timeout, stream each result as it arrives
      const summaryPromise = withTimeout(generateSummary(provider, session), AI_CALL_TIMEOUT_MS)
        .then((result) => sendSSE({ type: "summary", data: result }))
        .catch(() => { /* fallback already sent */ });

      const evalPromise = withTimeout(generateEvaluations(provider, session, decisionContexts), AI_CALL_TIMEOUT_MS)
        .then((result) => sendSSE({ type: "evaluations", data: result }))
        .catch(() => { /* fallback already sent */ });

      await Promise.all([summaryPromise, evalPromise]);

      clearInterval(keepalive);
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
