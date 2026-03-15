# Timeline Commander — Data Model

## Overview

Data is divided into two categories:

- **Content data** — authored scenario definitions, stored as JSON files in the repository under `/content/scenarios/`. Read-only at runtime.
- **Runtime data** — active game sessions and their state, stored in Vercel KV. Mutable during gameplay.

---

## Content Data

### Scenario

The top-level container for a historical campaign. One scenario = one playable campaign.

```ts
interface Scenario {
  id: string;                     // e.g. "verdun-1916"
  title: string;                  // e.g. "Battle of Verdun"
  period: string;                 // e.g. "World War I"
  dates: {
    start: string;                // ISO 8601, e.g. "1916-02-21"
    end: string;                  // ISO 8601, e.g. "1916-12-18"
  };
  location: string;               // e.g. "Verdun, France"
  historicalOverview: string;     // Factual background, 2–4 paragraphs
  realWorldOutcome: string;       // What actually happened
  keyFigures: Character[];        // Supporting historical figures
  roles: Role[];                  // Playable roles
  sceneIds: string[];             // Ordered list of scene IDs (entry points)
  tags: string[];                 // e.g. ["WWI", "military", "France"]
  difficulty: "introductory" | "intermediate" | "advanced";
}
```

**File location:** `content/scenarios/{id}/scenario.json`

---

### Role

A playable character within a scenario. Can be a historical figure or a civilian archetype.

```ts
interface Role {
  id: string;                     // e.g. "falkenhayn", "verdun-nurse"
  scenarioId: string;
  name: string;                   // e.g. "Erich von Falkenhayn"
  title: string;                  // e.g. "Chief of the German General Staff"
  perspective: "commander" | "political" | "civilian" | "journalist" | "other";
  isHistoricalFigure: boolean;
  briefing: string;               // In-character intro, 1–3 paragraphs
  objectives: string[];           // What the player is trying to achieve
  constraints: string[];          // What limits the player's options
  pressures: string[];            // Forces acting on the character
  startingSceneId: string;        // First scene for this role
  initialState: Partial<GameState>; // Role-specific starting variables
}
```

**Stored inside:** `content/scenarios/{id}/scenario.json` under `roles`

---

### Scene

A single narrative moment in the scenario. Scenes are the units of gameplay — the player reads a scene and makes a decision.

```ts
interface Scene {
  id: string;                     // e.g. "verdun-1916-scene-001"
  scenarioId: string;
  title: string;                  // Brief internal label
  date: string;                   // In-world date, e.g. "February 21, 1916"
  location: string;               // e.g. "German General Headquarters, Mézières"
  narrativePrompt: string;        // Seed text for AI to expand into full narration
  situationReport: string[];      // Bullet-point facts about current state
  objectives: string[];           // What the player must consider
  constraints: string[];          // Limits on available actions
  choices: Choice[];              // Decision options presented to the player
  roleFilter?: string[];          // If set, only show to these role IDs
  isTerminal: boolean;            // True if this is the last scene (ends session)
  historicalNote?: string;        // Optional factual aside shown to player
}
```

**File location:** `content/scenarios/{id}/scenes/{scene-id}.json`

---

### Choice

One option within a scene's decision set. Presented as a button/tap target to the player.

```ts
interface Choice {
  id: string;                     // e.g. "scene-001-choice-a"
  text: string;                   // The option text shown to the player
  historicalContext: string;      // Internal note on historical grounding (not shown)
  outcomePrompt: string;          // Seed text for AI to generate consequence narration
  nextSceneId: string | null;     // Null = AI determines next scene from pool
  nextScenePool?: string[];       // Candidate scene IDs when nextSceneId is null
  stateChanges: StateChange[];    // Variables modified by this choice
  conditions?: Condition[];       // If set, choice only appears when conditions are met
}
```

---

### StateChange

A mutation to apply to `GameState` when a choice is made.

```ts
interface StateChange {
  variable: string;               // Key in GameState.variables
  operation: "set" | "increment" | "decrement" | "toggle" | "append";
  value: string | number | boolean;
}
```

---

### Condition

A predicate evaluated against `GameState` to control whether a choice is available.

```ts
interface Condition {
  variable: string;
  operator: "eq" | "neq" | "gt" | "lt" | "gte" | "lte" | "contains";
  value: string | number | boolean;
}
```

---

### Character

A non-playable historical figure referenced within a scenario for context.

