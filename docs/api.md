# Timeline Commander - API Reference

## Overview

The Timeline Commander API is a set of Next.js API routes deployed as
serverless functions on Vercel. All endpoints accept and return JSON. The API
manages scenario loading, game session lifecycle, decision processing, and
AI-generated narrative content.

## Base URL

```
Production: https://<app-domain>/api
Development: http://localhost:3000/api
```

## Authentication

MVP does not include user authentication. All endpoints are publicly
accessible. Authentication can be added later without changing the API
structure.

---

## Endpoints

### Scenarios

#### List Available Scenarios

```
GET /api/scenarios
```

Returns all available scenarios with summary information.

**Response:**

```json
{
  "scenarios": [
    {
      "id": "verdun-1916",
      "title": "Battle of Verdun",
      "year": 1916,
      "summary": "The longest single battle of World War I...",
      "roles": [
        {
          "id": "falkenhayn",
          "name": "Erich von Falkenhayn",
          "type": "commander",
          "summary": "Chief of the German General Staff..."
        },
        {
          "id": "civilian-nurse",
          "name": "Marie Dupont",
          "type": "civilian",
          "summary": "A nurse working near the front lines..."
        }
      ],
      "estimatedDuration": "30-45 minutes",
      "sceneCount": 8
    }
  ]
}
```

---

#### Get Scenario Details

```
GET /api/scenarios/:scenarioId
```

Returns full scenario metadata including historical overview, roles, and
content needed to start a session.

**Path Parameters:**
- `scenarioId` — Scenario identifier (e.g., `verdun-1916`)

**Response:**

```json
{
  "id": "verdun-1916",
  "title": "Battle of Verdun",
  "year": 1916,
  "historicalOverview": "In February 1916, the German Army launched...",
  "location": "Verdun-sur-Meuse, France",
  "startDate": "1916-02-21",
  "endDate": "1916-12-18",
  "factions": [
    {
      "id": "german-empire",
      "name": "German Empire",
      "description": "..."
    },
    {
      "id": "french-republic",
      "name": "French Republic",
      "description": "..."
    }
  ],
  "roles": [
    {
      "id": "falkenhayn",
      "name": "Erich von Falkenhayn",
      "title": "Chief of the German General Staff",
      "type": "commander",
      "faction": "german-empire",
      "briefing": "You are Erich von Falkenhayn...",
      "objectives": [
        "Bleed the French Army through attrition at Verdun",
        "Maintain political support in Berlin",
        "Manage resource allocation across the Western Front"
      ],
      "constraints": [
        "Limited reserves available from other fronts",
        "Political pressure from Kaiser Wilhelm II",
        "Competing demands from Eastern Front commanders"
      ],
      "supportingCharacters": [
        {
          "name": "Crown Prince Wilhelm",
          "role": "Commander of the 5th Army",
          "relationship": "Subordinate but politically powerful"
        }
      ]
    }
  ],
  "realWorldOutcome": "The Battle of Verdun ended in a French...",
  "estimatedDuration": "30-45 minutes",
  "sceneCount": 8
}
```

---

### Sessions

#### Create Session

```
POST /api/sessions
```

Creates a new game session for a scenario and role.

**Request Body:**

```json
{
  "scenarioId": "verdun-1916",
  "roleId": "falkenhayn"
}
```

**Response:**

```json
{
  "sessionId": "sess_abc123",
  "scenarioId": "verdun-1916",
  "roleId": "falkenhayn",
  "state": {
    "currentSceneId": "scene-01-opening",
    "turnNumber": 1,
    "currentDate": "1916-02-21",
    "location": "German Supreme Command, Charleville-Mézières",
    "variables": {
      "germanMorale": 80,
      "frenchMorale": 75,
      "politicalSupport": 70,
      "reserves": 100
    },
    "flags": [],
    "decisionHistory": []
  },
  "scene": {
    "id": "scene-01-opening",
    "title": "The Eve of Operation Gericht",
    "narrative": "It is February 20, 1916. Tomorrow morning...",
    "contextNote": "Historically, the bombardment began at 07:15...",
    "choices": [
      {
        "id": "choice-01a",
        "text": "Proceed with the bombardment as planned at dawn",
        "shortLabel": "Attack at dawn",
        "hint": "The element of surprise favors immediate action"
      },
      {
        "id": "choice-01b",
        "text": "Delay the attack by 48 hours to bring up more ammunition",
        "shortLabel": "Delay 48 hours",
        "hint": "More preparation could increase initial impact"
      },
      {
        "id": "choice-01c",
        "text": "Request a meeting with Crown Prince Wilhelm to reassess objectives",
        "shortLabel": "Reassess with Wilhelm",
        "hint": "Political alignment may matter as much as military readiness"
      }
    ]
  }
}
```

---

#### Get Session State

```
GET /api/sessions/:sessionId
```

Returns the current state of an active session.

**Path Parameters:**
- `sessionId` — Session identifier

**Response:**

```json
{
  "sessionId": "sess_abc123",
  "scenarioId": "verdun-1916",
  "roleId": "falkenhayn",
  "status": "active",
  "state": {
    "currentSceneId": "scene-03-counterattack",
    "turnNumber": 3,
    "currentDate": "1916-03-06",
    "location": "German Supreme Command",
    "variables": {
      "germanMorale": 72,
      "frenchMorale": 60,
      "politicalSupport": 65,
      "reserves": 78
    },
    "flags": ["delayed_initial_attack", "wilhelm_disagreement"],
    "decisionHistory": [
      {
        "turnNumber": 1,
        "sceneId": "scene-01-opening",
        "choiceId": "choice-01b",
        "choiceText": "Delay the attack by 48 hours",
        "timestamp": "2026-03-13T10:00:00Z"
      },
      {
        "turnNumber": 2,
        "sceneId": "scene-02-bombardment",
        "choiceId": "choice-02a",
        "choiceText": "Concentrate fire on Fort Douaumont",
        "timestamp": "2026-03-13T10:05:00Z"
      }
    ]
  }
}
```

