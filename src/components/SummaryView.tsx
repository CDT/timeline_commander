"use client";

import { useEffect, useState } from "react";
import type { SessionSummary, ChoiceEvaluation, Locale } from "@/lib/types";

// ─── i18n ─────────────────────────────────────────────────────────────────────

const UI: Record<string, Record<Locale, string>> = {
  sessionComplete:    { en: "Session Complete",           ja: "セッション完了",           "zh-CN": "场景结束" },
  yourAltHistory:     { en: "Your Alternate History",     ja: "あなたの代替歴史",         "zh-CN": "你的架空历史" },
  whatHappened:       { en: "What Actually Happened",     ja: "実際に起こったこと",       "zh-CN": "历史上实际发生了什么" },
  divergence:         { en: "Where Your History Diverged",ja: "歴史が分岐した場所",       "zh-CN": "你的历史在哪里发生了分歧" },
  keyDecisions:       { en: "Key Decisions",              ja: "重要な決定",               "zh-CN": "关键决策" },
  overallPerformance: { en: "Overall Performance",        ja: "総合評価",                 "zh-CN": "综合表现" },
  decisionEval:       { en: "Decision Evaluation",        ja: "決定評価",                 "zh-CN": "决策评估" },
  assessment:         { en: "Assessment",                 ja: "評価",                     "zh-CN": "评估" },
  misled:             { en: "What Might Have Misled You",  ja: "誤解を招いた可能性があるもの", "zh-CN": "可能误导你的因素" },
  trueHistory:        { en: "What Actually Happened",     ja: "実際の歴史",               "zh-CN": "历史上实际发生了什么" },
  allOptionsGraded:   { en: "All Options Graded",         ja: "全選択肢の評価",           "zh-CN": "所有选项评分" },
  yourChoice:         { en: "YOUR CHOICE",                ja: "あなたの選択",             "zh-CN": "你的选择" },
  returnHome:         { en: "Return to Home",             ja: "ホームに戻る",             "zh-CN": "返回主页" },
  generating:         { en: "Generating your alternate history…", ja: "代替歴史を生成中…", "zh-CN": "正在生成你的架空历史…" },
  failed:             { en: "Failed to load summary.",     ja: "サマリーの読み込みに失敗しました。", "zh-CN": "加载摘要失败。" },
  decision:           { en: "Decision",                   ja: "決定",                     "zh-CN": "决策" },
};

function t(key: string, locale: Locale): string {
  return UI[key]?.[locale] ?? UI[key]?.en ?? key;
}

const gradeLabels: Record<string, Record<Locale, string>> = {
  A: { en: "Excellent — Historically Sound",     ja: "優秀 — 歴史的に正確",       "zh-CN": "优秀 — 历史上准确" },
  B: { en: "Good — Reasonable Strategy",         ja: "良好 — 合理的な戦略",       "zh-CN": "良好 — 合理的策略" },
  C: { en: "Mixed — Some Missteps",              ja: "普通 — いくつかの失策",     "zh-CN": "一般 — 有些失误" },
  D: { en: "Poor — Significant Errors",          ja: "不良 — 重大な過ち",         "zh-CN": "较差 — 重大错误" },
  F: { en: "Failed — Historically Disastrous",   ja: "失敗 — 歴史的に壊滅的",    "zh-CN": "失败 — 历史性灾难" },
};

// ─── Grade visuals ────────────────────────────────────────────────────────────

