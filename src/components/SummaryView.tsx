"use client";

import { useEffect, useState } from "react";
import type { SessionSummary, Locale } from "@/lib/types";

interface Props {
  sessionId: string;
  locale: Locale;
}

export default function SummaryView({ sessionId, locale }: Props) {
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        <div
          className="tc-pulse"
          style={{ color: "var(--tc-muted)", fontSize: "0.95rem" }}
        >
          Generating your alternate history…
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div style={{ color: "var(--tc-danger)", padding: "1rem" }}>
        {error ?? "Failed to load summary."}
      </div>
    );
  }

  return (
    <div>
      <div style={labelStyle}>Session Complete</div>
      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: "normal",
          color: "var(--tc-accent)",
          margin: "0 0 2rem",
        }}
      >
        Your Alternate History
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
      <section
        style={{
          background: "var(--tc-surface)",
          border: "1px solid var(--tc-border)",
          borderRadius: 4,
          padding: "1.25rem",
          marginBottom: "2rem",
        }}
      >
        <div style={labelStyle}>What Actually Happened</div>
        <p style={{ margin: 0, color: "var(--tc-text)", fontSize: "0.95rem", lineHeight: 1.7 }}>
          {summary.realHistoricalOutcome}
        </p>
      </section>

      {/* Divergence analysis */}
      {summary.divergenceAnalysis && (
        <section style={{ marginBottom: "2rem" }}>
          <div style={labelStyle}>Where Your History Diverged</div>
          <div className="tc-prose" style={{ color: "var(--tc-text)", lineHeight: 1.8 }}>
            {summary.divergenceAnalysis.split("\n").filter(Boolean).map((para, i) => (
              <p key={i} style={{ fontSize: "0.95rem" }}>
                {para}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Key influences */}
      {summary.keyInfluences.length > 0 && (
        <section style={{ marginBottom: "2.5rem" }}>
          <div style={labelStyle}>Key Decisions</div>
          <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
            {summary.keyInfluences.map((item, i) => (
              <li
                key={i}
                style={{ color: "var(--tc-text)", fontSize: "0.9rem", marginBottom: "0.5rem" }}
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Decisions log */}
      <section style={{ marginBottom: "2.5rem" }}>
        <div style={labelStyle}>Your Decisions ({summary.decisionCount})</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {summary.decisions.map((d, i) => (
            <div
              key={i}
              style={{
                borderLeft: "2px solid var(--tc-border)",
                paddingLeft: "0.75rem",
                color: "var(--tc-muted)",
                fontSize: "0.875rem",
              }}
            >
              {d.choiceText}
            </div>
          ))}
        </div>
      </section>

      <a
        href="/"
        style={{
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
        }}
      >
        Play Again
      </a>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: "0.7rem",
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  color: "var(--tc-muted)",
  marginBottom: "0.75rem",
};
