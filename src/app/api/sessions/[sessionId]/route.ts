import { NextRequest } from "next/server";
import { apiOk, apiError } from "@/lib/api-helpers";
import { getSession } from "@/lib/store";
import { loadScene } from "@/lib/engine/scenario-loader";
import { resolveScene } from "@/lib/engine/decision-processor";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = await getSession(sessionId);
  if (!session) {
    return apiError("SESSION_NOT_FOUND", `Session not found: ${sessionId}`, 404);
  }

  const rawScene = loadScene(session.scenarioId, session.currentSceneId);
  const scene = resolveScene(rawScene, session.locale, session.gameState);

  return apiOk({
    session: {
      id: session.id,
      scenarioId: session.scenarioId,
      roleId: session.roleId,
      locale: session.locale,
      status: session.status,
      startedAt: session.startedAt,
      lastActivityAt: session.lastActivityAt,
      decisionCount: session.decisions.length,
      aiProvider: session.aiProvider,
    },
    scene,
    gameState: session.gameState,
  });
}