const GRADE_THEMES: Record<string, { color: string; bg: string; glow: string; gradient: string }> = {
  A: {
    color: "#4ade80",
    bg: "#4ade8015",
    glow: "0 0 24px #4ade8030, 0 0 48px #4ade8010",
    gradient: "linear-gradient(135deg, #4ade8018 0%, #22c55e08 100%)",
  },
  B: {
    color: "#a3e635",
    bg: "#a3e63512",
    glow: "0 0 24px #a3e63525, 0 0 48px #a3e63508",
    gradient: "linear-gradient(135deg, #a3e63515 0%, #84cc1608 100%)",
  },
  C: {
    color: "#facc15",
    bg: "#facc1512",
    glow: "0 0 24px #facc1525, 0 0 48px #facc1508",
    gradient: "linear-gradient(135deg, #facc1515 0%, #eab30808 100%)",
  },
  D: {
    color: "#fb923c",
    bg: "#fb923c12",
    glow: "0 0 24px #fb923c25, 0 0 48px #fb923c08",
    gradient: "linear-gradient(135deg, #fb923c15 0%, #f9731608 100%)",
  },
  F: {
    color: "#f87171",
    bg: "#f8717112",
    glow: "0 0 24px #f8717125, 0 0 48px #f8717108",
    gradient: "linear-gradient(135deg, #f8717115 0%, #ef444408 100%)",
  },
};

function gradeTheme(grade: string) {
  return GRADE_THEMES[grade] ?? GRADE_THEMES["C"];
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  sessionId: string;
  locale: Locale;
}

