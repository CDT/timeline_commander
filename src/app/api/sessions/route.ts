import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { apiCreated, apiError } from "@/lib/api-helpers";
import {
  loadScenario,
} from "@/lib/engine/scenario-loader";
import { saveSession } from "@/lib/store";
import { isLocale, VALID_MODELS, DEFAULT_PROVIDER } from "@/lib/types";
import type { GameSession, Locale, AiProviderName } from "@/lib/types";
// AI narration is now streamed separately via /api/sessions/{id}/narrate

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: {
    scenarioId?: string;
    roleId?: string;
    locale?: string;
    aiProvider?: { provider?: string; model?: string };
  };

  try {
    body = await request.json();
  } catch {
    return apiError("VALIDATION_ERROR", "Invalid JSON body", 400);
  }

  const { scenarioId, roleId, locale: localeParam, aiProvider: aiParam } = body;

  if (!scenarioId) return apiError("VALIDATION_ERROR", "scenarioId is required", 400);
  if (!roleId) return apiError("VALIDATION_ERROR", "roleId is required", 400);

  const locale: Locale = isLocale(localeParam) ? localeParam : "en";
  if (localeParam && !isLocale(localeParam)) {
    return apiError("INVALID_LOCALE", "Locale must be one of: en, ja, zh-CN", 400);
  }

  let scenario;
  try {
    scenario = loadScenario(scenarioId);
  } catch {
    return apiError("SCENARIO_NOT_FOUND", `Scenario not found: ${scenarioId}`, 404);
  }

  const role = scenario.roles.find((r) => r.id === roleId);
  if (!role) {
    return apiError("ROLE_NOT_FOUND", `Role not found: ${roleId}`, 404);
  }

  // Validate AI provider if provided
  const providerName: AiProviderName =
    (aiParam?.provider as AiProviderName) ??
    (process.env.AI_PROVIDER as AiProviderName) ??
    DEFAULT_PROVIDER.provider;
  const validProviders = Object.keys(VALID_MODELS) as AiProviderName[];
  if (!validProviders.includes(providerName)) {
    return apiError(
      "INVALID_AI_PROVIDER",
      `Provider must be one of: ${validProviders.join(", ")}`,
      400
    );
  }
  const defaultModel = VALID_MODELS[providerName][0];
  const model = aiParam?.model ?? defaultModel;
  if (!VALID_MODELS[providerName].includes(model)) {
    return apiError(
      "INVALID_AI_MODEL",
      `Model "${model}" is not valid for provider "${providerName}"`,
      400
    );
  }

  const now = new Date().toISOString();
  const session: GameSession = {
    id: uuidv4(),
    scenarioId,
    roleId,
    locale,
    currentSceneId: role.startingSceneId,
    status: "active",
    gameState: {
      variables: { ...role.initialState },
      sceneHistory: [],
    },
    decisions: [],
    aiProvider: { provider: providerName, model },
    startedAt: now,
    completedAt: null,
    lastActivityAt: now,
  };

  await saveSession(session);

  return apiCreated({
    session: sessionMeta(session),
  });
}

function sessionMeta(s: GameSession) {
  return {
    id: s.id,
    scenarioId: s.scenarioId,
    roleId: s.roleId,
    locale: s.locale,
    status: s.status,
    startedAt: s.startedAt,
    lastActivityAt: s.lastActivityAt,
    decisionCount: s.decisions.length,
    aiProvider: s.aiProvider,
  };
}
