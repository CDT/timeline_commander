import type { ResolvedScene } from "@/lib/types";

interface Props {
  narration: string;
  nextScene: ResolvedScene | null;
  isTerminal: boolean;
  isStreaming: boolean;
  onContinue: () => void;
}

export default function OutcomeView({
  narration,
  isTerminal,
  isStreaming,
  onContinue,
}: Props) {
  return (
    <div>
      <div
        style={{
          fontSize: "0.7rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--tc-muted)",
          marginBottom: "1.25rem",
        }}
      >
        Consequence
      </div>

      <div
        className="tc-prose"
        style={{ color: "var(--tc-text)", lineHeight: 1.85, marginBottom: "2.5rem" }}
      >
        {narration ? (
          narration.split("\n").filter(Boolean).map((para, i) => (
            <p key={i}>{para}</p>
          ))
        ) : isStreaming ? (
          <p style={{ color: "var(--tc-muted)" }}>
            <span className="tc-pulse">...</span>
          </p>
        ) : null}
        {isStreaming && narration && (
          <span className="tc-cursor" />
        )}
      </div>

      {!isStreaming && (
        <button
          onClick={onContinue}
          style={{
            width: "100%",
            padding: "0.9rem",
            background: "var(--tc-accent)",
            color: "#1a1610",
            border: "none",
            borderRadius: 4,
            fontSize: "1rem",
            cursor: "pointer",
            letterSpacing: "0.05em",
            fontFamily: "inherit",
          }}
        >
          {isTerminal ? "View Summary" : "Continue"}
        </button>
      )}
    </div>
  );
}
