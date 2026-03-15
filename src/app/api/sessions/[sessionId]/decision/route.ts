import { NextRequest } from "next/server";
import { apiOk, apiError } from "@/lib/api-helpers";
import { getSession, saveSession } from "@/lib/store";
import { processDecision } from "@/lib/engine/decision-processor";
import { generateOutcome, getProviderForSession } from "@/lib/ai/narration";
import { loadScenario, resolve } from "@/lib/engine/scenario-loader";

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
  await saveSession(updatedSession);

  const scenario = loadScenario(session.scenarioId);
  const role = scenario.roles.find((r) => r.id === session.roleId);
  const roleName = role?.name ?? session.roleId;
  const roleTitle = role ? resolve(role.title, session.locale) : "";
  const decisionRecord = updatedSession.decisions[updatedSession.decisions.length - 1];

  let narration = outcomePrompt;
  try {
    const provider = getProviderForSession(updatedSession);
    narration = await generateOutcome(
      provider,
      outcomePrompt,
      decisionRecord.choiceText,
      resolve(scenario.title, session.locale),
      roleName,
      roleTitle,
      session.locale,
      updatedSession.gameState
    );
  } catch {
    // AI failure is non-fatal — use seed text
  }

  return apiOk({
    session: {
      id: updatedSession.id,
      status: updatedSession.status,
      decisionCount: updatedSession.decisions.length,
      lastActivityAt: updatedSession.lastActivityAt,
    },
    narration,
    nextScene,
    isTerminal: updatedSession.status === "completed",
  });
}
