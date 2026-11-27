import { NextResponse } from 'next/server';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
  etag: string;
}

class ProductionCacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private tagIndex = new Map<string, Set<string>>(); // tag -> set of cache keys

  constructor() {
    // Background garbage collection every 2 minutes
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.purgeExpired(), 2 * 60 * 1000);
    }
  }

  private generateEtag(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `W/"${Math.abs(hash).toString(36)}-${content.length.toString(36)}"`;
  }

  public get<T>(key: string): { data: T; etag: string; isStale: boolean } | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    const isStale = age > entry.ttlMs;

    return {
      data: entry.data as T,
      etag: entry.etag,
      isStale,
    };
  }

  public set<T>(key: string, data: T, ttlSeconds: number, tags: string[] = []): string {
    const serialized = JSON.stringify(data);
    const etag = this.generateEtag(serialized);

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttlMs: ttlSeconds * 1000,
      etag,
    });

    for (const tag of tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(key);
    }

    return etag;
  }

  /**
   * Invalidates all cache entries bound to a given tag (e.g. 'products', 'categories', 'translations')
   */
  public invalidateTag(tag: string): number {
    const keys = this.tagIndex.get(tag);
    if (!keys) return 0;

    let count = 0;
    keys.forEach((key) => {
      this.cache.delete(key);
      count++;
    });
    this.tagIndex.delete(tag);
    return count;
  }

  public purgeAll(): void {
    this.cache.clear();
    this.tagIndex.clear();
  }

  private purgeExpired(): void {
    const now = Date.now();
    this.cache.forEach((entry, key) => {
      // Allow stale-while-revalidate window of 2x TTL before hard purge
      if (now - entry.timestamp > entry.ttlMs * 2) {
        this.cache.delete(key);
      }
    });
  }

  public getStats() {
    return {
      keysCount: this.cache.size,
      tagsCount: this.tagIndex.size,
    };
  }
}

// Global singleton cache manager
const globalForCache = global as unknown as { cacheManager?: ProductionCacheManager };
export const cacheManager = globalForCache.cacheManager || new ProductionCacheManager();
if (process.env.NODE_ENV !== 'production') globalForCache.cacheManager = cacheManager;

/**
 * Returns HTTP response with proper caching headers (ETag, Cache-Control, stale-while-revalidate)
 * Handles client conditional requests (If-None-Match) returning 304 Not Modified to save server bandwidth.
 */
export function cachedJsonResponse(
  data: any,
  etag: string,
  clientIfNoneMatch: string | null,
  options: {
    maxAge?: number;
    staleWhileRevalidate?: number;
    customHeaders?: Record<string, string>;
  } = {}
): NextResponse {
  const maxAge = options.maxAge ?? 60; // 1 min browser/CDN cache
  const swr = options.staleWhileRevalidate ?? 300; // 5 min background revalidate

  const headers: Record<string, string> = {
    'ETag': etag,
    'Cache-Control': `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=${swr}`,
    'X-Cache-Status': 'HIT',
    ...(options.customHeaders || {}),
  };

  // If client's cached copy matches current ETag, return 304 without response body
  if (clientIfNoneMatch && clientIfNoneMatch === etag) {
    return new NextResponse(null, {
      status: 304,
      headers,
    });
  }

  return NextResponse.json(data, {
    status: 200,
    headers,
  });
}
