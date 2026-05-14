// lib/rate-limiter.js
// In-memory rate limiter (no Redis needed)

const rateLimitMap = new Map();

export function rateLimit({
  identifier,       // e.g. IP or user ID
  limit = 10,       // requests allowed
  windowMs = 60 * 1000, // 60 seconds
}) {
  const key = `${identifier}:${Math.floor(Date.now() / windowMs)}`;
  const current = rateLimitMap.get(key) || 0;

  if (current >= limit) {
    return { success: false, remaining: 0 };
  }

  rateLimitMap.set(key, current + 1);

  // Clean up old entries (optional, prevents memory leak)
  setTimeout(() => rateLimitMap.delete(key), windowMs);

  return { success: true, remaining: limit - (current + 1) };
}