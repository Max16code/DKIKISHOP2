import rateLimit from "express-rate-limit";

export function apiLimiter() {
  return rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 50, // limit each IP to 50 requests per minute
    message: "Too many requests, slow down."
  });
}
