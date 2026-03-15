interface RoleMeta {
  name: string;
  title: string;
  briefing: string;
  objectives: string[];
  constraints: string[];
  pressures: string[];
}

export default function BriefingView({
  roleMeta,
  onContinue,
}: {
  roleMeta: RoleMeta;
  onContinue: () => void;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: "0.7rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--tc-muted)",
          marginBottom: "0.5rem",
        }}
      >
        Role Briefing
      </div>
      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: "normal",
          color: "var(--tc-accent)",
          margin: "0 0 1.5rem",
        }}
      >
        {roleMeta.name}
        <span
          style={{
            display: "block",
            fontSize: "0.9rem",
            color: "var(--tc-muted)",
            fontStyle: "italic",
            marginTop: "0.2rem",
          }}
        >
          {roleMeta.title}
        </span>
      </h2>

      <div
        className="tc-prose"
        style={{ color: "var(--tc-text)", marginBottom: "2rem", lineHeight: 1.8 }}
      >
        {roleMeta.briefing.split("\n").map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      {roleMeta.objectives.length > 0 && (
        <section style={{ marginBottom: "1.5rem" }}>
          <h3 style={sectionHeadStyle}>Your Objectives</h3>
          <ul style={listStyle}>
            {roleMeta.objectives.map((o, i) => (
              <li key={i} style={listItemStyle}>
                {o}
              </li>
            ))}
          </ul>
        </section>
      )}

      {roleMeta.constraints.length > 0 && (
        <section style={{ marginBottom: "1.5rem" }}>
          <h3 style={sectionHeadStyle}>Your Constraints</h3>
          <ul style={listStyle}>
            {roleMeta.constraints.map((c, i) => (
              <li key={i} style={listItemStyle}>
                {c}
              </li>
            ))}
          </ul>
        </section>
      )}

      {roleMeta.pressures.length > 0 && (
        <section style={{ marginBottom: "2rem" }}>
          <h3 style={sectionHeadStyle}>Forces Acting On You</h3>
          <ul style={listStyle}>
            {roleMeta.pressures.map((p, i) => (
              <li key={i} style={listItemStyle}>
                {p}
              </li>
            ))}
          </ul>
        </section>
      )}

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
        Begin
      </button>
    </div>
  );
}

const sectionHeadStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  color: "var(--tc-muted)",
  fontWeight: "normal",
  marginBottom: "0.5rem",
};

const listStyle: React.CSSProperties = {
  margin: 0,
  paddingLeft: "1.25rem",
};

const listItemStyle: React.CSSProperties = {
  marginBottom: "0.4rem",
  color: "var(--tc-text)",
  fontSize: "0.95rem",
};
