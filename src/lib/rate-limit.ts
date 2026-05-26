interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export function createRateLimiter(config: RateLimitConfig) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of hits) {
      if (now > value.resetAt) hits.delete(key);
    }
  }, 60000);

  return function check(key: string): RateLimitResult {
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || now > entry.resetAt) {
      hits.set(key, { count: 1, resetAt: now + config.windowMs });
      return { success: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
    }

    if (entry.count >= config.maxRequests) {
      return { success: false, remaining: 0, resetAt: entry.resetAt };
    }

    entry.count++;
    return { success: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt };
  };
}

export const loginLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 5 });
export const forgotPasswordLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 3 });

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}