---

### Decisions

#### Submit Decision

```
POST /api/sessions/:sessionId/decisions
```

Submits a player decision and returns the AI-generated consequence narration
along with the next scene.

**Path Parameters:**
- `sessionId` — Session identifier

**Request Body:**

```json
{
  "choiceId": "choice-03a"
}
```

**Response:**

```json
{
  "outcome": {
    "narration": "Your order to reinforce the left flank arrives just in time...",
    "stateChanges": {
      "germanMorale": -3,
      "reserves": -8,
      "politicalSupport": +2
    },
    "newFlags": ["reinforced_left_flank"],
    "historicalNote": "In reality, German reserves were committed piecemeal..."
  },
  "state": {
    "currentSceneId": "scene-04-attrition",
    "turnNumber": 4,
    "currentDate": "1916-03-15",
    "location": "German Supreme Command",
    "variables": {
      "germanMorale": 69,
      "frenchMorale": 55,
      "politicalSupport": 67,
      "reserves": 70
    },
    "flags": ["delayed_initial_attack", "wilhelm_disagreement", "reinforced_left_flank"],
    "decisionHistory": ["...updated array..."]
  },
  "scene": {
    "id": "scene-04-attrition",
    "title": "The Grinding Continues",
    "narrative": "Two weeks into the battle, casualties mount on both sides...",
    "contextNote": "By mid-March 1916, both sides had suffered...",
    "choices": [
      {
        "id": "choice-04a",
        "text": "Commit the reserve divisions to push for a breakthrough",
        "shortLabel": "Push for breakthrough",
        "hint": "Risks heavy casualties but could end the battle quickly"
      },
      {
        "id": "choice-04b",
        "text": "Maintain current pressure and wait for French exhaustion",
        "shortLabel": "Maintain pressure",
        "hint": "Aligns with the original attrition strategy"
      },
      {
        "id": "choice-04c",
        "text": "Shift focus to a different sector of the front",
        "shortLabel": "Shift focus",
        "hint": "May relieve pressure but could signal weakness"
      }
    ]
  },
  "isComplete": false
}
```

When the scenario ends (`isComplete: true`), the response includes a summary
instead of a next scene:

```json
{
  "outcome": {
    "narration": "As winter sets in, the battle grinds to a halt...",
    "stateChanges": {},
    "newFlags": ["scenario_complete"],
    "historicalNote": "The Battle of Verdun officially ended on..."
  },
  "state": { "...final state..." },
  "scene": null,
  "isComplete": true,
  "summaryAvailable": true
}
```

---

### Session Summary

#### Get Session Summary

```
GET /api/sessions/:sessionId/summary
```

Returns the AI-generated session summary comparing the player's alternate
history with the real historical record. Only available after a session is
complete.

**Path Parameters:**
- `sessionId` — Session identifier

**Response:**

```json
{
  "sessionId": "sess_abc123",
  "scenarioId": "verdun-1916",
  "roleId": "falkenhayn",
  "playerOutcome": {
    "title": "Your Version of History",
    "narrative": "Under your command, the initial assault was delayed by 48 hours...",
    "keyDecisions": [
      {
        "turnNumber": 1,
        "decision": "Delayed the initial attack by 48 hours",
        "impact": "Greater initial bombardment effect but lost strategic surprise"
      },
      {
        "turnNumber": 3,
        "decision": "Reinforced the left flank",
        "impact": "Prevented a French counter-breakthrough but depleted reserves"
      }
    ],
    "finalState": {
      "germanMorale": 45,
      "frenchMorale": 38,
      "politicalSupport": 50,
      "reserves": 25
    }
  },
  "historicalComparison": {
    "title": "What Actually Happened",
    "narrative": "In reality, the German bombardment began on February 21...",
    "keyDivergences": [
      {
        "description": "You delayed the initial attack; historically it began on schedule",
        "consequence": "Your bombardment was heavier but the French had more time to prepare"
      }
    ]
  },
  "analysisNarrative": "Your decisions as Falkenhayn diverged from history in several key ways...",
  "replayPrompt": "What would have happened if you had attacked on schedule but shifted reserves earlier?"
}
```

---

## Error Responses

All endpoints return errors in a consistent format:

```json
{
  "error": {
    "code": "SESSION_NOT_FOUND",
    "message": "No session found with the given ID"
  }
}
```

**Standard Error Codes:**

| HTTP Status | Code                    | Description                                      |
|-------------|-------------------------|--------------------------------------------------|
| 400         | `INVALID_REQUEST`       | Missing or invalid request parameters            |
| 400         | `INVALID_CHOICE`        | Choice ID does not exist in the current scene    |
| 404         | `SCENARIO_NOT_FOUND`    | Scenario ID does not match any available scenario|
| 404         | `SESSION_NOT_FOUND`     | Session ID does not match any active session     |
| 404         | `ROLE_NOT_FOUND`        | Role ID does not exist in the specified scenario |
| 409         | `SESSION_COMPLETE`      | Session is already complete; no more decisions   |
| 500         | `AI_GENERATION_FAILED`  | AI narrative generation failed                   |
| 500         | `INTERNAL_ERROR`        | Unexpected server error                          |

---

## Rate Limiting

MVP does not enforce rate limiting. Each decision triggers one LLM API call,
so natural gameplay pacing limits request volume. Rate limiting can be added
at the Vercel middleware level if needed.

## Versioning

The API is unversioned for MVP. If breaking changes are needed later, the
API can be versioned by prefixing routes (e.g., `/api/v2/scenarios`).
