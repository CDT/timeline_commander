# Timeline Commander - Data Model

## Overview

The data model is split into two categories:

1. **Scenario Content** — Static, authored data that defines historical
   campaigns, roles, scenes, and decision points. Stored as structured files
   (YAML) in the repository.
2. **Runtime State** — Dynamic data created during gameplay that tracks
   session progress, decisions, and outcomes. Stored in browser localStorage
   for MVP.

---

## Scenario Content Models

### Scenario

Top-level container for a historical campaign.

```yaml
# content/verdun-1916/scenario.yaml

id: verdun-1916
title: Battle of Verdun
year: 1916
startDate: "1916-02-21"
endDate: "1916-12-18"
location: Verdun-sur-Meuse, France
estimatedDuration: "30-45 minutes"

summary: >
  The longest single battle of World War I, fought between the German
  and French armies on the Western Front in northeast France.

historicalOverview: >
  In February 1916, the German Army launched Operation Gericht, a massive
  offensive aimed at the French fortress city of Verdun. German Chief of
  Staff Erich von Falkenhayn intended to "bleed France white" through a
  war of attrition...

factions:
  - id: german-empire
    name: German Empire
    description: >
      The German Empire under Kaiser Wilhelm II, fighting a two-front war.
  - id: french-republic
    name: French Republic
    description: >
      The French Republic, defending its territory on the Western Front.

realWorldOutcome: >
  The Battle of Verdun ended in a French strategic victory. Germany
  failed to achieve its attrition goals and suffered comparable
  casualties...

roles:
  - falkenhayn
  - civilian-nurse
```

| Field               | Type     | Description                                          |
|---------------------|----------|------------------------------------------------------|
| `id`                | string   | Unique scenario identifier                           |
| `title`             | string   | Display name                                         |
| `year`              | number   | Primary year of the scenario                         |
| `startDate`         | string   | ISO date when the scenario begins                    |
| `endDate`           | string   | ISO date when the scenario ends                      |
| `location`          | string   | Primary geographic location                          |
| `estimatedDuration` | string   | Estimated play time                                  |
| `summary`           | string   | Short description for scenario selection screen      |
| `historicalOverview` | string  | Detailed historical context shown during briefing    |
| `factions`          | Faction[]| Factions involved in the scenario                    |
| `realWorldOutcome`  | string   | What actually happened, shown in session summary     |
| `roles`             | string[] | List of role IDs available in this scenario          |

---

### Faction

A political or military entity involved in the scenario.

```yaml
id: german-empire
name: German Empire
description: >
  The German Empire under Kaiser Wilhelm II...
```

| Field         | Type   | Description                     |
|---------------|--------|---------------------------------|
| `id`          | string | Unique faction identifier       |
| `name`        | string | Display name                    |
| `description` | string | Brief description of the faction|

---

### Role

A playable character within a scenario.

```yaml
# content/verdun-1916/roles/falkenhayn.yaml

id: falkenhayn
name: Erich von Falkenhayn
title: Chief of the German General Staff
type: commander        # "commander" | "civilian"
faction: german-empire

briefing: >
  You are Erich von Falkenhayn, Chief of the German General Staff. You
  have devised Operation Gericht — a plan to attack the French fortress
  city of Verdun, not to capture it, but to draw the French Army into a
  battle of attrition that will bleed them dry...

objectives:
  - Bleed the French Army through attrition at Verdun
  - Maintain political support in Berlin for the continued offensive
  - Manage resource allocation across the Western Front

constraints:
  - Limited reserves available from other fronts
  - Political pressure from Kaiser Wilhelm II
  - Competing demands from Eastern Front commanders
  - Allied offensives expected on the Somme in summer 1916

supportingCharacters:
  - name: Crown Prince Wilhelm
    role: Commander of the 5th Army
    faction: german-empire
    relationship: >
      Subordinate but politically powerful. Commands the forces
      at Verdun directly.
  - name: Philippe Pétain
    role: Commander of the French Second Army
    faction: french-republic
    relationship: >
      Your primary adversary. Known for methodical defensive tactics.
  - name: Kaiser Wilhelm II
    role: German Emperor
    faction: german-empire
    relationship: >
      Your sovereign. Expects results and may withdraw support if
      casualties mount without clear progress.
```

| Field                  | Type                  | Description                                     |
|------------------------|-----------------------|-------------------------------------------------|
| `id`                   | string                | Unique role identifier within the scenario      |
| `name`                 | string                | Character's full name                           |
| `title`                | string                | Character's position or title                   |
| `type`                 | `"commander"` \| `"civilian"` | Role category                          |
| `faction`              | string                | Faction ID this character belongs to            |
| `briefing`             | string                | Narrative introduction shown at session start   |
| `objectives`           | string[]              | Player goals for the session                    |
| `constraints`          | string[]              | Limitations and pressures on the character      |
| `supportingCharacters` | SupportingCharacter[] | Important NPCs the player interacts with        |

