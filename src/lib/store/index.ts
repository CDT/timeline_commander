/**
 * Session store abstraction.
 *
 * Priority:
 *  1. Vercel KV  — when KV_REST_API_URL or VERCEL_KV_REST_API_URL is set
 *  2. Cookie     — on Vercel without KV (serverless-safe, single-session)
 *  3. In-memory  — local dev only
 *
 * Sessions expire after SESSION_TTL_SECONDS of inactivity (default: 7 days).
 */
import type { GameSession } from "@/lib/types";
import { cookies } from "next/headers";

const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
const SESSION_COOKIE = "tc_session";

// ─── In-memory fallback (local dev only) ────────────────────────────────────

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

// ─── Cookie adapter (Vercel without KV) ─────────────────────────────────────
// Stores one active session in an HttpOnly cookie. Works across serverless
// invocations because the browser sends the cookie with every request.

async function cookieSet(_id: string, session: GameSession): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });
}

async function cookieGet(id: string): Promise<GameSession | null> {
  const jar = await cookies();
  const cookie = jar.get(SESSION_COOKIE);
  if (!cookie?.value) return null;
  try {
    const session = JSON.parse(cookie.value) as GameSession;
    return session.id === id ? session : null;
  } catch {
    return null;
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

function useKv(): boolean {
  return Boolean(
    process.env.KV_REST_API_URL || process.env.VERCEL_KV_REST_API_URL
  );
}

function isVercel(): boolean {
  return Boolean(process.env.VERCEL);
}

export async function saveSession(session: GameSession): Promise<void> {
  if (useKv()) {
    await kvSet(session.id, session);
  } else if (isVercel()) {
    await cookieSet(session.id, session);
  } else {
    memSet(session.id, session);
  }
}

export async function getSession(id: string): Promise<GameSession | null> {
  if (useKv()) {
    return kvGet(id);
  } else if (isVercel()) {
    return cookieGet(id);
  }
  return memGet(id);
}
