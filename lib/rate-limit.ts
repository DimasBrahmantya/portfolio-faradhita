import 'server-only';

interface RateLimitEntry {
  failures: number;
  windowStart: number;
}

const WINDOW_MS = 10 * 60 * 1000; // 10 menit
const MAX_FAILURES = 5;

// shortcut: in-memory per serverless instance, move to Redis/Upstash KV if brute-force traffic grows across instances
const store = new Map<string, RateLimitEntry>();

function pruneExpired(now: number): void {
  if (store.size < 200) return;
  for (const [key, entry] of store.entries()) {
    if (now - entry.windowStart >= WINDOW_MS) {
      store.delete(key);
    }
  }
}

export function getRateLimitStatus(ip: string): {
  blocked: boolean;
  remaining: number;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  pruneExpired(now);

  const entry = store.get(ip);
  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    if (entry) store.delete(ip);
    return { blocked: false, remaining: MAX_FAILURES, retryAfterSeconds: 0 };
  }

  const remaining = Math.max(0, MAX_FAILURES - entry.failures);
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((WINDOW_MS - (now - entry.windowStart)) / 1000)
  );

  return {
    blocked: entry.failures >= MAX_FAILURES,
    remaining,
    retryAfterSeconds,
  };
}

export function recordLoginFailure(ip: string): {
  blocked: boolean;
  remaining: number;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  pruneExpired(now);

  const existing = store.get(ip);
  if (!existing || now - existing.windowStart >= WINDOW_MS) {
    store.set(ip, { failures: 1, windowStart: now });
  } else {
    existing.failures += 1;
    store.set(ip, existing);
  }

  return getRateLimitStatus(ip);
}

export function clearLoginFailures(ip: string): void {
  store.delete(ip);
}
