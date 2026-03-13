# Timeline Commander - Architecture

## Overview

Timeline Commander is a web-first, mobile-first, text-based historical
role-playing game deployed on Vercel. The architecture prioritizes simplicity,
fast load times, and clean separation between scenario content, game state, and
AI-driven narrative generation.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser Client                    │
│  ┌───────────────┐  ┌──────────┐  ┌──────────────┐ │
│  │  UI Layer      │  │ Game     │  │ Session      │ │
│  │  (Mobile-first │  │ State    │  │ Storage      │ │
│  │   text UI)     │  │ Manager  │  │              │ │
│  └───────┬───────┘  └────┬─────┘  └──────┬───────┘ │
└──────────┼───────────────┼───────────────┼──────────┘
           │               │               │
           ▼               ▼               ▼
┌─────────────────────────────────────────────────────┐
│                   Vercel Backend                     │
│  ┌───────────────┐  ┌──────────────────────────┐    │
│  │  API Routes    │  │  AI Orchestration Layer  │    │
│  │  (Next.js)     │  │  (Prompt Construction +  │    │
│  │               │  │   Response Constraints)  │    │
│  └───────┬───────┘  └────────────┬─────────────┘    │
│          │                       │                   │
│  ┌───────▼───────┐  ┌───────────▼──────────────┐    │
│  │  Game Engine   │  │  Scenario Content Store  │    │
│  │  (State +      │  │  (Structured JSON/YAML)  │    │
│  │   Branching)   │  │                          │    │
│  └───────────────┘  └──────────────────────────┘    │
└──────────────────────────┬──────────────────────────┘
                           │
                           ▼
                 ┌────────────────────┐
                 │   LLM Provider     │
                 │   (Claude API)     │
                 └────────────────────┘
```

## System Components

### 1. UI Layer

A lightweight, text-centric frontend optimized for mobile devices.

**Responsibilities:**
- Render narrative text, scene context, and decision prompts
- Display persistent context bar (role, date, location, objective)
- Present choices as scannable, tap-friendly options
- Show session summaries and historical comparisons
- Support long-form reading without clutter

**Technology:** Next.js with React, deployed on Vercel. CSS prioritizes
readability, spacing, and touch targets on small screens.

### 2. Game State Manager

Client-side state management that tracks the player's progress through a
scenario.

**Responsibilities:**
- Track current scene, role, and scenario variables
- Record decision history
- Manage scene transitions based on branching logic
- Maintain state needed for session summary generation

**Technology:** React state management (Context API or lightweight store).
State can be persisted to browser storage for session continuity.

### 3. Game Engine (Server)

Server-side logic that processes player decisions and determines outcomes.

**Responsibilities:**
- Evaluate player choices against scenario branching rules
- Update scenario variables and state flags
- Determine the next scene or decision point
- Enforce scenario constraints and boundaries
- Calculate divergence from historical outcomes

**Technology:** Next.js API routes (serverless functions on Vercel).

### 4. AI Orchestration Layer

Manages all interactions with the LLM to generate constrained narrative
content.

**Responsibilities:**
- Construct prompts that include scenario context, historical constraints,
  current game state, and character perspective
- Enforce historical plausibility boundaries on AI output
- Generate consequence narration for player decisions
- Produce moment-to-moment narrative expansion
- Generate session summaries comparing player outcomes to real history

**Constraints:**
- AI output must stay within the scenario's factual baseline
- Prompts must include the character's perspective and knowledge limits
- Responses must not invent implausible or fantasy outcomes
- The system must distinguish documented history from speculation

**Technology:** Claude API via Anthropic SDK. Prompt templates stored
alongside scenario content.

### 5. Scenario Content Store

Structured data files that define historical campaigns, roles, scenes, and
decision points.

**Responsibilities:**
- Store historical overviews, role briefings, and factual baselines
- Define scene sequences and branching structures
- Specify decision points with available choices and consequences
- Hold supporting character information
- Provide real-world outcome summaries for comparison

**Technology:** Structured JSON or YAML files within the repository. Designed
so new campaigns can be added by creating new content files without code
changes.

### 6. Session Storage

Lightweight persistence for in-progress and completed game sessions.

**Responsibilities:**
- Save game state for session continuity
- Store decision history for session summaries
- Preserve completed session results for replay comparison

**Technology:** Browser localStorage for MVP. Can migrate to server-side
storage (Vercel KV or database) if user accounts are added later.

## Request Flow

### Starting a Scenario

1. Player selects a scenario and role from the UI
2. Frontend requests scenario data from API
3. API loads scenario content files and returns initial briefing
4. Game State Manager initializes with starting state
5. UI renders role briefing and historical context

### Making a Decision

1. Player selects a choice from the current scene
2. Frontend sends choice + current game state to API
3. Game Engine evaluates the choice against branching rules
4. Game Engine updates scenario variables
5. AI Orchestration Layer constructs a prompt with:
   - Scenario context and historical constraints
   - Current game state and decision history
   - Character perspective and knowledge limits
   - The specific choice made
6. LLM generates consequence narration
7. AI layer validates response against plausibility constraints
8. API returns narration + updated state + next scene data
9. Frontend renders outcome and presents next decision

### Completing a Session

1. Game Engine detects scenario end condition
2. AI Orchestration Layer generates session summary prompt including:
   - Full decision history
   - Scenario divergence points
   - Real-world outcome data
3. LLM generates comparison narrative
4. API returns summary data
5. UI renders alternate-history summary and historical comparison

## Deployment Architecture

```
┌──────────────┐     ┌──────────────────────────────┐
│   Browser    │────▶│          Vercel               │
│   (Client)   │◀────│                               │
└──────────────┘     │  ┌────────────────────────┐   │
                     │  │  Static Assets (CDN)   │   │
                     │  └────────────────────────┘   │
                     │  ┌────────────────────────┐   │
                     │  │  API Routes            │   │
                     │  │  (Serverless Functions) │   │
                     │  └───────────┬────────────┘   │
                     └──────────────┼────────────────┘
                                    │
                                    ▼
                          ┌──────────────────┐
                          │  Claude API      │
                          │  (Anthropic)     │
                          └──────────────────┘
