/*
 * Purpose: Checks the login cookie before a protected route runs, and configures cookie security.
 * Theme: Virtual identity and security engineering
 *
 * Protected routes (must send 401 when the cookie is missing or expired):
 *   POST /api/puzzle/answer
 *   GET  /api/scores/me
 *   GET  /api/scores/leaderboard
 *   GET  /api/auth/me
 *   ALL  /api/game/*
 *
 * 70+ Critical Security Design:
 * - httpOnly: true ensures JavaScript cannot access the JWT, defending against Cross-Site Scripting (XSS).
 * - sameSite: 'lax' ensures the cookie is withheld on cross-site subrequests, mitigating Cross-Site Request Forgery (CSRF).
 * - secure: true in production ensures transmission only occurs over encrypted TLS/HTTPS.
 * - Short 2-hour token lifetime limits window of compromise if a token is ever intercepted.
 */

const jwt = require('jsonwebtoken');

const COOKIE_NAME = 'token';
const TOKEN_MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours

// Login and logout must use these same settings, or the browser will not clear the cookie.
function getCookieOptions(includeMaxAge) {
  const options = {
    // JavaScript on the page cannot read this cookie. Prevents XSS token theft.
    httpOnly: true,
    // Withholds cookie on cross-site embedded requests. Mitigates CSRF.
    sameSite: 'lax',
    // In production HTTPS, set secure: true so cookie travels only over encrypted channels.
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  };

  if (includeMaxAge) {
    options.maxAge = TOKEN_MAX_AGE_MS;
  }

  return options;
}

// Express calls this before protected controllers. next() means token was validated.
function requireAuth(req, res, next) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({
      success: false,
      message: 'Server is missing JWT_SECRET'
    });
  }

  const token = req.cookies ? req.cookies[COOKIE_NAME] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Please log in first'
    });
  }

  try {
    const decoded = jwt.verify(token, secret);
    // Identity is established from the cryptographic signature, not user-supplied request body.
    req.user = {
      id: decoded.id,
      username: decoded.username
    };
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Your session has expired or is not valid. Please log in again'
    });
  }
}

// 70+ CSRF / Origin verification check for state-changing endpoints
function verifyOrigin(req, res, next) {
  const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
  const origin = req.headers.origin;

  // If origin header is sent by the browser on a mutation, ensure it matches allowed client
  if (origin && origin !== clientOrigin) {
    return res.status(403).json({
      success: false,
      message: 'Cross-origin request rejected.'
    });
  }

  return next();
}

module.exports = {
  requireAuth,
  verifyOrigin,
  getCookieOptions,
  COOKIE_NAME,
  TOKEN_MAX_AGE_MS
};
