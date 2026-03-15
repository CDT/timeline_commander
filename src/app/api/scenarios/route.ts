import { NextRequest } from "next/server";
import { apiOk, apiError } from "@/lib/api-helpers";
import { listScenarioIds, loadScenario, resolve } from "@/lib/engine/scenario-loader";
import { isLocale } from "@/lib/types";
import type { ScenarioListItem, Locale } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const localeParam = request.nextUrl.searchParams.get("locale") ?? "en";
  if (!isLocale(localeParam)) {
    return apiError("INVALID_LOCALE", `Locale must be one of: en, ja, zh-CN`, 400);
  }
  const locale = localeParam as Locale;

  const ids = listScenarioIds();
  const items: ScenarioListItem[] = ids.map((id) => {
    const s = loadScenario(id);
    return {
      id: s.id,
      title: resolve(s.title, locale),
      period: resolve(s.period, locale),
      dates: s.dates,
      location: resolve(s.location, locale),
      difficulty: s.difficulty,
      tags: s.tags,
      roleCount: s.roles.length,
    };
  });

  return apiOk({ locale, scenarios: items });
}
