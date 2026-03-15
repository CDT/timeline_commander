import { notFound } from "next/navigation";
import { getSession } from "@/lib/store";
import { loadScenario, resolve, resolveArray } from "@/lib/engine/scenario-loader";
import { loadScene } from "@/lib/engine/scenario-loader";
import { resolveScene } from "@/lib/engine/decision-processor";
import GameClient from "@/components/GameClient";

export default async function PlayPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const session = await getSession(sessionId);
  if (!session) notFound();

  const scenario = loadScenario(session.scenarioId);
  const role = scenario.roles.find((r) => r.id === session.roleId);
  if (!role) notFound();

  const rawScene = loadScene(session.scenarioId, session.currentSceneId);
  const resolvedScene = resolveScene(rawScene, session.locale, session.gameState);

  const roleMeta = {
    name: role.name,
    title: resolve(role.title, session.locale),
    briefing: resolve(role.briefing, session.locale),
    objectives: resolveArray(role.objectives, session.locale),
    constraints: resolveArray(role.constraints, session.locale),
    pressures: resolveArray(role.pressures, session.locale),
  };

  return (
    <GameClient
      sessionId={sessionId}
      initialScene={resolvedScene}
      roleMeta={roleMeta}
      scenarioTitle={resolve(scenario.title, session.locale)}
      locale={session.locale}
      isNewSession={session.decisions.length === 0}
    />
  );
}
