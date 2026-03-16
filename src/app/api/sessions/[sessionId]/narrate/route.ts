import { NextRequest } from "next/server";
import { apiError } from "@/lib/api-helpers";
import { getSession } from "@/lib/store";
import { loadScenario, loadScene, resolve } from "@/lib/engine/scenario-loader";
import { resolveScene } from "@/lib/engine/decision-processor";
import {
  expandSceneStream,
  generateOutcomeStream,
  getProviderForSession,
} from "@/lib/ai/narration";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CHUNK_TIMEOUT_MS = 30_000;
const KEEPALIVE_INTERVAL_MS = 10_000;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = await getSession(sessionId);
  if (!session) {
    return apiError("SESSION_NOT_FOUND", `Session not found: ${sessionId}`, 404);
  }

  let body: {
    type: "scene" | "outcome";
    outcomePrompt?: string;
    choiceText?: string;
  };
  try {
    body = await request.json();
  } catch {
    return apiError("VALIDATION_ERROR", "Invalid JSON body", 400);
  }

  const scenario = loadScenario(session.scenarioId);
  const role = scenario.roles.find((r) => r.id === session.roleId);
  const roleName = role?.name ?? session.roleId;
  const roleTitle = role ? resolve(role.title, session.locale) : "";
  const scenarioTitle = resolve(scenario.title, session.locale);

  let stream: AsyncIterable<string>;
  try {
    const provider = getProviderForSession(session);

    if (body.type === "scene") {
      const rawScene = loadScene(session.scenarioId, session.currentSceneId);
      const resolved = resolveScene(rawScene, session.locale, session.gameState);
      stream = expandSceneStream(
        provider,
        resolved.narrative,
        scenarioTitle,
        roleName,
        roleTitle,
        session.locale,
        session.gameState
      );
    } else if (body.type === "outcome" && body.outcomePrompt && body.choiceText) {
      stream = generateOutcomeStream(
        provider,
        body.outcomePrompt,
        body.choiceText,
        scenarioTitle,
        roleName,
        roleTitle,
        session.locale,
        session.gameState
      );
    } else {
      return apiError("VALIDATION_ERROR", "Invalid narrate request", 400);
    }
  } catch {
    return apiError("AI_ERROR", "Failed to initialize AI provider", 500);
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      // Keepalive: send SSE comments periodically to prevent proxy/browser timeouts
      const keepalive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(":\n\n"));
        } catch {
          clearInterval(keepalive);
        }
      }, KEEPALIVE_INTERVAL_MS);

      try {
        const iterator = stream[Symbol.asyncIterator]();
        while (true) {
          const next = iterator.next();
          const timeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Stream chunk timeout")), CHUNK_TIMEOUT_MS)
          );
          const { done, value } = await Promise.race([next, timeout]);
          if (done) break;
          // SSE data event — encode text as single-line data field
          const lines = value.replace(/\n/g, "\ndata: ");
          controller.enqueue(encoder.encode(`data: ${lines}\n\n`));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch {
        // If AI fails or stalls mid-stream, signal end
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      }

      clearInterval(keepalive);
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
