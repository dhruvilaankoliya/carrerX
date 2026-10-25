/**
 * In-memory sliding-window rate limiter for API routes
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    rateLimitStore.forEach((record, key) => {
      record.timestamps = record.timestamps.filter((ts: number) => now - ts < 60000);
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    });
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  limit?: number; // max requests
  windowMs?: number; // window size in milliseconds
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): { success: boolean; remaining: number; resetMs: number } {
  const limit = options.limit ?? 15; // default 15 requests
  const windowMs = options.windowMs ?? 60 * 1000; // default 1 minute
  const now = Date.now();

  const record = rateLimitStore.get(identifier) || { timestamps: [] };
  // Remove timestamps outside window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const resetMs = windowMs - (now - oldest);
    return { success: false, remaining: 0, resetMs };
  }

  record.timestamps.push(now);
  rateLimitStore.set(identifier, record);

  return {
    success: true,
    remaining: limit - record.timestamps.length,
    resetMs: windowMs,
  };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || '127.0.0.1';
}
