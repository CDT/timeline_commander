import { loadScenario } from "@/lib/engine/scenario-loader";
import ScenarioSelect from "@/components/ScenarioSelect";

export default function HomePage() {
  const scenario = (() => {
    try {
      return loadScenario("verdun-1916");
    } catch {
      return null;
    }
  })();

  return (
    <main
      style={{
        maxWidth: 600,
        margin: "0 auto",
        padding: "2rem 1rem",
        minHeight: "100dvh",
      }}
    >
      <header style={{ marginBottom: "3rem", textAlign: "center" }}>
        <div
          style={{
            fontSize: "0.75rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--tc-muted)",
            marginBottom: "0.5rem",
          }}
        >
          Historical Role-Playing
        </div>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "normal",
            color: "var(--tc-accent)",
            margin: 0,
            letterSpacing: "0.05em",
          }}
        >
          Timeline Commander
        </h1>
        <p
          style={{
            marginTop: "1rem",
            color: "var(--tc-muted)",
            fontSize: "0.95rem",
          }}
        >
          Step into history. Make decisions that changed the world.
        </p>
      </header>

      {scenario ? (
        <ScenarioSelect
          scenarioId={scenario.id}
          title={scenario.title.en}
          period={scenario.period.en}
          dates={scenario.dates}
          difficulty={scenario.difficulty}
          roles={scenario.roles.map((r) => ({
            id: r.id,
            name: r.name,
            title: r.title.en,
            perspective: r.perspective,
          }))}
        />
      ) : (
        <p style={{ color: "var(--tc-muted)", textAlign: "center" }}>
          No scenarios available.
        </p>
      )}

      <footer
        style={{
          marginTop: "4rem",
          textAlign: "center",
          color: "var(--tc-muted)",
          fontSize: "0.8rem",
          borderTop: "1px solid var(--tc-border)",
          paddingTop: "1.5rem",
        }}
      >
        Historical content is based on documented records. AI-generated
        narration is constrained by historical facts.
      </footer>
    </main>
  );
}
