"use client";

import { useState, useRef, useCallback } from "react";
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
  | { type: "scene"; scene: ResolvedScene }
  | { type: "outcome"; nextScene: ResolvedScene | null; isTerminal: boolean }
  | { type: "summary" };

const STALL_TIMEOUT_MS = 35_000;

async function streamNarration(
  sessionId: string,
  body: { type: "scene" | "outcome"; outcomePrompt?: string; choiceText?: string },
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const res = await fetch(`/api/sessions/${sessionId}/narrate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok || !res.body) {
    throw new Error("Narration stream failed");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let accumulated = "";
  let buffer = "";
  let stallTimer: ReturnType<typeof setTimeout> | undefined;

  const resetStallTimer = () => {
    clearTimeout(stallTimer);
    stallTimer = setTimeout(() => {
      reader.cancel("Stream stalled");
    }, STALL_TIMEOUT_MS);
  };

  resetStallTimer();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      resetStallTimer();
      buffer += decoder.decode(value, { stream: true });

      // Parse SSE events from buffer
      const parts = buffer.split("\n\n");
      buffer = parts.pop() ?? "";

      for (const part of parts) {
        // Skip SSE comments (keepalive)
        if (!part.trim() || part.trim().startsWith(":")) continue;

        const dataLines = part
          .split("\n")
          .filter((l) => l.startsWith("data: "))
          .map((l) => l.slice(6));

        const data = dataLines.join("\n");
        if (!data || data === "[DONE]") continue;

        accumulated += data;
        onChunk(accumulated);
      }
    }
  } finally {
    clearTimeout(stallTimer);
  }

  return accumulated;
}

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
      : { type: "scene", scene: initialScene }
  );
  const [narrativeText, setNarrativeText] = useState(
    isNewSession ? "" : initialScene.narrative
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentScene, setCurrentScene] = useState(initialScene);
  const abortRef = useRef<AbortController | null>(null);

  const startNarrationStream = useCallback(
    async (body: { type: "scene" | "outcome"; outcomePrompt?: string; choiceText?: string }, fallback: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsStreaming(true);
      setNarrativeText("");
      try {
        await streamNarration(sessionId, body, setNarrativeText, controller.signal);
      } catch {
        // If streaming fails, use seed text as fallback
        setNarrativeText((prev) => prev || fallback);
      }
      setIsStreaming(false);
    },
    [sessionId]
  );

  function handleBeginFromBriefing() {
    setPhase({ type: "scene", scene: initialScene });
    startNarrationStream({ type: "scene" }, initialScene.narrative);
  }

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

      if (data.nextScene) setCurrentScene(data.nextScene);
      setPhase({
        type: "outcome",
        nextScene: data.nextScene,
        isTerminal: data.isTerminal,
      });

      // Start streaming outcome narration
      startNarrationStream(
        { type: "outcome", outcomePrompt: data.outcomePrompt, choiceText: data.choiceText },
        data.narration
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  function proceedFromOutcome(nextScene: ResolvedScene | null, isTerminal: boolean) {
    if (isTerminal || !nextScene) {
      setPhase({ type: "summary" });
    } else {
      setPhase({ type: "scene", scene: nextScene });
      startNarrationStream({ type: "scene" }, nextScene.narrative);
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
            onContinue={handleBeginFromBriefing}
          />
        )}

        {phase.type === "scene" && (
          <SceneView
            scene={phase.scene}
            narrative={narrativeText}
            submitting={submitting}
            isStreaming={isStreaming}
            onChoose={submitChoice}
          />
        )}

        {phase.type === "outcome" && (
          <OutcomeView
            narration={narrativeText}
            nextScene={phase.nextScene}
            isTerminal={phase.isTerminal}
            isStreaming={isStreaming}
            onContinue={() =>
              proceedFromOutcome(phase.nextScene, phase.isTerminal)
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
