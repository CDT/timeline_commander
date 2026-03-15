/**
 * Session store abstraction.
 *
 * Uses an in-memory Map when VERCEL_KV_REST_API_URL is not set (local dev).
 * Uses Vercel KV in production if that env var is present.
 *
 * Sessions expire after SESSION_TTL_SECONDS of inactivity (default: 7 days).
 */
import type { GameSession } from "@/lib/types";

const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

// ─── In-memory fallback ─────────────────────────────────────────────────────
// Attach to globalThis so the store survives across Next.js module evaluations
// (API route handlers and Server Components may get separate module instances).

const globalKey = "__tc_session_store__" as const;

function getMemStore(): Map<string, { session: GameSession; expiresAt: number }> {
  const g = globalThis as unknown as Record<string, unknown>;
  if (!g[globalKey]) {
    g[globalKey] = new Map<string, { session: GameSession; expiresAt: number }>();
  }
  return g[globalKey] as Map<string, { session: GameSession; expiresAt: number }>;
}

function memSet(id: string, session: GameSession): void {
  getMemStore().set(id, {
    session,
    expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
  });
}

function memGet(id: string): GameSession | null {
  const store = getMemStore();
  const entry = store.get(id);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(id);
    return null;
  }
  return entry.session;
}

// ─── KV adapter ─────────────────────────────────────────────────────────────

async function kvSet(id: string, session: GameSession): Promise<void> {
  const { kv } = await import("@vercel/kv");
  await kv.set(`session:${id}`, JSON.stringify(session), {
    ex: SESSION_TTL_SECONDS,
  });
}

async function kvGet(id: string): Promise<GameSession | null> {
  const { kv } = await import("@vercel/kv");
  const raw = await kv.get<string>(`session:${id}`);
  if (!raw) return null;
  return typeof raw === "string" ? (JSON.parse(raw) as GameSession) : (raw as GameSession);
}

// ─── Public API ─────────────────────────────────────────────────────────────

function useKv(): boolean {
  return Boolean(process.env.VERCEL_KV_REST_API_URL);
}

export async function saveSession(session: GameSession): Promise<void> {
  if (useKv()) {
    await kvSet(session.id, session);
  } else {
    memSet(session.id, session);
  }
}

export async function getSession(id: string): Promise<GameSession | null> {
  if (useKv()) {
    return kvGet(id);
  }
  return memGet(id);
}
