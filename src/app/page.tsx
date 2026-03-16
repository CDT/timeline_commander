import fs from "fs";
import path from "path";
import { loadScenario } from "@/lib/engine/scenario-loader";
import CampaignSelect from "@/components/CampaignSelect";

interface ManifestScenario {
  id: string;
}

interface ManifestEra {
  scenarios: ManifestScenario[];
}

interface ManifestRegion {
  eras: ManifestEra[];
}

interface Manifest {
  regions: ManifestRegion[];
}

function loadManifest() {
  const filePath = path.join(process.cwd(), "content", "manifest.json");
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as Manifest;
}

export default function HomePage() {
  const manifest = loadManifest();
  if (!manifest) {
    return (
      <main style={{ maxWidth: 600, margin: "0 auto", padding: "2rem 1rem" }}>
        <p style={{ color: "var(--tc-muted)", textAlign: "center" }}>
          No scenarios available.
        </p>
      </main>
    );
  }

  // Pre-load scenario details for all scenarios in the manifest
  const scenarioDetails: Record<string, unknown> = {};
  for (const region of manifest.regions) {
    for (const era of region.eras) {
      for (const sc of era.scenarios) {
        try {
          const full = loadScenario(sc.id);
          scenarioDetails[sc.id] = {
            id: full.id,
            title: full.title,
            period: full.period,
            dates: full.dates,
            difficulty: full.difficulty,
            roles: full.roles.map((r) => ({
              id: r.id,
              name: r.name,
              title: r.title,
              perspective: r.perspective,
            })),
          };
        } catch {
          // Scenario not yet available — skip
        }
      }
    }
  }

  // Filter manifest to only include scenarios that loaded successfully
  const filteredRegions = manifest.regions
    .map((region) => ({
      ...region,
      eras: region.eras
        .map((era) => ({
          ...era,
          scenarios: era.scenarios.filter((sc) => sc.id in scenarioDetails),
        }))
        .filter((era) => era.scenarios.length > 0),
    }))
    .filter((region) => region.eras.length > 0);

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

      {filteredRegions.length > 0 ? (
        <CampaignSelect
          regions={filteredRegions as never}
          scenarios={scenarioDetails as never}
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
