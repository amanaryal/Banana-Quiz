/*
 * Purpose: Checks the login cookie before a protected route runs.
 * Theme: Virtual identity
 * Portions generated with AI assistance (Cursor) - reviewed and understood by the author.
 *
 * Protected routes (must send 401 when the cookie is missing or expired):
 *   POST /api/puzzle/answer
 *   GET  /api/scores/me
 *   GET  /api/scores/leaderboard
 *   GET  /api/auth/me
 */

const jwt = require('jsonwebtoken');

const COOKIE_NAME = 'token';
const TOKEN_MAX_AGE_MS = 2 * 60 * 60 * 1000;

// Login and logout must use these same settings, or the browser will not clear the cookie.
function getCookieOptions(includeMaxAge) {
  const options = {
    // JavaScript on the page cannot read this cookie. That is safer than localStorage if a script is injected (XSS).
    httpOnly: true,
    // The cookie is sent from our React app to our API. Most cross-site form posts will not include it.
    sameSite: 'lax',
    // On a real HTTPS site, set NODE_ENV=production so the cookie is not sent over plain HTTP.
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  };

  if (includeMaxAge) {
    options.maxAge = TOKEN_MAX_AGE_MS;
  }

  return options;
}

// Express calls this before the controller. next() means the cookie was valid.
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
    // The id comes from the token we signed, not from the request body.
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

module.exports = {
  requireAuth,
  getCookieOptions,
  COOKIE_NAME,
  TOKEN_MAX_AGE_MS
};
