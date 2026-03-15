interface Props {
  scenarioTitle: string;
  roleName: string;
  roleTitle: string;
  date: string;
  location: string;
}

export default function StatusBar({
  scenarioTitle,
  roleName,
  roleTitle,
  date,
  location,
}: Props) {
  return (
    <div
      style={{
        background: "var(--tc-surface)",
        borderBottom: "1px solid var(--tc-border)",
        padding: "0.75rem 1rem",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div
        style={{
          fontSize: "0.7rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--tc-muted)",
          marginBottom: "0.2rem",
        }}
      >
        {scenarioTitle}
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem 1.25rem",
          alignItems: "baseline",
        }}
      >
        <span style={{ color: "var(--tc-accent)", fontSize: "0.95rem" }}>
          {roleName}
        </span>
        <span
          style={{
            color: "var(--tc-muted)",
            fontSize: "0.8rem",
            fontStyle: "italic",
          }}
        >
          {roleTitle}
        </span>
        <span
          style={{
            color: "var(--tc-muted)",
            fontSize: "0.8rem",
            marginLeft: "auto",
          }}
        >
          {date} · {location}
        </span>
      </div>
    </div>
  );
}
