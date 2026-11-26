/*
 * Purpose: In-memory rate limiting to protect authentication routes against brute-force attacks.
 * Theme: Virtual identity and security engineering
 *
 * Security role:
 * - A remote attacker could attempt automated dictionary attacks on /api/auth/login.
 * - This middleware limits failed attempts to 5 per 15-minute window per IP / identifier.
 * - Exceeding the threshold returns HTTP 429 (Too Many Requests) with a Retry-After header.
 * - Successful authentication clears the failed attempt counter.
 *
 * Alternative comparison:
 * - In-memory Map: Zero external dependencies, fast, suitable for single-node deployment.
 * - Redis-backed rate limiter: Scalable across multi-server clusters; persists across restarts.
 */

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// Map of key -> { count: number, firstAttemptAt: number, blockedUntil: number }
const attempts = new Map();

// Periodically clean up expired entries to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of attempts.entries()) {
    if (now - data.firstAttemptAt > WINDOW_MS && now > data.blockedUntil) {
      attempts.delete(key);
    }
  }
}, 10 * 60 * 1000);

function getClientIdentifier(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? String(forwarded).split(',')[0].trim() : req.socket.remoteAddress || '127.0.0.1';
  const email = req.body && req.body.email ? String(req.body.email).trim().toLowerCase() : '';
  return email ? `${ip}:${email}` : ip;
}

function loginRateLimiter(req, res, next) {
  const key = getClientIdentifier(req);
  const now = Date.now();
  const record = attempts.get(key);

  if (record && record.blockedUntil > now) {
    const retryAfterSeconds = Math.ceil((record.blockedUntil - now) / 1000);
    res.set('Retry-After', String(retryAfterSeconds));
    return res.status(429).json({
      success: false,
      message: `Too many failed login attempts. Please wait ${Math.ceil(retryAfterSeconds / 60)} minutes before trying again.`
    });
  }

  return next();
}

function recordFailedAttempt(req) {
  const key = getClientIdentifier(req);
  const now = Date.now();
  const record = attempts.get(key);

  if (!record || (now - record.firstAttemptAt > WINDOW_MS && now > record.blockedUntil)) {
    attempts.set(key, {
      count: 1,
      firstAttemptAt: now,
      blockedUntil: 0
    });
    return 1;
  }

  record.count += 1;
  if (record.count >= MAX_ATTEMPTS) {
    record.blockedUntil = now + WINDOW_MS;
  }

  return record.count;
}

function clearFailedAttempts(req) {
  const key = getClientIdentifier(req);
  attempts.delete(key);
}

module.exports = {
  loginRateLimiter,
  recordFailedAttempt,
  clearFailedAttempts
};
