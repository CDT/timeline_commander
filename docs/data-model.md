# Timeline Commander — Data Model

## Overview

Data is divided into two categories:

- **Content data** — authored scenario definitions, stored as JSON files in the repository under `/content/scenarios/`. Read-only at runtime.
- **Runtime data** — active game sessions and their state, stored in Vercel KV. Mutable during gameplay.

---

## Locale Types

Only three locales are supported. No others will be added.

```ts
type Locale = "en" | "ja" | "zh-CN";

// All user-facing strings in content data use this type.
// Every locale key must be present — partial translations are not accepted.
type LocalizedString = Record<Locale, string>;
```

The player's locale is set at session creation and stored on `GameSession`. All content returned by the API is resolved to a single locale string before being sent to the client — `LocalizedString` objects are never exposed in API responses.

---

## AI Provider Types

Used across runtime data to track which AI backend generated content for a session.

```ts
type AiProvider = "claude" | "deepseek";

type ClaudeModel =
  | "claude-sonnet-4-6"
  | "claude-opus-4-6";

type DeepSeekModel =
  | "deepseek-chat"
  | "deepseek-reasoner";

type AiModel = ClaudeModel | DeepSeekModel;

interface AiProviderConfig {
  provider: AiProvider;
  model: AiModel;
}
```

The default provider and model are set via environment variables (`AI_PROVIDER`, `AI_MODEL`). A per-session override is recorded in `GameSession.aiProvider` at creation time.

---

## Content Data

### Scenario

The top-level container for a historical campaign. One scenario = one playable campaign.

```ts
interface Scenario {
  id: string;                         // e.g. "verdun-1916"
  title: LocalizedString;             // e.g. { en: "Battle of Verdun", ja: "ヴェルダンの戦い", "zh-CN": "凡尔登战役" }
  period: LocalizedString;            // e.g. { en: "World War I", ja: "第一次世界大戦", "zh-CN": "第一次世界大战" }
  dates: {
    start: string;                    // ISO 8601, e.g. "1916-02-21"
    end: string;                      // ISO 8601, e.g. "1916-12-18"
  };
  location: LocalizedString;          // e.g. { en: "Verdun, France", ja: "フランス、ヴェルダン", "zh-CN": "法国凡尔登" }
  historicalOverview: LocalizedString;// Factual background, 2–4 paragraphs per locale
  realWorldOutcome: LocalizedString;  // What actually happened
  keyFigures: Character[];            // Supporting historical figures
  roles: Role[];                      // Playable roles
  sceneIds: string[];                 // Ordered list of scene IDs (entry points)
  tags: string[];                     // Internal tags — not localized (e.g. ["WWI", "military"])
  difficulty: "introductory" | "intermediate" | "advanced";
}
```

**File location:** `content/scenarios/{id}/scenario.json`

---

### Role

A playable character within a scenario. Can be a historical figure or a civilian archetype.

```ts
interface Role {
  id: string;                          // e.g. "falkenhayn", "verdun-nurse"
  scenarioId: string;
  name: string;                        // Historical figure name — not localized (proper noun)
  title: LocalizedString;              // e.g. { en: "Chief of the German General Staff", ... }
  perspective: "commander" | "political" | "civilian" | "journalist" | "other";
  isHistoricalFigure: boolean;
  briefing: LocalizedString;           // In-character intro, 1–3 paragraphs per locale
  objectives: LocalizedString[];       // What the player is trying to achieve
  constraints: LocalizedString[];      // What limits the player's options
  pressures: LocalizedString[];        // Forces acting on the character
  startingSceneId: string;
  initialState: Partial<GameState>;    // Role-specific starting variables
}
```

**Stored inside:** `content/scenarios/{id}/scenario.json` under `roles`

---

### Scene

A single narrative moment in the scenario. Scenes are the units of gameplay — the player reads a scene and makes a decision.

