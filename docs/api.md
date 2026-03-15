# Timeline Commander — API Reference

## Overview

All API endpoints are Next.js API routes deployed to Vercel. The base URL for all routes is `/api`.

**Content type:** All requests and responses use `application/json`.

**Session identity:** An anonymous session ID is issued on first session creation and stored in a `tc_session` cookie (HttpOnly, SameSite=Strict). No user accounts or authentication tokens are required for MVP.

**AI provider:** The server defaults to the provider set by the `AI_PROVIDER` environment variable (`"claude"` or `"deepseek"`). Clients may request a specific provider and model at session creation time. Once a session is created, its provider is fixed.

**Error format:** All error responses follow a common shape:

```json
{
  "error": {
    "code": "SCENE_NOT_FOUND",
    "message": "No scene with id 'scene-xyz' exists in this scenario."
  }
}
```

---

## Endpoints

### Scenarios

#### `GET /api/scenarios`

Returns a list of all available scenarios.

**Response `200`**

```json
{
  "scenarios": [
    {
      "id": "verdun-1916",
      "title": "Battle of Verdun",
      "period": "World War I",
      "dates": { "start": "1916-02-21", "end": "1916-12-18" },
      "location": "Verdun, France",
      "difficulty": "intermediate",
      "tags": ["WWI", "military", "France"],
      "roleCount": 2
    }
  ]
}
```

---

#### `GET /api/scenarios/:scenarioId`

Returns full scenario details including roles and key figures. Does not return scene content.

**Path parameters**

| Parameter    | Type   | Description           |
|--------------|--------|-----------------------|
| `scenarioId` | string | Scenario ID           |

**Response `200`**

```json
{
  "scenario": {
    "id": "verdun-1916",
    "title": "Battle of Verdun",
    "period": "World War I",
    "dates": { "start": "1916-02-21", "end": "1916-12-18" },
    "location": "Verdun, France",
    "historicalOverview": "...",
    "realWorldOutcome": "...",
    "difficulty": "intermediate",
    "tags": ["WWI", "military", "France"],
    "keyFigures": [
      {
        "id": "petain",
        "name": "Philippe Pétain",
        "role": "Commander, French Second Army",
        "faction": "France",
        "description": "..."
      }
    ],
    "roles": [
      {
        "id": "falkenhayn",
        "name": "Erich von Falkenhayn",
        "title": "Chief of the German General Staff",
        "perspective": "commander",
        "isHistoricalFigure": true,
        "briefing": "...",
        "objectives": ["Bleed the French Army white at Verdun."],
        "constraints": ["Avoid overcommitting German reserves."],
        "pressures": ["Kaiser Wilhelm II demands visible results."]
      }
    ]
  }
}
```

**Errors**

| Code                  | Status | Description                        |
|-----------------------|--------|------------------------------------|
| `SCENARIO_NOT_FOUND`  | 404    | No scenario with that ID exists    |

---

### Sessions

#### `POST /api/sessions`

Creates a new game session for a given scenario and role.

**Request body**

```json
{
  "scenarioId": "verdun-1916",
  "roleId": "falkenhayn",
  "aiProvider": {
    "provider": "deepseek",
    "model": "deepseek-chat"
  }
}
```

`aiProvider` is optional. When omitted, the server default is used. Valid values:

| `provider`  | `model`               | Notes                                   |
|-------------|-----------------------|-----------------------------------------|
| `"claude"`  | `"claude-sonnet-4-6"` | Default Claude model                    |
| `"claude"`  | `"claude-opus-4-6"`   | Higher quality, higher cost             |
| `"deepseek"`| `"deepseek-chat"`     | Default DeepSeek model                  |
| `"deepseek"`| `"deepseek-reasoner"` | Chain-of-thought; better for summaries  |

**Response `201`**

```json
{
  "session": {
    "id": "a1b2c3d4-...",
    "scenarioId": "verdun-1916",
    "roleId": "falkenhayn",
    "status": "active",
    "startedAt": "2026-03-15T10:00:00Z",
    "aiProvider": { "provider": "deepseek", "model": "deepseek-chat" }
  },
  "scene": { /* See Scene response shape below */ }
}
```

Sets `tc_session` cookie to the session ID.

**Errors**

| Code                   | Status | Description                                      |
|------------------------|--------|--------------------------------------------------|
| `SCENARIO_NOT_FOUND`   | 404    | Scenario ID does not exist                       |
| `ROLE_NOT_FOUND`       | 404    | Role ID does not exist in this scenario          |
| `INVALID_AI_PROVIDER`  | 400    | `provider` value is not `"claude"` or `"deepseek"` |
| `INVALID_AI_MODEL`     | 400    | `model` is not valid for the specified provider  |

