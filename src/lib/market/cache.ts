/**
 * Tiny in-process TTL cache with single-flight de-duplication.
 *
 * This keeps us comfortably inside Finnhub's free-tier limit (60 req/min): all
 * users of one server instance share a cached value, and concurrent misses for
 * the same key make just one upstream request. It is per-instance and resets on
 * deploy — good enough for MVP; swap for Redis when running multiple instances.
 */

interface Entry<T> {
  value: T;
  expires: number;
}

const store = new Map<string, Entry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

export async function cached<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && hit.expires > now) return hit.value;

  const running = inflight.get(key) as Promise<T> | undefined;
  if (running) return running;

  const promise = (async () => {
    try {
      const value = await loader();
      store.set(key, { value, expires: Date.now() + ttlSeconds * 1000 });
      return value;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, promise);
  return promise;
}