```ts
interface Scene {
  id: string;                          // e.g. "verdun-1916-scene-001"
  scenarioId: string;
  title: string;                       // Internal label only — not shown to players
  date: LocalizedString;               // In-world date formatted per locale
  location: LocalizedString;           // e.g. { en: "German GHQ, Mézières", ja: "...", "zh-CN": "..." }
  narrativePrompt: LocalizedString;    // Locale-specific seed text for AI narration expansion
  situationReport: LocalizedString[];  // Bullet-point facts, one LocalizedString per bullet
  objectives: LocalizedString[];       // What the player must consider
  constraints: LocalizedString[];      // Limits on available actions
  choices: Choice[];                   // Decision options presented to the player
  roleFilter?: string[];               // If set, only show to these role IDs
  isTerminal: boolean;                 // True if this is the last scene (ends session)
  historicalNote?: LocalizedString;    // Optional factual aside shown to player
}
```

**File location:** `content/scenarios/{id}/scenes/{scene-id}.json`

---

### Choice

One option within a scene's decision set. Presented as a button/tap target to the player.

```ts
interface Choice {
  id: string;                          // e.g. "scene-001-choice-a"
  text: LocalizedString;               // The option text shown to the player
  historicalContext: string;           // Internal note — not localized, not shown to players
  outcomePrompt: LocalizedString;      // Locale-specific seed text for AI outcome narration
  nextSceneId: string | null;          // Null = AI determines next scene from pool
  nextScenePool?: string[];            // Candidate scene IDs when nextSceneId is null
  stateChanges: StateChange[];         // Variables modified by this choice
  conditions?: Condition[];            // If set, choice only appears when conditions are met
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
  name: string;                   // Proper noun — not localized
  role: LocalizedString;          // e.g. { en: "French Army Commander", ... }
  faction: string;                // Internal identifier — not localized
  description: LocalizedString;   // 1–2 sentence introduction per locale
}
```

---

### HistoricalRecord

Factual baseline for a scenario, used to construct the session summary comparison.

```ts
interface HistoricalRecord {
  scenarioId: string;
  timeline: HistoricalEvent[];         // Chronological key events
  outcome: LocalizedString;            // What actually happened
  casualties?: LocalizedString;
  significance: LocalizedString;       // Why it mattered historically
  furtherReading?: string[];           // Reference titles — kept in original language
}

interface HistoricalEvent {
  date: string;                        // ISO 8601 — formatted for display by the client
  description: LocalizedString;
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
  locale: Locale;                 // Set at creation; fixed for the session's lifetime
  currentSceneId: string;
  status: "active" | "completed" | "abandoned";
  gameState: GameState;
  decisions: DecisionRecord[];
  aiProvider: AiProviderConfig;   // Provider used for narrative generation
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
  aiProvider: AiProviderConfig;   // Provider that generated outcomeNarration
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
  locale: Locale;                     // Locale used for all generated text in this summary
  status: "completed" | "abandoned";
  decisionCount: number;
  decisions: DecisionRecord[];
  alternateHistoryNarrative: string;  // AI-generated in session locale
  realHistoricalOutcome: string;      // Resolved from HistoricalRecord.outcome[locale]
  divergenceAnalysis: string;         // AI-generated in session locale
  keyInfluences: string[];            // Top 3–5 decisions, text in session locale
  aiProvider: AiProviderConfig;       // Provider used to generate this summary
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
      scenario.json        # Scenario, Role[], Character[] — all strings are LocalizedString
      history.json         # HistoricalRecord — all strings are LocalizedString
      scenes/
        scene-001.json     # Scene with embedded Choice[] — all strings are LocalizedString
        scene-002.json
        scene-003.json
        ...
```

All user-facing string fields within these files are `LocalizedString` objects with all three locale keys (`en`, `ja`, `zh-CN`) present. A missing locale key is a content validation error and will prevent the scenario from loading.

---

## Validation Rules

- A `Scene` must have between 2 and 4 `Choice` entries.
- `Choice.nextSceneId` and `Choice.nextScenePool` are mutually exclusive; at least one must be set.
- `StateChange.variable` must match a key declared in `Scenario.roles[].initialState` or a scenario-level variables manifest.
- `GameSession.decisions` are append-only; past records are never mutated.
- `GameState.sceneHistory` must not contain the same scene ID twice (guards against loops).
- Every `LocalizedString` must contain all three keys: `en`, `ja`, `zh-CN`. Partial translations are rejected at content load time.
- `GameSession.locale` must be one of `"en"`, `"ja"`, `"zh-CN"`. No other values are accepted.
- The locale of a session cannot be changed after creation.
