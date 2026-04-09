import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let redis: Redis | null = null;
let limiters: Record<string, Ratelimit> | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  return redis;
}

function getLimiters(): Record<string, Ratelimit> | null {
  if (limiters) return limiters;
  const r = getRedis();
  if (!r) return null;

  limiters = {
    webhook: new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(20, "1h"),
      prefix: "rl:webhook",
    }),
    checkout: new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(5, "1m"),
      prefix: "rl:checkout",
    }),
    delete: new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(1, "1h"),
      prefix: "rl:delete",
    }),
  };
  return limiters;
}

export async function checkRateLimit(
  limiterName: "webhook" | "checkout" | "delete",
  identifier: string
): Promise<{ allowed: boolean; remaining?: number }> {
  const l = getLimiters();
  if (!l) return { allowed: true }; // No Redis configured — allow all

  const limiter = l[limiterName];
  if (!limiter) return { allowed: true };

  try {
    const { success, remaining } = await limiter.limit(identifier);
    return { allowed: success, remaining };
  } catch (err) {
    console.error("Rate limit check failed:", err);
    return { allowed: true }; // Redis down — allow request rather than block
  }
}
