# Timeline Commander — Architecture

## Overview

Timeline Commander is a mobile-first, text-based historical role-playing game that combines authored scenario content with AI-generated narrative. The architecture separates three concerns: **scenario content**, **game state**, and **AI orchestration**.

---

## System Layers

```
┌──────────────────────────────────────────────────────────┐
│                  Web Client (Browser)                    │
│   Next.js · Mobile-first · Text-centric UI              │
│   Scene display · Choice selection · Session summary     │
└─────────────────────────┬────────────────────────────────┘
                          │ HTTPS / fetch
┌─────────────────────────▼────────────────────────────────┐
│              API Layer (Vercel Edge / Serverless)        │
│   Next.js API Routes · REST endpoints                    │
│   Session auth · Input validation · Rate limiting        │
└──────┬─────────────────┬───────────────┬─────────────────┘
       │                 │               │
┌──────▼──────┐  ┌───────▼──────┐  ┌────▼────────────────┐
│ Game Engine │  │  AI Layer    │  │  Content Store      │
│             │  │              │  │                     │
│ State mgmt  │  │ Claude API   │  │ Scenario JSON files │
│ Branching   │  │ Prompt build │  │ Role definitions    │
│ Progression │  │ Constrained  │  │ Scene templates     │
│ Validation  │  │ narration    │  │ Historical baselines│
└──────┬──────┘  └───────┬──────┘  └────────────────────┘
       │                 │
┌──────▼─────────────────▼────────────────────────────────┐
│                   Session Store                         │
│   KV store (Vercel KV / Redis) · Short-lived sessions  │
│   Game state · Decision history · Snapshot per scene   │
└─────────────────────────────────────────────────────────┘
```

---

## Components

### 1. Web Client

**Technology:** Next.js (App Router), deployed to Vercel

- Renders scene narrative, choices, and status bar (role, date, location)
- Submits decisions via API calls; does not hold game logic
- Designed mobile-first: `max-width: 600px` core layout, then scales up
- No client-side game state beyond what the API returns in each response
- Optimistic UI for decision submission; full state refresh from server

### 2. API Layer

**Technology:** Next.js API Routes (Edge Runtime on Vercel)

Thin HTTP interface over the game engine and AI layer. Handles:
- Session creation and retrieval
- Decision submission
- Narrative expansion requests
- Session summary generation

All endpoints are documented in `api.md`.

### 3. Game Engine

**Technology:** TypeScript module, runs server-side

Core logic, independent of HTTP or AI concerns:

- **ScenarioLoader** — reads and validates scenario content files
- **SessionManager** — creates, reads, and updates game sessions
- **DecisionProcessor** — validates choice, applies state changes, resolves next scene
- **StateEvaluator** — checks branching conditions against game state variables
- **SummaryBuilder** — compiles end-of-session comparison report

The game engine never calls the AI layer directly. The API layer coordinates between them.

### 4. AI Orchestration Layer

**Technology:** Anthropic Claude API (claude-sonnet-4-6 or claude-opus-4-6)

Responsible for generating constrained narrative text. Never makes game decisions — it only produces prose. Three operations:

- **expandScene(sceneContext)** — generates immersive opening narration for a scene
- **generateOutcome(decision, gameState)** — writes consequence narration after a choice
- **generateSummary(sessionRecord)** — produces the alternate-history narrative for the session summary

All prompts are built from structured templates that inject scenario content, game state, historical constraints, and character perspective. AI output is constrained to remain historically plausible.

### 5. Content Store

**Technology:** JSON files in `/content/scenarios/`

Each scenario is a directory:

```
content/
  scenarios/
    verdun-1916/
      scenario.json       # metadata, overview, roles, key figures
      scenes/
        scene-001.json
        scene-002.json
        ...
      history.json        # factual baseline and real outcome summary
```

Scenario files are loaded at build time for static content and at request time for session initialization. This keeps the content layer decoupled from the database.

### 6. Session Store

**Technology:** Vercel KV (Redis-compatible key-value store)

Stores active game sessions and their state. Each session is a JSON blob keyed by session ID. Sessions expire after 7 days of inactivity.

For the MVP, anonymous sessions are supported — no user accounts required. Session ID is stored in a browser cookie.

---

## Request Flow: Submitting a Decision

```
Client                   API Layer            Game Engine        AI Layer
  │                          │                    │                 │
  │── POST /sessions/:id/decision ──────────────► │                 │
  │                          │── validateChoice() ►│                 │
  │                          │◄─ valid ────────────│                 │
  │                          │── applyDecision() ──►│                 │
  │                          │◄─ newState ──────────│                 │
  │                          │── generateOutcome() ─────────────────►│
  │                          │◄─ narrationText ──────────────────────│
  │                          │── saveSession() ────►│                 │
  │◄── 200 { scene, narration, state } ──────────── │                 │
```

---

## Deployment

| Component     | Platform              | Notes                              |
|---------------|----------------------|------------------------------------|
| Web client    | Vercel (static/SSR)  | Next.js App Router                 |
| API routes    | Vercel Edge Runtime  | Serverless, low cold-start         |
| Session store | Vercel KV            | Redis-compatible, built-in TTL     |
| Content files | Bundled at build     | Loaded from filesystem             |
| AI calls      | Anthropic API        | claude-sonnet-4-6 for narration    |

---

## Key Design Decisions

**Why file-based content?**
Scenario data is authored, not user-generated. Files are version-controlled alongside code, making scenario authoring a git workflow. No CMS or additional database needed for MVP.

**Why no user accounts for MVP?**
Reduces infrastructure scope. Session ID in a cookie is sufficient for a solo play session. Accounts can be added later for save history and leaderboards.

**Why is the game engine separate from the AI layer?**
Game correctness (valid transitions, state integrity) must not depend on AI output. The engine runs deterministically; AI provides prose only. This makes the game testable without API calls.

**Why Claude for narration?**
The game's quality depends on historically grounded, readable prose that adapts to player choices. Claude's instruction-following and context window make it well-suited to constrained narrative generation.

---

## Future Considerations (Post-MVP)

- User accounts and session persistence across devices
- Campaign authoring tools for content creators
- Multiplayer or cooperative session modes
- Caching AI-generated narration for common decision paths
- Analytics on decision distributions to inform scenario design
