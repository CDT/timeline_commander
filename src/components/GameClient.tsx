"use client";

import { useState } from "react";
import type { ResolvedScene, Locale } from "@/lib/types";
import StatusBar from "./StatusBar";
import SceneView from "./SceneView";
import OutcomeView from "./OutcomeView";
import SummaryView from "./SummaryView";
import BriefingView from "./BriefingView";

interface RoleMeta {
  name: string;
  title: string;
  briefing: string;
  objectives: string[];
  constraints: string[];
  pressures: string[];
}

interface Props {
  sessionId: string;
  initialScene: ResolvedScene;
  roleMeta: RoleMeta;
  scenarioTitle: string;
  locale: Locale;
  isNewSession: boolean;
}

type GamePhase =
  | { type: "briefing" }
  | { type: "scene"; scene: ResolvedScene; narrative: string }
  | { type: "outcome"; narration: string; nextScene: ResolvedScene | null; isTerminal: boolean }
  | { type: "summary" };

export default function GameClient({
  sessionId,
  initialScene,
  roleMeta,
  scenarioTitle,
  locale,
  isNewSession,
}: Props) {
  const [phase, setPhase] = useState<GamePhase>(
    isNewSession
      ? { type: "briefing" }
      : { type: "scene", scene: initialScene, narrative: initialScene.narrative }
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentScene, setCurrentScene] = useState(initialScene);

  async function submitChoice(choiceId: string) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choiceId }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d?.error?.message ?? "Decision failed");
      }
      const data = await res.json();
      setPhase({
        type: "outcome",
        narration: data.narration,
        nextScene: data.nextScene,
        isTerminal: data.isTerminal,
      });
      if (data.nextScene) setCurrentScene(data.nextScene);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  function proceedFromOutcome(
    narration: string,
    nextScene: ResolvedScene | null,
    isTerminal: boolean
  ) {
    if (isTerminal || !nextScene) {
      setPhase({ type: "summary" });
    } else {
      setPhase({ type: "scene", scene: nextScene, narrative: nextScene.narrative });
    }
  }

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "0 auto",
        padding: "0",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <StatusBar
        scenarioTitle={scenarioTitle}
        roleName={roleMeta.name}
        roleTitle={roleMeta.title}
        date={currentScene.date}
        location={currentScene.location}
      />

      <div style={{ flex: 1, padding: "1.5rem 1rem 2rem" }}>
        {error && (
          <div
            style={{
              color: "var(--tc-danger)",
              fontSize: "0.9rem",
              marginBottom: "1rem",
              padding: "0.75rem",
              border: "1px solid var(--tc-danger)",
              borderRadius: 4,
            }}
          >
            {error}
          </div>
        )}

        {phase.type === "briefing" && (
          <BriefingView
            roleMeta={roleMeta}
            onContinue={() =>
              setPhase({
                type: "scene",
                scene: initialScene,
                narrative: initialScene.narrative,
              })
            }
          />
        )}

        {phase.type === "scene" && (
          <SceneView
            scene={phase.scene}
            narrative={phase.narrative}
            submitting={submitting}
            onChoose={submitChoice}
          />
        )}

        {phase.type === "outcome" && (
          <OutcomeView
            narration={phase.narration}
            nextScene={phase.nextScene}
            isTerminal={phase.isTerminal}
            onContinue={() =>
              proceedFromOutcome(phase.narration, phase.nextScene, phase.isTerminal)
            }
          />
        )}

        {phase.type === "summary" && (
          <SummaryView sessionId={sessionId} locale={locale} />
        )}
      </div>
    </div>
  );
}
