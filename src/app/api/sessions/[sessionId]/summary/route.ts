import { NextRequest } from "next/server";
import { apiOk, apiError } from "@/lib/api-helpers";
import { getSession } from "@/lib/store";
import { buildSummaryInput, assembleSummary } from "@/lib/engine/summary-builder";
import { generateSummary, getProviderForSession } from "@/lib/ai/narration";

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

  const { roleName, realHistoricalOutcome } = buildSummaryInput(session);

  let alternateHistoryNarrative =
    "Your decisions shaped an alternate history that diverged from the real events.";
  let divergenceAnalysis = realHistoricalOutcome;
  let keyInfluences: string[] = session.decisions.map((d) => d.choiceText);

  try {
    const provider = getProviderForSession(session);
    const aiResult = await generateSummary(provider, session);
    alternateHistoryNarrative = aiResult.alternateHistoryNarrative;
    divergenceAnalysis = aiResult.divergenceAnalysis;
    keyInfluences = aiResult.keyInfluences;
  } catch {
    // AI failure — use fallback values
  }

  const summary = assembleSummary(
    session,
    alternateHistoryNarrative,
    divergenceAnalysis,
    keyInfluences
  );

  return apiOk({ summary });
}