---

### Supporting Character

A non-playable character relevant to the player's role.

| Field          | Type   | Description                                     |
|----------------|--------|-------------------------------------------------|
| `name`         | string | Character's full name                           |
| `role`         | string | Character's position or title                   |
| `faction`      | string | Faction ID                                      |
| `relationship` | string | Relationship to the player character             |

---

### Scene

A narrative unit containing context, text, and a decision point.

```yaml
# content/verdun-1916/scenes/scene-01-opening.yaml

id: scene-01-opening
title: The Eve of Operation Gericht
sequenceNumber: 1
date: "1916-02-20"
location: German Supreme Command, Charleville-Mézières

narrative: >
  It is February 20, 1916. Tomorrow morning, the largest bombardment in
  military history is scheduled to begin. Over 1,200 artillery pieces are
  positioned along a narrow front facing the French fortress city of
  Verdun...

contextNote: >
  Historically, the bombardment began at 07:15 on February 21 after a
  one-day delay due to poor weather.

aiPromptContext: >
  The player is deciding whether to proceed with the historically planned
  attack or make changes. Maintain tension around weather uncertainty and
  the risk of losing surprise. The player does not yet know French
  defensive preparations.

choices:
  - id: choice-01a
    text: Proceed with the bombardment as planned at dawn
    shortLabel: Attack at dawn
    hint: The element of surprise favors immediate action
    nextSceneId: scene-02-bombardment-immediate
    variableEffects:
      germanMorale: +5
      politicalSupport: +3
    flagsSet:
      - attacked_on_schedule

  - id: choice-01b
    text: Delay the attack by 48 hours to bring up more ammunition
    shortLabel: Delay 48 hours
    hint: More preparation could increase initial impact
    nextSceneId: scene-02-bombardment-delayed
    variableEffects:
      reserves: -5
      politicalSupport: -3
    flagsSet:
      - delayed_initial_attack

  - id: choice-01c
    text: Request a meeting with Crown Prince Wilhelm to reassess objectives
    shortLabel: Reassess with Wilhelm
    hint: Political alignment may matter as much as military readiness
    nextSceneId: scene-02-reassessment
    variableEffects:
      politicalSupport: -5
    flagsSet:
      - wilhelm_disagreement

conditions:
  requiredFlags: []
  forbiddenFlags: []
```

| Field             | Type      | Description                                          |
|-------------------|-----------|------------------------------------------------------|
| `id`              | string    | Unique scene identifier                              |
| `title`           | string    | Display title for the scene                          |
| `sequenceNumber`  | number    | Ordering position in the scenario                    |
| `date`            | string    | In-game date when this scene occurs                  |
| `location`        | string    | Where this scene takes place                         |
| `narrative`       | string    | Main narrative text displayed to the player          |
| `contextNote`     | string    | Historical context shown alongside the narrative     |
| `aiPromptContext` | string    | Instructions for AI when generating narration        |
| `choices`         | Choice[]  | Available player decisions                           |
| `conditions`      | object    | Flags required/forbidden for this scene to appear    |

---

### Choice

A player decision within a scene.

| Field             | Type              | Description                                        |
|-------------------|-------------------|----------------------------------------------------|
| `id`              | string            | Unique choice identifier within the scene          |
| `text`            | string            | Full choice description shown to the player        |
| `shortLabel`      | string            | Abbreviated label for compact display              |
| `hint`            | string            | Optional hint about the choice's implications      |
| `nextSceneId`     | string            | Scene to transition to after this choice           |
| `variableEffects` | Record<string, number> | Changes to scenario variables                |
| `flagsSet`        | string[]          | Flags added to game state when this choice is made |

---

## Runtime State Models

### GameSession

Represents an active or completed play session.

```typescript
interface GameSession {
  sessionId: string;
  scenarioId: string;
  roleId: string;
  status: "active" | "complete";
  createdAt: string;          // ISO timestamp
  updatedAt: string;          // ISO timestamp
  state: GameState;
}
```

| Field        | Type                     | Description                          |
|--------------|--------------------------|--------------------------------------|
| `sessionId`  | string                   | Unique session identifier            |
| `scenarioId` | string                   | Scenario being played                |
| `roleId`     | string                   | Role the player selected             |
| `status`     | `"active"` \| `"complete"` | Current session status             |
| `createdAt`  | string                   | When the session was created         |
| `updatedAt`  | string                   | Last state update timestamp          |
| `state`      | GameState                | Current game state                   |

---

### GameState

Tracks the player's progress and the current state of the scenario.

```typescript
interface GameState {
  currentSceneId: string;
  turnNumber: number;
  currentDate: string;        // In-game date
  location: string;           // Current in-game location
  variables: Record<string, number>;
  flags: string[];
  decisionHistory: Decision[];
}
```

