// Shared client-side fetch coalescing for official Nepal feeds (NRB, FENEGOSIDA, Kalimati)
// Prevents duplicate concurrent HTTP calls when multiple homepage sections mount simultaneously.

const CLIENT_TTL_MS = 60_000;

interface CachedEntry<T> {
  fetchedAt: number;
  data: T | null;
  inFlight: Promise<T | null> | null;
}

const cache: Record<string, CachedEntry<any>> = {};

export async function fetchSharedJson<T = any>(url: string): Promise<T | null> {
  const now = Date.now();
  const entry = cache[url];

  if (entry?.data && now - entry.fetchedAt < CLIENT_TTL_MS) {
    return entry.data as T;
  }

  if (entry?.inFlight) {
    return entry.inFlight as Promise<T | null>;
  }

  const promise = fetch(url)
    .then(async (res) => {
      if (!res.ok) return null;
      const json = (await res.json()) as T;
      cache[url] = { fetchedAt: Date.now(), data: json, inFlight: null };
      return json;
    })
    .catch(() => {
      if (cache[url]) {
        cache[url].inFlight = null;
      }
      return null;
    });

  cache[url] = {
    fetchedAt: entry?.fetchedAt ?? 0,
    data: entry?.data ?? null,
    inFlight: promise,
  };

  return promise;
}
