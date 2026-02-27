// lib/rateLimit.js
const rateLimitStore = new Map();

export function apiLimiter(req, { windowMs = 60 * 1000, max = 50 } = {}) {
  const ip = req.headers.get("x-forwarded-for") || req.ip || "unknown";

  const now = Date.now();
  const record = rateLimitStore.get(ip) || { count: 0, lastRequest: now };

  if (now - record.lastRequest > windowMs) {
    // Reset count after window
    record.count = 0;
    record.lastRequest = now;
  }

  record.count += 1;
  record.lastRequest = now;

  rateLimitStore.set(ip, record);

  if (record.count > max) {
    throw new Error("Too many requests, slow down.");
  }
}