```

**Vercel provides:**
- Static asset hosting via global CDN
- Serverless function execution for API routes
- Automatic HTTPS and edge caching
- Zero-config Next.js deployment

## Directory Structure

```
timeline_commander/
├── docs/                        # Documentation
│   ├── requirements.md
│   ├── architecture.md
│   ├── api.md
│   └── data-model.md
├── src/
│   ├── app/                     # Next.js app router pages
│   │   ├── page.tsx             # Home / scenario selection
│   │   ├── play/
│   │   │   └── [scenarioId]/
│   │   │       └── page.tsx     # Game play screen
│   │   └── summary/
│   │       └── [sessionId]/
│   │           └── page.tsx     # Session summary screen
│   ├── components/              # React components
│   │   ├── NarrativeDisplay.tsx
│   │   ├── ChoicePanel.tsx
│   │   ├── ContextBar.tsx
│   │   └── SessionSummary.tsx
│   ├── lib/                     # Shared logic
│   │   ├── engine/              # Game engine
│   │   │   ├── state.ts
│   │   │   └── branching.ts
│   │   ├── ai/                  # AI orchestration
│   │   │   ├── orchestrator.ts
│   │   │   ├── prompts.ts
│   │   │   └── constraints.ts
│   │   └── scenarios/           # Scenario loading
│   │       └── loader.ts
│   └── api/                     # API route handlers
│       ├── scenarios/
│       ├── decisions/
│       └── sessions/
├── content/                     # Scenario content files
│   └── verdun-1916/
│       ├── scenario.yaml
│       ├── roles/
│       ├── scenes/
│       └── history.yaml
├── package.json
├── next.config.js
└── tsconfig.json
```

## Key Architectural Decisions

### Why Next.js on Vercel
- Matches the requirement for Vercel deployment
- Provides both static rendering and serverless API routes
- Built-in support for mobile-first responsive design
- Minimal infrastructure complexity for MVP

### Why structured content files (not a database)
- Scenario content is read-heavy, rarely changes at runtime
- New campaigns are added by authors, not end users
- Files can be version-controlled alongside code
- No database infrastructure needed for MVP
- Easy to review and edit scenario content

### Why server-side AI orchestration (not client-side)
- API keys stay on the server
- Prompt construction logic and constraints are not exposed to the client
- Server can validate and filter AI responses before delivery
- Consistent behavior regardless of client environment

### Why minimal client-side state
- Reduces complexity for MVP
- Game state is small (current scene, variables, decision history)
- Browser storage sufficient for session persistence
- Can add server-side persistence later without architectural changes

## Scalability Considerations

These are not MVP requirements but inform architectural choices:

- **New campaigns:** Add new content directories; no code changes needed
- **User accounts:** Add authentication and move session storage server-side
- **Multiplayer:** Not in scope; architecture does not preclude it
- **Content authoring tools:** Content files are structured for potential
  tooling support
- **Alternative AI providers:** AI orchestration layer abstracts the LLM
  provider behind a consistent interface