```ts
interface Character {
  id: string;
  name: string;
  role: string;                   // e.g. "French Army Commander"
  faction: string;                // e.g. "France", "Germany", "Civilian"
  description: string;            // 1–2 sentence introduction
}
```

---

### HistoricalRecord

Factual baseline for a scenario, used to construct the session summary comparison.

```ts
interface HistoricalRecord {
  scenarioId: string;
  timeline: HistoricalEvent[];    // Chronological key events
  outcome: string;                // What actually happened
  casualties?: string;
  significance: string;           // Why it mattered historically
  furtherReading?: string[];      // Optional reference titles
}

interface HistoricalEvent {
  date: string;
  description: string;
}
```

**File location:** `content/scenarios/{id}/history.json`

---

## Runtime Data

### GameSession

Represents an active or completed play session. Stored in Vercel KV, keyed by `id`.

```ts
interface GameSession {
  id: string;                     // UUID v4
  scenarioId: string;
  roleId: string;
  currentSceneId: string;
  status: "active" | "completed" | "abandoned";
  gameState: GameState;
  decisions: DecisionRecord[];
  startedAt: string;              // ISO 8601
  completedAt: string | null;     // ISO 8601, set when status = "completed"
  lastActivityAt: string;         // ISO 8601, used for TTL management
}
```

**KV key pattern:** `session:{id}`
**TTL:** 7 days from `lastActivityAt`

---

### GameState

Mutable variables tracked across scenes within a session. Drives branching and outcome generation.

```ts
interface GameState {
  sessionId: string;
  variables: Record<string, string | number | boolean>;  // Scenario-defined state
  flags: string[];                // String tags set by choices (e.g. "committed-forces")
  resources: Record<string, number>; // Named resource pools (e.g. "troopMorale": 72)
  relationships: Record<string, number>; // Named relationship scores (-100 to 100)
  sceneHistory: string[];         // Ordered list of visited scene IDs
}
```

`variables`, `resources`, and `relationships` keys are defined per-scenario in `scenario.json`. The game engine validates that only declared keys are written.

---

### DecisionRecord

A single player decision, recorded for session history and summary generation.

```ts
interface DecisionRecord {
  sceneId: string;
  choiceId: string;
  choiceText: string;             // Snapshot of choice text at time of decision
  outcomeNarration: string;       // AI-generated consequence text
  stateSnapshotAfter: GameState;  // Full state after this decision was applied
  decidedAt: string;              // ISO 8601
}
```

---

### SessionSummary

Generated at session end. Not stored — constructed on demand from session data and the historical record.

```ts
interface SessionSummary {
  sessionId: string;
  scenarioId: string;
  roleId: string;
  roleName: string;
  status: "completed" | "abandoned";
  decisionCount: number;
  decisions: DecisionRecord[];
  alternateHistoryNarrative: string;  // AI-generated: what the player's choices led to
  realHistoricalOutcome: string;      // From HistoricalRecord.outcome
  divergenceAnalysis: string;         // AI-generated: where/why paths diverged
  keyInfluences: string[];            // Top 3–5 decisions that most shaped the outcome
  generatedAt: string;                // ISO 8601
}
```

---

## Entity Relationships

```
Scenario ──< Role          (one scenario has many roles)
Scenario ──< Scene         (one scenario has many scenes)
Scene    ──< Choice        (one scene has 2–4 choices)
Choice   ──< StateChange   (one choice has 0–N state changes)
Choice   ──< Condition     (one choice has 0–N visibility conditions)
Scenario ──  HistoricalRecord  (one-to-one)

GameSession  →  Scenario    (session belongs to a scenario)
GameSession  →  Role        (session belongs to a role)
GameSession  →  Scene       (session tracks current scene)
GameSession ──< DecisionRecord  (session has ordered decisions)
GameSession  →  GameState   (session has current state)
```

---

## Content File Layout

```
content/
  scenarios/
    verdun-1916/
      scenario.json        # Scenario, Role[], Character[] definitions
      history.json         # HistoricalRecord
      scenes/
        scene-001.json     # Scene with embedded Choice[]
        scene-002.json
        scene-003.json
        ...
```

---

## Validation Rules

- A `Scene` must have between 2 and 4 `Choice` entries.
- `Choice.nextSceneId` and `Choice.nextScenePool` are mutually exclusive; at least one must be set.
- `StateChange.variable` must match a key declared in `Scenario.roles[].initialState` or a scenario-level variables manifest.
- `GameSession.decisions` are append-only; past records are never mutated.
- `GameState.sceneHistory` must not contain the same scene ID twice (guards against loops).