---

#### `GET /api/sessions/:sessionId`

Returns the current session state, including the active scene and decision history.

**Path parameters**

| Parameter   | Type   | Description  |
|-------------|--------|--------------|
| `sessionId` | string | Session ID   |

**Response `200`**

```json
{
  "session": {
    "id": "a1b2c3d4-...",
    "scenarioId": "verdun-1916",
    "roleId": "falkenhayn",
    "status": "active",
    "startedAt": "2026-03-15T10:00:00Z",
    "lastActivityAt": "2026-03-15T10:12:00Z",
    "decisionCount": 2,
    "aiProvider": { "provider": "deepseek", "model": "deepseek-chat" }
  },
  "scene": { /* current scene, see GET /api/sessions/:id/scene */ },
  "gameState": {
    "variables": { "troopCommitment": "moderate" },
    "flags": ["opened-offensive"],
    "resources": { "troopMorale": 68 },
    "relationships": { "kaiser": 20, "hindenburg": -10 }
  }
}
```

**Errors**

| Code                | Status | Description                             |
|---------------------|--------|-----------------------------------------|
| `SESSION_NOT_FOUND` | 404    | No session with that ID exists          |
| `SESSION_EXPIRED`   | 410    | Session TTL has elapsed                 |

---

### Scene

#### `GET /api/sessions/:sessionId/scene`

Returns the current scene for a session, including narration and available choices.

**Response `200`**

```json
{
  "scene": {
    "id": "verdun-1916-scene-001",
    "title": "The Opening Bombardment",
    "date": "February 21, 1916",
    "location": "German General Headquarters, Mézières",
    "narration": "The artillery barrage has begun. Ten hours of unrelenting fire...",
    "situationReport": [
      "German artillery has bombarded French lines since dawn.",
      "Initial reports suggest heavy French casualties.",
      "Infantry units await your order to advance."
    ],
    "objectives": ["Decide the pace and scale of the infantry assault."],
    "constraints": ["Reserve units cannot be committed until second-wave orders."],
    "historicalNote": "The opening barrage was the most intense in the war to that point.",
    "choices": [
      {
        "id": "scene-001-choice-a",
        "text": "Order a full-scale infantry assault along the entire front immediately."
      },
      {
        "id": "scene-001-choice-b",
        "text": "Advance on a narrower front to probe French defenses before committing."
      },
      {
        "id": "scene-001-choice-c",
        "text": "Delay the infantry advance and continue the bombardment for another six hours."
      }
    ],
    "isTerminal": false
  }
}
```

Note: `choices[].outcomePrompt` and `choices[].historicalContext` are internal content fields and are never returned to the client.

**Errors**

| Code                | Status | Description                    |
|---------------------|--------|--------------------------------|
| `SESSION_NOT_FOUND` | 404    | Session does not exist         |
| `SESSION_COMPLETED` | 409    | Session has already ended      |

---

### Decisions

#### `POST /api/sessions/:sessionId/decision`

Submits a player decision for the current scene. Applies state changes, generates AI outcome narration, and advances the session to the next scene.

**Path parameters**

| Parameter   | Type   | Description |
|-------------|--------|-------------|
| `sessionId` | string | Session ID  |

**Request body**

```json
{
  "choiceId": "scene-001-choice-b"
}
```

**Response `200`**

```json
{
  "outcome": {
    "choiceId": "scene-001-choice-b",
    "choiceText": "Advance on a narrower front to probe French defenses before committing.",
    "narration": "The cautious advance on a three-kilometer front reveals gaps in the French line, but progress is slow. Your officers grow impatient..."
  },
  "scene": { /* next scene, same shape as GET /api/sessions/:id/scene */ },
  "gameState": {
    "variables": { "troopCommitment": "cautious" },
    "flags": ["opened-offensive", "narrow-front-advance"],
    "resources": { "troopMorale": 72 },
    "relationships": { "kaiser": 10, "hindenburg": 5 }
  },
  "sessionStatus": "active"
}
```

If the next scene is terminal (`isTerminal: true`), `sessionStatus` will be `"completed"` and a `summaryUrl` field will be included:

```json
{
  "sessionStatus": "completed",
  "summaryUrl": "/api/sessions/a1b2c3d4-.../summary"
}
```

**Errors**

| Code                  | Status | Description                                           |
|-----------------------|--------|-------------------------------------------------------|
| `SESSION_NOT_FOUND`   | 404    | Session does not exist                                |
| `SESSION_COMPLETED`   | 409    | Session has already ended                             |
| `INVALID_CHOICE`      | 400    | Choice ID not valid for current scene                 |
| `CHOICE_UNAVAILABLE`  | 400    | Choice conditions not met by current game state       |
| `AI_UNAVAILABLE`      | 503    | AI provider API failed; retry is safe                 |

