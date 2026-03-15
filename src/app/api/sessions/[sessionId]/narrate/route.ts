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
      try {
        for await (const chunk of stream) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch {
        // If AI fails mid-stream, just close gracefully
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "Transfer-Encoding": "chunked",
    },
  });
}
