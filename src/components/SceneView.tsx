import type { ResolvedScene } from "@/lib/types";

interface Props {
  scene: ResolvedScene;
  narrative: string;
  submitting: boolean;
  onChoose: (choiceId: string) => void;
}

export default function SceneView({
  scene,
  narrative,
  submitting,
  onChoose,
}: Props) {
  return (
    <div>
      {/* Narrative */}
      <div
        className="tc-prose"
        style={{
          color: "var(--tc-text)",
          lineHeight: 1.85,
          marginBottom: "2rem",
        }}
      >
        {narrative.split("\n").filter(Boolean).map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      {/* Situation Report */}
      {scene.situationReport.length > 0 && (
        <section
          style={{
            background: "var(--tc-surface)",
            border: "1px solid var(--tc-border)",
            borderRadius: 4,
            padding: "1rem 1.25rem",
            marginBottom: "2rem",
          }}
        >
          <div style={labelStyle}>Situation Report</div>
          <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
            {scene.situationReport.map((item, i) => (
              <li
                key={i}
                style={{ color: "var(--tc-text)", fontSize: "0.9rem", marginBottom: "0.3rem" }}
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Historical Note */}
      {scene.historicalNote && (
        <aside
          style={{
            borderLeft: "3px solid var(--tc-accent)",
            paddingLeft: "1rem",
            marginBottom: "2rem",
            color: "var(--tc-muted)",
            fontSize: "0.875rem",
            fontStyle: "italic",
          }}
        >
          <div style={{ ...labelStyle, fontStyle: "normal", marginBottom: "0.4rem" }}>
            Historical Note
          </div>
          {scene.historicalNote}
        </aside>
      )}

      {/* Choices */}
      {scene.choices.length > 0 && (
        <section>
          <div style={labelStyle}>{scene.isTerminal ? "One final decision" : "What will you do?"}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {scene.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => onChoose(choice.id)}
                disabled={submitting}
                style={{
                  background: submitting
                    ? "var(--tc-surface)"
                    : "var(--tc-choice-bg)",
                  border: "1px solid var(--tc-border)",
                  borderRadius: 4,
                  padding: "1rem 1.25rem",
                  textAlign: "left",
                  cursor: submitting ? "not-allowed" : "pointer",
                  color: submitting ? "var(--tc-muted)" : "var(--tc-text)",
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                  transition: "background 0.15s, border-color 0.15s",
                  fontFamily: "inherit",
                  width: "100%",
                  opacity: submitting ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!submitting) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "var(--tc-choice-hover)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "var(--tc-accent)";
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "var(--tc-choice-bg)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "var(--tc-border)";
                }}
              >
                {submitting ? (
                  <span className="tc-pulse">{choice.text}</span>
                ) : (
                  choice.text
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      {scene.isTerminal && scene.choices.length === 0 && (
        <div style={{ color: "var(--tc-muted)", textAlign: "center", marginTop: "2rem" }}>
          — End of Scenario —
        </div>
      )}
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