---

### Summary

#### `GET /api/sessions/:sessionId/summary`

Returns the end-of-session alternate-history summary. Only available when `session.status === "completed"`.

This endpoint triggers AI generation on first call and caches the result in the session record for subsequent requests.

**Response `200`**

```json
{
  "summary": {
    "sessionId": "a1b2c3d4-...",
    "scenarioId": "verdun-1916",
    "roleId": "falkenhayn",
    "roleName": "Erich von Falkenhayn",
    "decisionCount": 6,
    "alternateHistoryNarrative": "By committing forces cautiously and delaying the flanking maneuver, the German offensive stalled by mid-March. French reserves arrived before a breakthrough was possible...",
    "realHistoricalOutcome": "The Battle of Verdun lasted ten months and resulted in nearly 700,000 casualties. Falkenhayn was replaced in August 1916...",
    "divergenceAnalysis": "Your decision to advance on a narrow front preserved German reserves but surrendered the initiative. The key turning point was...",
    "keyInfluences": [
      "Chosen a narrow-front advance rather than full assault",
      "Delayed the flanking maneuver at Fort Douaumont",
      "Prioritized troop morale over territorial gain"
    ],
    "generatedAt": "2026-03-15T10:45:00Z",
    "aiProvider": { "provider": "deepseek", "model": "deepseek-reasoner" }
  }
}
```

**Errors**

| Code                  | Status | Description                               |
|-----------------------|--------|-------------------------------------------|
| `SESSION_NOT_FOUND`   | 404    | Session does not exist                    |
| `SESSION_NOT_COMPLETE`| 409    | Session is still active                   |
| `AI_UNAVAILABLE`      | 503    | AI provider API failed; retry is safe     |

---

### Narrative (Internal)

These endpoints are called by the API layer internally. They are not intended to be called directly by the client.

#### `POST /api/internal/narrative/scene`

Generates expanded narration for a scene.

**Request body**

```json
{
  "sessionId": "a1b2c3d4-...",
  "sceneId": "verdun-1916-scene-001"
}
```

**Response `200`**

```json
{
  "narration": "The artillery barrage has begun. Ten hours of unrelenting fire..."
}
```

---

#### `POST /api/internal/narrative/outcome`

Generates consequence narration after a decision.

**Request body**

```json
{
  "sessionId": "a1b2c3d4-...",
  "sceneId": "verdun-1916-scene-001",
  "choiceId": "scene-001-choice-b",
  "gameState": { /* current GameState */ }
}
```

**Response `200`**

```json
{
  "narration": "The cautious advance on a three-kilometer front reveals gaps..."
}
```

---

## Rate Limits

| Endpoint group              | Limit              |
|-----------------------------|--------------------|
| `GET /api/scenarios*`       | 60 req/min per IP  |
| `POST /api/sessions`        | 10 req/min per IP  |
| `POST /api/sessions/*/decision` | 30 req/min per session |
| `GET /api/sessions/*/summary`   | 5 req/min per session  |

Exceeded limits return `429 Too Many Requests`.

---

## Error Codes Reference

| Code                   | HTTP Status | Description                                          |
|------------------------|-------------|------------------------------------------------------|
| `SCENARIO_NOT_FOUND`   | 404         | Scenario ID does not exist                           |
| `ROLE_NOT_FOUND`       | 404         | Role ID does not exist in scenario                   |
| `SESSION_NOT_FOUND`    | 404         | Session ID does not exist or has expired             |
| `SESSION_EXPIRED`      | 410         | Session TTL has elapsed (7 days inactivity)          |
| `SESSION_COMPLETED`    | 409         | Action not valid on a completed session              |
| `SESSION_NOT_COMPLETE` | 409         | Summary requested before session has ended           |
| `INVALID_CHOICE`       | 400         | Choice ID not valid for the current scene            |
| `CHOICE_UNAVAILABLE`   | 400         | Choice conditions not met by current game state      |
| `VALIDATION_ERROR`     | 400         | Request body failed schema validation                |
| `INVALID_AI_PROVIDER`  | 400         | `provider` is not `"claude"` or `"deepseek"`         |
| `INVALID_AI_MODEL`     | 400         | `model` is not valid for the specified provider      |
| `AI_UNAVAILABLE`       | 503         | AI provider API returned an error; client may retry  |
| `INTERNAL_ERROR`       | 500         | Unexpected server error                              |
