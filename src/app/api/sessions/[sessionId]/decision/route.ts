import { NextRequest } from "next/server";
import { apiOk, apiError } from "@/lib/api-helpers";
import { getSession, saveSession } from "@/lib/store";
import { processDecision } from "@/lib/engine/decision-processor";

// AI narration is now streamed separately via /api/sessions/{id}/narrate

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
  if (session.status !== "active") {
    return apiError(
      "SESSION_NOT_ACTIVE",
      `Session is ${session.status} — decisions are only accepted for active sessions`,
      400
    );
  }

  let body: { choiceId?: string };
  try {
    body = await request.json();
  } catch {
    return apiError("VALIDATION_ERROR", "Invalid JSON body", 400);
  }

  const { choiceId } = body;
  if (!choiceId) {
    return apiError("VALIDATION_ERROR", "choiceId is required", 400);
  }

  let result;
  try {
    result = processDecision(session, choiceId);
  } catch (err) {
    return apiError(
      "INVALID_CHOICE",
      (err as Error).message ?? "Invalid choice",
      400
    );
  }

  const { session: updatedSession, outcomePrompt, nextScene } = result;
  const decisionRecord = updatedSession.decisions[updatedSession.decisions.length - 1];
  await saveSession(updatedSession);

  return apiOk({
    session: {
      id: updatedSession.id,
      status: updatedSession.status,
      decisionCount: updatedSession.decisions.length,
      lastActivityAt: updatedSession.lastActivityAt,
    },
    outcomePrompt,
    choiceText: decisionRecord.choiceText,
    narration: outcomePrompt,
    nextScene,
    isTerminal: updatedSession.status === "completed",
  });
}
