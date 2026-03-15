"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale, LocalizedString } from "@/lib/types";

interface RoleInfo {
  id: string;
  name: string;
  title: LocalizedString;
  perspective: string;
}

interface Props {
  scenarioId: string;
  title: LocalizedString;
  period: LocalizedString;
  dates: { start: string; end: string };
  difficulty: string;
  roles: RoleInfo[];
}

const LOCALES = [
  { value: "en" as Locale, label: "English" },
  { value: "ja" as Locale, label: "日本語" },
  { value: "zh-CN" as Locale, label: "中文（简体）" },
];

function t(ls: LocalizedString, locale: Locale): string {
  return ls[locale] ?? ls["en"];
}

export default function ScenarioSelect({
  scenarioId,
  title,
  period,
  dates,
  difficulty,
  roles,
}: Props) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>(roles[0]?.id ?? "");
  const [selectedLocale, setSelectedLocale] = useState<Locale>("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startGame() {
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

      const data = await res.json();
      router.push(`/play/${data.session.id}`);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Language selection — top */}
      <section style={{ marginBottom: "2rem" }}>
        <h3 style={sectionHeading}>Language</h3>
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
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      </section>

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
          {t(period, selectedLocale)} · {difficulty}
        </div>
        <h2
          style={{
            fontSize: "1.4rem",
            fontWeight: "normal",
            color: "var(--tc-accent)",
            margin: "0 0 0.25rem",
          }}
        >
          {t(title, selectedLocale)}
        </h2>
        <div style={{ color: "var(--tc-muted)", fontSize: "0.85rem" }}>
          {dates.start} — {dates.end}
        </div>
      </div>

      {/* Role selection */}
      <section style={{ marginBottom: "2rem" }}>
        <h3 style={sectionHeading}>
          {selectedLocale === "ja"
            ? "役割を選択"
            : selectedLocale === "zh-CN"
            ? "选择角色"
            : "Choose Your Role"}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {roles.map((role) => (
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
        onClick={startGame}
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
          ? selectedLocale === "ja"
            ? "開始中…"
            : selectedLocale === "zh-CN"
            ? "启动中…"
            : "Starting…"
          : selectedLocale === "ja"
          ? "シナリオを開始"
          : selectedLocale === "zh-CN"
          ? "开始场景"
          : "Begin Scenario"}
      </button>
    </div>
  );
}

const sectionHeading: React.CSSProperties = {
  fontSize: "0.75rem",
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  color: "var(--tc-muted)",
  marginBottom: "1rem",
  fontWeight: "normal",
};
