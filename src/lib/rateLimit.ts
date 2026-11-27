import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  maxRequests: number; // Max allowed in window
  windowMs: number;    // Time window in ms
  tierName: string;
}

interface ClientRecord {
  tokens: number;
  lastRefill: number;
  requests: number[];
}

// In-memory sliding window store (can be connected to Redis in multi-region setups)
const ipStore = new Map<string, ClientRecord>();

// Clean up stale IP records every 5 minutes to prevent memory leaks under millions of unique IPs
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    ipStore.forEach((record, key) => {
      if (now - record.lastRefill > 10 * 60 * 1000) {
        ipStore.delete(key);
      }
    });
  }, 5 * 60 * 1000);
}

// Production rate limit tiers tailored for heavy e-commerce traffic
export const RATE_LIMIT_TIERS = {
  // Browsing (catalog, categories, UI translations) - high throughput allowed
  BROWSE: { maxRequests: 200, windowMs: 60 * 1000, tierName: 'browse' },
  // Product Search - moderate throughput to protect database full-text scan
  SEARCH: { maxRequests: 60, windowMs: 60 * 1000, tierName: 'search' },
  // Checkout & Order Placement - strict to prevent carding, bot scalping, and race conditions
  CHECKOUT: { maxRequests: 15, windowMs: 60 * 1000, tierName: 'checkout' },
  // Authentication (Login) - strict anti-brute-force
  AUTH: { maxRequests: 10, windowMs: 60 * 1000, tierName: 'auth' },
} as const;

/**
 * Extracts client IP considering reverse proxies (Nginx, Cloudflare, ALB)
 */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();
  return '127.0.0.1';
}

/**
 * Enforces rate limiting on a NextRequest using a sliding window algorithm.
 * Returns null if allowed, or a 429 Too Many Requests response with standard headers.
 */
export function checkRateLimit(
  req: NextRequest,
  config: RateLimitConfig = RATE_LIMIT_TIERS.BROWSE
): { allowed: boolean; response?: NextResponse; headers: Record<string, string> } {
  const ip = getClientIp(req);
  const key = `${config.tierName}:${ip}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  let record = ipStore.get(key);
  if (!record) {
    record = { tokens: config.maxRequests, lastRefill: now, requests: [] };
    ipStore.set(key, record);
  }

  // Filter out timestamps outside the active sliding window
  record.requests = record.requests.filter((ts) => ts > windowStart);

  const currentRequests = record.requests.length;
  const remaining = Math.max(0, config.maxRequests - currentRequests - 1);
  const oldestRequest = record.requests[0] || now;
  const resetTimeMs = Math.ceil((oldestRequest + config.windowMs - now) / 1000);
  const retryAfterSec = Math.max(1, resetTimeMs);

  const rateLimitHeaders: Record<string, string> = {
    'X-RateLimit-Limit': config.maxRequests.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': (Math.floor(now / 1000) + retryAfterSec).toString(),
    'X-RateLimit-Tier': config.tierName,
  };

  if (currentRequests >= config.maxRequests) {
    rateLimitHeaders['Retry-After'] = retryAfterSec.toString();
    const response = NextResponse.json(
      {
        error: 'Too Many Requests',
        message: `Rate limit exceeded for ${config.tierName}. Please retry in ${retryAfterSec} seconds.`,
        retryAfter: retryAfterSec,
      },
      {
        status: 429,
        headers: rateLimitHeaders,
      }
    );
    return { allowed: false, response, headers: rateLimitHeaders };
  }

  // Allow and record current timestamp
  record.requests.push(now);
  record.lastRefill = now;

  return { allowed: true, headers: rateLimitHeaders };
}
