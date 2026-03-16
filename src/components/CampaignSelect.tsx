"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Locale, LocalizedString } from "@/lib/types";

// ─── Manifest types ─────────────────────────────────────────────────────────

interface ManifestScenario {
  id: string;
  title: LocalizedString;
  brief: LocalizedString;
  dates: { start: string; end: string };
  difficulty: string;
  roleCount: number;
}

interface ManifestEra {
  id: string;
  name: LocalizedString;
  dateRange: string;
  scenarios: ManifestScenario[];
}

interface ManifestRegion {
  id: string;
  name: LocalizedString;
  eras: ManifestEra[];
}

// ─── Role info fetched when a scenario is selected ──────────────────────────

interface RoleInfo {
  id: string;
  name: string;
  title: LocalizedString;
  perspective: string;
}

interface ScenarioDetail {
  id: string;
  title: LocalizedString;
  period: LocalizedString;
  dates: { start: string; end: string };
  difficulty: string;
  roles: RoleInfo[];
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface Props {
  regions: ManifestRegion[];
  scenarios: Record<string, ScenarioDetail>;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const LOCALES = [
  { value: "en" as Locale, label: "English" },
  { value: "ja" as Locale, label: "日本語" },
  { value: "zh-CN" as Locale, label: "中文（简体）" },
];

function t(ls: LocalizedString, locale: Locale): string {
  return ls[locale] ?? ls["en"];
}

function formatDateRange(dates: { start: string; end: string }): string {
  const fmt = (d: string) => {
    if (d.startsWith("-")) {
      const year = Math.abs(parseInt(d.split("-")[1]));
      return `${year} BC`;
    }
    // Extract year from ISO-like date
    const parts = d.split("-");
    const year = parseInt(parts[0]);
    if (year < 100) return d; // fallback
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const month = parts[1] ? months[parseInt(parts[1]) - 1] : "";
    const day = parts[2] ? parseInt(parts[2]) : 0;
    return day && month ? `${month} ${day}, ${year}` : month ? `${month} ${year}` : `${year}`;
  };
  const s = fmt(dates.start);
  const e = fmt(dates.end);
  return s === e ? s : `${s} — ${e}`;
}

const REGION_ICONS: Record<string, string> = {
  europe: "⚔",
  asia: "🏯",
  americas: "🗽",
  "africa-middle-east": "🏛",
};

type NavLevel =
  | { step: "region" }
  | { step: "era"; regionId: string }
  | { step: "scenario"; regionId: string; eraId: string; scenarioId: string }
  | { step: "role"; regionId: string; eraId: string; scenarioId: string };

// ─── Labels ─────────────────────────────────────────────────────────────────

function label(key: string, locale: Locale): string {
  const labels: Record<string, Record<Locale, string>> = {
    selectRegion: {
      en: "Select a Region",
      ja: "地域を選択",
      "zh-CN": "选择地区",
    },
    selectEra: {
      en: "Select an Era",
      ja: "時代を選択",
      "zh-CN": "选择时代",
    },
    selectScenario: {
      en: "Select a Scenario",
      ja: "シナリオを選択",
      "zh-CN": "选择场景",
    },
    chooseRole: {
      en: "Choose Your Role",
      ja: "役割を選択",
      "zh-CN": "选择角色",
    },
    back: {
      en: "Back",
      ja: "戻る",
      "zh-CN": "返回",
    },
    begin: {
      en: "Begin Scenario",
      ja: "シナリオを開始",
      "zh-CN": "开始场景",
    },
    starting: {
      en: "Starting…",
      ja: "開始中…",
      "zh-CN": "启动中…",
    },
    language: {
      en: "Language",
      ja: "言語",
      "zh-CN": "语言",
    },
    scenarios_count: {
      en: "scenarios",
      ja: "シナリオ",
      "zh-CN": "个场景",
    },
  };
  return labels[key]?.[locale] ?? labels[key]?.["en"] ?? key;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function CampaignSelect({ regions, scenarios }: Props) {
  const router = useRouter();
  const [nav, setNav] = useState<NavLevel>({ step: "region" });
  const [selectedLocale, setSelectedLocale] = useState<Locale>("en");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goBack = useCallback(() => {
    switch (nav.step) {
      case "era":
        setNav({ step: "region" });
        break;
      case "scenario":
        setNav({ step: "era", regionId: nav.regionId });
        break;
      case "role":
        setNav({ step: "era", regionId: nav.regionId });
        setSelectedRole("");
        break;
    }
  }, [nav]);

  const selectRegion = useCallback((regionId: string) => {
    setNav({ step: "era", regionId });
  }, []);

  const selectScenario = useCallback(
    (regionId: string, eraId: string, scenarioId: string) => {
      const detail = scenarios[scenarioId];
      if (detail) {
        setSelectedRole(detail.roles[0]?.id ?? "");
        setNav({ step: "role", regionId, eraId, scenarioId });
      }
    },
    [scenarios]
  );

  async function startGame(scenarioId: string) {
    setLoading(true);
    setError(null);
    try {
      document.cookie = `tc_locale=${selectedLocale}; path=/; max-age=${7 * 24 * 3600}`;
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId,
          roleId: selectedRole,
          locale: selectedLocale,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error?.message ?? "Failed to start session");
      }
      const { session } = await res.json();
      router.push(`/play/${session.id}`);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  // ─── Render helpers ─────────────────────────────────────────────────────

  const backButton = (
    <button onClick={goBack} style={backBtnStyle}>
      ← {label("back", selectedLocale)}
    </button>
  );

  // ─── Language picker (always visible) ─────────────────────────────────

  const languagePicker = (
    <section style={{ marginBottom: "2rem" }}>
      <h3 style={sectionHeading}>{label("language", selectedLocale)}</h3>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        {LOCALES.map((l) => (
          <button
            key={l.value}
            onClick={() => setSelectedLocale(l.value)}
            style={{
              background:
                selectedLocale === l.value
                  ? "var(--tc-choice-hover)"
                  : "var(--tc-choice-bg)",
              border: `1px solid ${
                selectedLocale === l.value
                  ? "var(--tc-accent)"
                  : "var(--tc-border)"
              }`,
              borderRadius: 4,
              padding: "0.5rem 1rem",
              cursor: "pointer",
              color:
                selectedLocale === l.value
                  ? "var(--tc-text)"
                  : "var(--tc-muted)",
              fontSize: "0.9rem",
              transition: "all 0.15s",
              fontFamily: "inherit",
            }}
          >
            {l.label}
          </button>
        ))}
      </div>
    </section>
  );

  // ─── Step 1: Region selection ─────────────────────────────────────────

  if (nav.step === "region") {
    return (
      <div>
        {languagePicker}
        <h3 style={sectionHeading}>{label("selectRegion", selectedLocale)}</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.75rem",
          }}
        >
          {regions.map((region) => {
            const totalScenarios = region.eras.reduce(
              (sum, era) => sum + era.scenarios.length,
              0
            );
            return (
              <button
                key={region.id}
                onClick={() => selectRegion(region.id)}
                style={regionCardStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--tc-accent)";
                  e.currentTarget.style.background = "var(--tc-choice-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--tc-border)";
                  e.currentTarget.style.background = "var(--tc-surface)";
                }}
              >
                <div style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>
                  {REGION_ICONS[region.id] ?? "🌍"}
                </div>
                <div
                  style={{
                    color: "var(--tc-accent)",
                    fontSize: "1.1rem",
                    marginBottom: "0.25rem",
                  }}
                >
                  {t(region.name, selectedLocale)}
                </div>
                <div style={{ color: "var(--tc-muted)", fontSize: "0.8rem" }}>
                  {selectedLocale === "en"
                    ? `${totalScenarios} scenario${totalScenarios !== 1 ? "s" : ""}`
                    : `${totalScenarios} ${label("scenarios_count", selectedLocale)}`}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── Step 2: Era selection ────────────────────────────────────────────

  if (nav.step === "era") {
    const region = regions.find((r) => r.id === nav.regionId)!;
    return (
      <div>
        {languagePicker}
        {backButton}
        <h3 style={sectionHeading}>
          {t(region.name, selectedLocale)} — {label("selectEra", selectedLocale)}
        </h3>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          {region.eras.map((era) => (
            <div
              key={era.id}
              style={{
                border: "1px solid var(--tc-border)",
                borderRadius: 4,
                background: "var(--tc-surface)",
                overflow: "hidden",
              }}
            >
              {/* Era header */}
              <div
                style={{
                  padding: "1rem 1.25rem 0.5rem",
                  borderBottom: "1px solid var(--tc-border)",
                }}
              >
                <div
                  style={{
                    color: "var(--tc-accent)",
                    fontSize: "1rem",
                    marginBottom: "0.15rem",
                  }}
                >
                  {t(era.name, selectedLocale)}
                </div>
                <div
                  style={{
                    color: "var(--tc-muted)",
                    fontSize: "0.75rem",
                    letterSpacing: "0.1em",
                  }}
                >
                  {era.dateRange}
                </div>
              </div>
              {/* Scenarios in this era */}
              <div style={{ display: "flex", flexDirection: "column" }}>
                {era.scenarios.map((sc, idx) => (
                  <button
                    key={sc.id}
                    onClick={() =>
                      selectScenario(nav.regionId, era.id, sc.id)
                    }
                    style={{
                      ...scenarioRowStyle,
                      borderTop:
                        idx > 0
                          ? "1px solid var(--tc-border)"
                          : "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "var(--tc-choice-hover)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          color: "var(--tc-text)",
                          fontSize: "0.95rem",
                          marginBottom: "0.2rem",
                        }}
                      >
                        {t(sc.title, selectedLocale)}
                      </div>
                      <div
                        style={{
                          color: "var(--tc-muted)",
                          fontSize: "0.8rem",
                        }}
                      >
                        {t(sc.brief, selectedLocale)}
                      </div>
                    </div>
                    <div
                      style={{
                        color: "var(--tc-muted)",
                        fontSize: "0.7rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        marginLeft: "1rem",
                        flexShrink: 0,
                      }}
                    >
                      {sc.difficulty}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Step 3: Role selection ───────────────────────────────────────────

  if (nav.step === "role") {
    const detail = scenarios[nav.scenarioId];
    if (!detail) return null;

    return (
      <div>
        {languagePicker}
        {backButton}

        {/* Scenario card */}
        <div
          style={{
            border: "1px solid var(--tc-border)",
            borderRadius: 4,
            padding: "1.5rem",
            marginBottom: "2rem",
            background: "var(--tc-surface)",
          }}
        >
          <div
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--tc-muted)",
              marginBottom: "0.25rem",
            }}
          >
            {t(detail.period, selectedLocale)} · {detail.difficulty}
          </div>
          <h2
            style={{
              fontSize: "1.4rem",
              fontWeight: "normal",
              color: "var(--tc-accent)",
              margin: "0 0 0.25rem",
            }}
          >
            {t(detail.title, selectedLocale)}
          </h2>
          <div style={{ color: "var(--tc-muted)", fontSize: "0.85rem" }}>
            {formatDateRange(detail.dates)}
          </div>
        </div>

        {/* Role selection */}
        <section style={{ marginBottom: "2rem" }}>
          <h3 style={sectionHeading}>
            {label("chooseRole", selectedLocale)}
          </h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {detail.roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                style={{
                  background:
                    selectedRole === role.id
                      ? "var(--tc-choice-hover)"
                      : "var(--tc-choice-bg)",
                  border: `1px solid ${
                    selectedRole === role.id
                      ? "var(--tc-accent)"
                      : "var(--tc-border)"
                  }`,
                  borderRadius: 4,
                  padding: "1rem 1.25rem",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "background 0.15s, border-color 0.15s",
                  width: "100%",
                  fontFamily: "inherit",
                }}
              >
                <div
                  style={{
                    color: "var(--tc-accent)",
                    fontSize: "1rem",
                    marginBottom: "0.15rem",
                  }}
                >
                  {role.name}
                </div>
                <div style={{ color: "var(--tc-muted)", fontSize: "0.85rem" }}>
                  {t(role.title, selectedLocale)}
                </div>
              </button>
            ))}
          </div>
        </section>

        {error && (
          <div
            style={{
              color: "var(--tc-danger)",
              fontSize: "0.9rem",
              marginBottom: "1rem",
              padding: "0.75rem",
              border: "1px solid var(--tc-danger)",
              borderRadius: 4,
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={() => startGame(nav.scenarioId)}
          disabled={loading || !selectedRole}
          style={{
            width: "100%",
            padding: "0.9rem",
            background: loading ? "var(--tc-border)" : "var(--tc-accent)",
            color: loading ? "var(--tc-muted)" : "#1a1610",
            border: "none",
            borderRadius: 4,
            fontSize: "1rem",
            cursor: loading ? "not-allowed" : "pointer",
            letterSpacing: "0.05em",
            transition: "background 0.15s",
            fontFamily: "inherit",
          }}
        >
          {loading
            ? label("starting", selectedLocale)
            : label("begin", selectedLocale)}
        </button>
      </div>
    );
  }

  return null;
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const sectionHeading: React.CSSProperties = {
  fontSize: "0.75rem",
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  color: "var(--tc-muted)",
  marginBottom: "1rem",
  fontWeight: "normal",
};

const regionCardStyle: React.CSSProperties = {
  background: "var(--tc-surface)",
  border: "1px solid var(--tc-border)",
  borderRadius: 4,
  padding: "1.5rem 1rem",
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.15s",
  fontFamily: "inherit",
};

const scenarioRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: "0.85rem 1.25rem",
  textAlign: "left",
  cursor: "pointer",
  background: "transparent",
  border: "none",
  width: "100%",
  transition: "background 0.15s",
  fontFamily: "inherit",
};

const backBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "var(--tc-muted)",
  cursor: "pointer",
  fontSize: "0.85rem",
  padding: "0.25rem 0",
  marginBottom: "1rem",
  fontFamily: "inherit",
  transition: "color 0.15s",
};
