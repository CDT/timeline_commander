Timeline Commander - Product Requirements Draft

1. Product Vision

Timeline Commander is a web-first, mobile-first, text-based historical
role-playing game. Players step into the position of a real historical figure
during a major moment in world history, or an ordinary civilian living through
those events, read a grounded narrative, make high-impact decisions, and see
how those decisions could plausibly change events.

The product should feel closer to a classic MUD or interactive fiction
experience than to a traditional modern video game. The focus is historical
depth, meaningful choice, and lightweight delivery, not graphics-heavy
production.

2. Core Player Promise

- Learn history by participating in it.
- Play as real people in real historical crises, including both important
  historical figures and civilians.
- Make strategic, political, or moral decisions at key turning points.
- Receive outcomes that are historically informed, believable, and easy to
  understand.

Example scenario:
The player takes the role of Erich von Falkenhayn during the Battle of Verdun
and must decide how aggressively to commit forces, how to interpret battlefield
reports, and how to balance military goals with political pressure.

Additional scenario direction:
The player may also take the role of a civilian, such as a nurse, journalist,
factory worker, or local resident, to experience how major events shaped
everyday life and survival.

3. Design Principles

- History first: Every scenario should begin from a strong factual baseline.
- Text first: Story, choice, and consequence matter more than audiovisual
  presentation.
- Multiple perspectives: Scenarios should represent both decision-makers and
  civilians affected by the same event.
- Mobile first: Core reading and decision-making flows should be designed for
  phones before being expanded for larger screens.
- Lightweight delivery: The game must run smoothly in a browser with minimal
  client-side complexity.
- Consequence clarity: Players should understand why outcomes changed.
- Educational by immersion: The game should teach through role-play, not by
  feeling like a textbook.
- Replayable structure: Different decisions should create meaningfully
  different paths.

4. Target Experience

The player enters a historical scenario, receives context about the era, their
role, goals, limits, and the pressures acting on them, then advances through a
series of narrative scenes and decisions.

Each decision should:

- Be tied to a real historical tension or tradeoff.
- Offer a small set of clear, distinct choices.
- Produce short-term consequences and influence later events.
- Feed an AI-assisted simulation layer that predicts plausible next outcomes.

At the end of a session, the player should see:

- What happened in their version of history.
- How it compares with the real historical record.
- What factors most influenced the divergence.

5. MVP Scope

The first version should be intentionally narrow.

MVP requirements:

- Web-based interface.
- Mobile-first responsive layout.
- Fully text-driven experience.
- One playable historical campaign.
- At least one playable role within that campaign.
- Scene-based progression with branching choices.
- AI-generated or AI-assisted consequence narration.
- Session summary comparing player outcomes with real history.

Recommended first campaign:

- Battle of Verdun, 1916.

Recommended first playable role:

- Erich von Falkenhayn.

Recommended follow-up playable role:

- A civilian directly affected by the Battle of Verdun.

6. Gameplay Loop

1. Select scenario.
2. Read role briefing and historical context.
3. Enter a scene.
4. Review situation reports, constraints, and objectives.
5. Make a decision.
6. Receive outcome narration and updated state.
7. Continue until the scenario ends.
8. Review alternate-history summary and historical comparison.

7. Narrative and Simulation Requirements

The narrative system should combine authored structure with flexible AI output.

Requirements:

- Each scenario must have a factual history outline as source material.
- Major scenes and decision points should be designed in advance.
- AI should expand moment-to-moment narration, react to choices, and project
  plausible consequences.
- AI output must remain constrained by scenario state, historical context, and
  character perspective.
- The system should avoid random fantasy outcomes that break historical
  plausibility.

The AI is not there to invent history freely. It is there to model believable
alternate developments based on the player's decisions.

8. Historical Content Requirements

- Use real events, dates, locations, factions, and key figures.
- Include civilian perspectives where historically appropriate, not only elite
  or command-level viewpoints.
- Distinguish clearly between documented history and speculative outcomes.
- Keep tone serious, readable, and immersive.
- Present enough context for non-expert players to follow the stakes.
- Avoid overwhelming players with dense exposition before decisions begin.

Each scenario should include:

- Historical overview.
- Role overview.
- Objectives.
- Constraints and pressures.
- Important supporting characters.
- Key decision points.
- Real-world outcome summary.

9. User Experience Requirements

- The interface should be mobile first, then scale cleanly to tablet and
  desktop.
- Text should be the visual priority.
- Choices should be easy to scan and select.
- Players should always know their current role, date, location, and immediate
  objective.
- The UI should support long-form reading without feeling cluttered.
- Tap targets, spacing, and text layout should remain comfortable on small
  screens.

10. Technical Requirements

- Web first.
- Mobile first.
- Initial deployment target is Vercel.
- Lightweight frontend.
- Minimal infrastructure complexity for the first version.
- Fast load times.
- Primary interactions should work well with touch input and narrow viewports.
- Content and scenario data should be structured so more campaigns can be added
  later.
- The application should separate scenario content, game state, and AI prompt
  logic.

Preferred implementation direction:

- A simple web app with a text-centric UI, deployed on Vercel.
- Structured scenario files for historical content.
- A game-state engine to track decisions, variables, and branching outcomes.
- An AI orchestration layer that generates constrained narrative responses.

11. Non-Goals for MVP

- 3D graphics.
- Real-time action gameplay.
- Open-world exploration.
- Large-scale multiplayer systems.
- Complex combat simulation visuals.
- Dozens of campaigns at launch.

12. Success Criteria

The MVP is successful if a player can:

- Start a scenario quickly in a browser.
- Understand who they are and what is happening.
- Make a series of meaningful decisions.
- Receive outcomes that feel historically grounded and interesting.
- Finish the session feeling they learned something about the real event.
- Want to replay the scenario to explore different results.

13. Next Design Questions

- How strict should historical plausibility limits be?
- How much freedom should players have outside predefined choices?
- Should the first version use fully explicit options, free-text input, or a
  hybrid model?
- How should the game explain when AI is extrapolating beyond the historical
  record?
- What is the minimum content structure needed to add new scenarios efficiently?