| Field             | Type                    | Description                                  |
|-------------------|-------------------------|----------------------------------------------|
| `currentSceneId`  | string                  | The scene the player is currently in         |
| `turnNumber`      | number                  | Number of decisions made so far              |
| `currentDate`     | string                  | In-game calendar date                        |
| `location`        | string                  | Player's current in-game location            |
| `variables`       | Record<string, number>  | Numeric state variables (morale, resources)  |
| `flags`           | string[]                | Boolean state flags set by previous choices  |
| `decisionHistory` | Decision[]              | Ordered list of all decisions made           |

#### Default Variables (Verdun Campaign)

| Variable           | Initial Value | Description                                  |
|--------------------|---------------|----------------------------------------------|
| `germanMorale`     | 80            | German army morale (0-100)                   |
| `frenchMorale`     | 75            | French army morale (0-100)                   |
| `politicalSupport` | 70            | Political support for the player's strategy  |
| `reserves`         | 100           | Available reserve forces (percentage)        |

---

### Decision

A record of a single player decision.

```typescript
interface Decision {
  turnNumber: number;
  sceneId: string;
  choiceId: string;
  choiceText: string;
  timestamp: string;          // ISO timestamp
}
```

| Field        | Type   | Description                                 |
|--------------|--------|---------------------------------------------|
| `turnNumber` | number | Which turn this decision was made on        |
| `sceneId`    | string | The scene where the decision was made       |
| `choiceId`   | string | The choice the player selected              |
| `choiceText` | string | Display text of the selected choice         |
| `timestamp`  | string | When the decision was submitted             |

---

### SessionSummary

Generated after a session completes, comparing player outcomes to real
history.

```typescript
interface SessionSummary {
  sessionId: string;
  scenarioId: string;
  roleId: string;
  playerOutcome: {
    title: string;
    narrative: string;         // AI-generated summary of player's path
    keyDecisions: KeyDecision[];
    finalState: Record<string, number>;
  };
  historicalComparison: {
    title: string;
    narrative: string;         // Summary of what actually happened
    keyDivergences: Divergence[];
  };
  analysisNarrative: string;   // AI comparison of player vs. history
  replayPrompt: string;        // Suggestion for a different approach
}

interface KeyDecision {
  turnNumber: number;
  decision: string;
  impact: string;
}

interface Divergence {
  description: string;
  consequence: string;
}
```

---

## Content File Structure

Scenario content is organized in the repository as follows:

```
content/
└── verdun-1916/
    ├── scenario.yaml              # Scenario metadata
    ├── history.yaml               # Detailed historical timeline
    ├── roles/
    │   ├── falkenhayn.yaml        # Commander role
    │   └── civilian-nurse.yaml    # Civilian role
    └── scenes/
        ├── scene-01-opening.yaml
        ├── scene-02-bombardment-immediate.yaml
        ├── scene-02-bombardment-delayed.yaml
        ├── scene-02-reassessment.yaml
        ├── scene-03-counterattack.yaml
        ├── scene-04-attrition.yaml
        └── ...
```

### Adding a New Scenario

To add a new campaign:

1. Create a new directory under `content/` with the scenario ID
2. Add `scenario.yaml` with metadata, factions, and overview
3. Add `history.yaml` with the historical timeline
4. Add role files under `roles/`
5. Add scene files under `scenes/`
6. Each scene must define its choices, variable effects, and next scene links

No code changes are required to add new scenarios. The scenario loader reads
all directories under `content/` and registers them automatically.

---

## State Flow Diagram

```
  Session Created
       │
       ▼
  ┌──────────┐     Player selects     ┌──────────────┐
  │  Scene    │────────choice────────▶ │  Game Engine  │
  │  Loaded   │                        │  Processes    │
  └──────────┘                         └──────┬───────┘
       ▲                                      │
       │                               ┌──────▼───────┐
       │                               │  Apply        │
       │                               │  Variable     │
       │                               │  Effects      │
       │                               └──────┬───────┘
       │                                      │
       │                               ┌──────▼───────┐
       │                               │  AI Generates │
       │                               │  Narration    │
       │                               └──────┬───────┘
       │                                      │
       │      Load next scene                 │
       └──────────────────────────────────────┘
                                              │
                                      (if scenario ends)
                                              │
                                       ┌──────▼───────┐
                                       │  Generate     │
                                       │  Summary      │
                                       └──────────────┘
```

---

## Relationships

```
Scenario
 ├── has many Factions
 ├── has many Roles
 │    └── has many SupportingCharacters
 └── has many Scenes
      └── has many Choices
           └── points to next Scene

GameSession
 ├── references one Scenario
 ├── references one Role
 ├── contains one GameState
 │    ├── references current Scene
 │    ├── tracks Variables
 │    ├── tracks Flags
 │    └── contains many Decisions
 └── generates one SessionSummary (on completion)
```