export default function SummaryView({ sessionId, locale }: Props) {
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDecision, setExpandedDecision] = useState<number | null>(0);

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}/summary`)
      .then((r) => r.json())
      .then((d) => {
        setSummary(d.summary);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [sessionId]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", paddingTop: "3rem" }}>
        <div className="tc-pulse" style={{ color: "var(--tc-muted)", fontSize: "0.95rem" }}>
          {t("generating", locale)}
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div style={{ color: "var(--tc-danger)", padding: "1rem" }}>
        {error ?? t("failed", locale)}
      </div>
    );
  }

  const overallTheme = gradeTheme(summary.overallGrade);

  return (
    <div>
      <div style={labelStyle}>{t("sessionComplete", locale)}</div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "normal", color: "var(--tc-accent)", margin: "0 0 2rem" }}>
        {t("yourAltHistory", locale)}
      </h2>

      {/* Alternate history narrative */}
      <section style={{ marginBottom: "2.5rem" }}>
        <div className="tc-prose" style={{ color: "var(--tc-text)", lineHeight: 1.85 }}>
          {summary.alternateHistoryNarrative.split("\n").filter(Boolean).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </section>

      {/* What actually happened */}
      <section style={{ background: "var(--tc-surface)", border: "1px solid var(--tc-border)", borderRadius: 4, padding: "1.25rem", marginBottom: "2rem" }}>
        <div style={labelStyle}>{t("whatHappened", locale)}</div>
        <p style={{ margin: 0, color: "var(--tc-text)", fontSize: "0.95rem", lineHeight: 1.7 }}>
          {summary.realHistoricalOutcome}
        </p>
      </section>

      {/* Divergence analysis */}
      {summary.divergenceAnalysis && (
        <section style={{ marginBottom: "2rem" }}>
          <div style={labelStyle}>{t("divergence", locale)}</div>
          <div className="tc-prose" style={{ color: "var(--tc-text)", lineHeight: 1.8 }}>
            {summary.divergenceAnalysis.split("\n").filter(Boolean).map((para, i) => (
              <p key={i} style={{ fontSize: "0.95rem" }}>{para}</p>
            ))}
          </div>
        </section>
      )}

      {/* Key influences */}
      {summary.keyInfluences.length > 0 && (
        <section style={{ marginBottom: "2.5rem" }}>
          <div style={labelStyle}>{t("keyDecisions", locale)}</div>
          <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
            {summary.keyInfluences.map((item, i) => (
              <li key={i} style={{ color: "var(--tc-text)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {/* ═══ OVERALL GRADE — hero card ═══ */}
      {summary.overallGrade && (
        <section style={{ marginBottom: "2.5rem" }}>
          <div
            style={{
              background: overallTheme.gradient,
              border: `2px solid ${overallTheme.color}50`,
              borderRadius: 8,
              padding: "2rem 1.5rem",
              textAlign: "center",
              boxShadow: overallTheme.glow,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative large background letter */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: "10rem",
                fontWeight: "bold",
                color: overallTheme.color,
                opacity: 0.06,
                lineHeight: 1,
                pointerEvents: "none",
              }}
            >
              {summary.overallGrade}
            </div>

            <div style={{ ...labelStyle, position: "relative" }}>
              {t("overallPerformance", locale)}
            </div>

            {/* Grade letter */}
            <div
              style={{
                fontSize: "4rem",
                fontWeight: "bold",
                color: overallTheme.color,
                lineHeight: 1,
                marginBottom: "0.4rem",
                textShadow: `0 0 20px ${overallTheme.color}40`,
                position: "relative",
              }}
            >
              {summary.overallGrade}
            </div>

            {/* Grade bar */}
            <div style={{ maxWidth: 200, margin: "0.75rem auto", position: "relative" }}>
              <div style={{ height: 4, background: "var(--tc-border)", borderRadius: 2 }}>
                <div
                  style={{
                    height: "100%",
                    borderRadius: 2,
                    background: `linear-gradient(90deg, ${overallTheme.color}90, ${overallTheme.color})`,
                    width: gradeBarWidth(summary.overallGrade),
                    transition: "width 0.6s ease",
                    boxShadow: `0 0 8px ${overallTheme.color}50`,
                  }}
                />
              </div>
            </div>

            <div
              style={{
                fontSize: "0.8rem",
                letterSpacing: "0.08em",
                color: overallTheme.color,
                marginBottom: "1rem",
                position: "relative",
              }}
            >
              {gradeLabels[summary.overallGrade]?.[locale] ?? gradeLabels[summary.overallGrade]?.en ?? ""}
            </div>

            {summary.overallAssessment && (
              <p style={{ margin: 0, color: "var(--tc-text)", fontSize: "0.95rem", lineHeight: 1.7, textAlign: "left", position: "relative" }}>
                {summary.overallAssessment}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ═══ DECISION-BY-DECISION EVALUATION ═══ */}
      {summary.choiceEvaluations && summary.choiceEvaluations.length > 0 && (
        <section style={{ marginBottom: "2.5rem" }}>
          <div style={labelStyle}>{t("decisionEval", locale)}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {summary.choiceEvaluations.map((evaluation, i) => (
              <EvaluationCard
                key={i}
                index={i}
                evaluation={evaluation}
                locale={locale}
                isExpanded={expandedDecision === i}
                onToggle={() => setExpandedDecision(expandedDecision === i ? null : i)}
              />
            ))}
          </div>
        </section>
      )}

      <a href="/" style={homeLinkStyle}>
        {t("returnHome", locale)}
      </a>
    </div>
  );
}

// ─── Evaluation Card ──────────────────────────────────────────────────────────

function EvaluationCard({
  index,
  evaluation,
  locale,
  isExpanded,
  onToggle,
}: {
  index: number;
  evaluation: ChoiceEvaluation;
  locale: Locale;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const theme = gradeTheme(evaluation.grade);

  return (
    <div
      style={{
        background: theme.gradient,
        border: `1px solid ${theme.color}30`,
        borderLeft: `4px solid ${theme.color}`,
        borderRadius: 6,
        overflow: "hidden",
      }}
    >
      {/* Header — always visible */}
      <button
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          width: "100%",
          padding: "1rem 1.25rem",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          color: "var(--tc-text)",
          fontFamily: "inherit",
          fontSize: "inherit",
        }}
      >
        {/* Grade badge */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 6,
            background: theme.bg,
            border: `2px solid ${theme.color}60`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "1.2rem",
            color: theme.color,
            flexShrink: 0,
            boxShadow: `0 0 12px ${theme.color}20`,
          }}
        >
          {evaluation.grade}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--tc-muted)", marginBottom: "0.15rem" }}>
            {t("decision", locale)} {index + 1} — {evaluation.sceneTitle}
          </div>
          <div style={{ fontSize: "0.9rem", color: "var(--tc-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {evaluation.choiceText}
          </div>
        </div>

        <div style={{ color: "var(--tc-muted)", fontSize: "0.8rem", flexShrink: 0, transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>
          &#9660;
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div style={{ padding: "0 1.25rem 1.25rem", borderTop: `1px solid ${theme.color}20` }}>
          {/* Assessment */}
          <div style={{ marginTop: "1rem" }}>
            <div style={sectionLabel}>{t("assessment", locale)}</div>
            <p style={bodyText}>{evaluation.assessment}</p>
          </div>

          {/* Misleading factors */}
          {evaluation.misleadingFactors && (
            <div style={{ marginTop: "1rem" }}>
              <div style={sectionLabel}>{t("misled", locale)}</div>
              <p style={{ ...bodyText, background: "#f8717110", border: "1px solid #f8717125", borderRadius: 4, padding: "0.75rem" }}>
                {evaluation.misleadingFactors}
              </p>
            </div>
          )}

          {/* True history */}
          {evaluation.historicalChoice && (
            <div style={{ marginTop: "1rem" }}>
              <div style={sectionLabel}>{t("trueHistory", locale)}</div>
              <p style={{ ...bodyText, background: "#4ade8010", border: "1px solid #4ade8020", borderRadius: 4, padding: "0.75rem" }}>
                {evaluation.historicalChoice}
              </p>
            </div>
          )}

          {/* All options graded */}
          {evaluation.allOptions.length > 0 && (
            <div style={{ marginTop: "1.25rem" }}>
              <div style={sectionLabel}>{t("allOptionsGraded", locale)}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {evaluation.allOptions.map((opt) => {
                  const optTheme = gradeTheme(opt.grade);
                  return (
                    <div
                      key={opt.id}
                      style={{
                        display: "flex",
                        gap: "0.65rem",
                        alignItems: "flex-start",
                        padding: "0.6rem 0.75rem",
                        borderRadius: 4,
                        background: opt.wasSelected ? optTheme.bg : "transparent",
                        border: opt.wasSelected ? `1px solid ${optTheme.color}35` : "1px solid var(--tc-border)",
                        borderLeft: `3px solid ${optTheme.color}${opt.wasSelected ? "" : "50"}`,
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 4,
                          background: optTheme.bg,
                          border: `1.5px solid ${optTheme.color}50`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "bold",
                          fontSize: "0.8rem",
                          color: optTheme.color,
                          flexShrink: 0,
                        }}
                      >
                        {opt.grade}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.85rem", color: opt.wasSelected ? "var(--tc-text)" : "var(--tc-muted)", lineHeight: 1.5 }}>
                          {opt.text}
                          {opt.wasSelected && (
                            <span style={{ marginLeft: "0.5rem", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: optTheme.color, verticalAlign: "middle", fontWeight: "bold" }}>
                              {t("yourChoice", locale)}
                            </span>
                          )}
                        </div>
                        {opt.briefAssessment && (
                          <div style={{ fontSize: "0.8rem", color: "var(--tc-muted)", marginTop: "0.25rem", lineHeight: 1.5 }}>
                            {opt.briefAssessment}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function gradeBarWidth(grade: string): string {
  switch (grade) {
    case "A": return "100%";
    case "B": return "80%";
    case "C": return "60%";
    case "D": return "40%";
    case "F": return "20%";
    default:  return "50%";
  }
}

const homeLinkStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "0.9rem",
  background: "var(--tc-choice-bg)",
  border: "1px solid var(--tc-border)",
  borderRadius: 4,
  textAlign: "center",
  color: "var(--tc-text)",
  fontSize: "1rem",
  textDecoration: "none",
  letterSpacing: "0.05em",
  transition: "background 0.15s",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.7rem",
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  color: "var(--tc-muted)",
  marginBottom: "0.75rem",
};

const sectionLabel: React.CSSProperties = {
  fontSize: "0.65rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--tc-muted)",
  marginBottom: "0.4rem",
};

const bodyText: React.CSSProperties = {
  margin: 0,
  fontSize: "0.9rem",
  lineHeight: 1.7,
  color: "var(--tc-text)",
};
