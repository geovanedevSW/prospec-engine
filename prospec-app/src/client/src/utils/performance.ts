import { useState, useEffect } from 'react';

/**
 * Custom React Hook for Debouncing high-frequency events (Search, typing, resize).
 * Prevents triggering network queries and expensive re-renders on every keystroke.
 */
export function useDebounce<T>(value: T, delayMs: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}

// In-Memory Stale-While-Revalidate (SWR) Client Cache
interface ClientCacheEntry<T> {
  data: T;
  timestamp: number;
}

const clientCache = new Map<string, ClientCacheEntry<any>>();

/**
 * Stale-While-Revalidate (SWR) fetch helper.
 * 1. Instantly renders old/stale data from memory cache (0ms perceived latency, eliminating spinners/flash).
 * 2. Concurrently fetches the fresh data in background.
 * 3. Updates state and cache without layout shifts.
 */
export async function fetchWithSWR<T>(
  url: string,
  onData: (data: T, fromCache: boolean) => void,
  ttlMs: number = 20000
): Promise<T | null> {
  const cached = clientCache.get(url);
  const now = Date.now();

  if (cached) {
    onData(cached.data, true);
    // If still completely fresh within TTL, avoid redundant network hit
    if (now - cached.timestamp < ttlMs) {
      return cached.data;
    }
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as T;
    
    // Store in cache
    clientCache.set(url, { data: json, timestamp: Date.now() });
    onData(json, false);
    return json;
  } catch (err) {
    // If fetch failed but we had cached data, gracefully retain it
    if (cached) return cached.data;
    throw err;
  }
}

/**
 * Manually invalidate client cache when mutations happen (e.g. lead edit, status toggle)
 */
export function invalidateClientCache(urlPrefix?: string): void {
  if (!urlPrefix) {
    clientCache.clear();
    return;
  }
  for (const key of clientCache.keys()) {
    if (key.startsWith(urlPrefix)) {
      clientCache.delete(key);
    }
  }
}

// Hover prefetch cache for lead details
const prefetchCache = new Set<string>();

/**
 * Pre-fetches lead data in background upon mouse hover (intent-based prefetching),
 * making subsequent click and modal drawer open 100% instant with zero wait time.
 */
export function prefetchLeadDetails(leadId: string): void {
  if (!leadId || prefetchCache.has(leadId)) return;
  prefetchCache.add(leadId);

  // Background fetch without blocking main thread
  fetch(`/api/leads/${leadId}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.success && data.lead) {
        clientCache.set(`/api/leads/${leadId}`, {
          data,
          timestamp: Date.now(),
        });
      }
    })
    .catch(() => {
      // Ignore background prefetch network drops
      prefetchCache.delete(leadId);
    });
}

