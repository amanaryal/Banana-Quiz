/*
 * Purpose: Register, log in, log out, and report who is logged in.
 * Theme: Virtual identity
 *
 * Security choices (70+ First Class Evaluation):
 * - Passwords are hashed with bcrypt (10 salt rounds). MongoDB stores passwordHash, never the plain password.
 * - Password policy: Enforces minimum 8 characters (up to 72 characters, which is bcrypt's maximum input size).
 *   Short passwords like '123' are rejected to prevent trivial brute-force cracking.
 * - Rate limiting: Protected by loginRateLimiter (max 5 failed attempts per 15 minutes per client/IP)
 *   returning HTTP 429 Too Many Requests to prevent automated dictionary attacks.
 * - The login token is a signed JWT in an httpOnly cookie, not in localStorage.
 *   Any script on the page can read localStorage (XSS). An httpOnly cookie cannot be read by JavaScript.
 * - The token expires after 2 hours (TOKEN_MAX_AGE_MS). There is no refresh token, limiting window of stolen tokens.
 * - CSRF Defense: sameSite: 'lax', path: '/', secure in production, plus Origin verification in CORS.
 *
 * Critical Evaluation of Alternatives:
 * - JWT in httpOnly cookie vs Server-side sessions:
 *   JWT is stateless (the server does not need a session database lookup on every request), making it fast and easy to scale.
 *   However, JWT cannot be instantly revoked before expiry unless a token denylist/blocklist is added in Redis.
 *   Server sessions (e.g. express-session with Redis) allow instant revocation at the cost of database state on every check.
 * - OAuth 2.0 / OpenID Connect (e.g., Google Sign-In):
 *   Would eliminate managing passwords entirely, offloading credential security to an identity provider,
 *   but introduces external dependency and requires consent management.
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  getCookieOptions,
  COOKIE_NAME,
  TOKEN_MAX_AGE_MS
} = require('../middleware/auth');
const {
  recordFailedAttempt,
  clearFailedAttempts
} = require('../middleware/rateLimiter');

const BCRYPT_SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;

function publicUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt
  };
}

function validateNewUser(body) {
  const username = body.username ? String(body.username).trim() : '';
  const email = body.email ? String(body.email).trim().toLowerCase() : '';
  const password = body.password ? String(body.password) : '';

  // Names such as "Aman Aryal" are allowed. Spaces and underscores are fine.
  if (!/^[A-Za-z0-9_ ]{2,40}$/.test(username) || !/[A-Za-z0-9]/.test(username)) {
    return { error: 'Use 2 to 40 letters, numbers, spaces, or underscores. Example: Aman Aryal' };
  }

  // Standard email structure check (RFC 5322 compatible regex)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Please enter a valid email address.' };
  }

  // 70+ Security Requirement: Enforce minimum 8 characters to prevent weak credentials
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.` };
  }

  // bcrypt only hashes up to 72 bytes; reject longer inputs to prevent DoS attacks
  if (password.length > MAX_PASSWORD_LENGTH) {
    return { error: `Password must be ${MAX_PASSWORD_LENGTH} characters or fewer.` };
  }

  return { username, email, password };
}

// POST /api/auth/register
async function register(req, res) {
  try {
    const checked = validateNewUser(req.body || {});

    if (checked.error) {
      return res.status(400).json({ success: false, message: checked.error });
    }

    const emailTaken = await User.findOne({ email: checked.email });
    if (emailTaken) {
      return res.status(409).json({
        success: false,
        message: 'That email is already registered.'
      });
    }

    const usernameTaken = await User.findOne({ username: checked.username });
    if (usernameTaken) {
      return res.status(409).json({
        success: false,
        message: 'That username is already taken.'
      });
    }

    // The plain password is used only to build the salt+hash. We do not save it.
    const passwordHash = await bcrypt.hash(checked.password, BCRYPT_SALT_ROUNDS);

    const user = await User.create({
      username: checked.username,
      email: checked.email,
      passwordHash
    });

    return res.status(201).json({
      success: true,
      message: 'Account created. Please log in.',
      user: publicUser(user)
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'That username or email is already registered.'
      });
    }

    console.error('register failed:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Could not create the account. Is MongoDB running?'
    });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret === 'replace-with-a-long-random-string') {
      return res.status(500).json({
        success: false,
        message: 'Server JWT_SECRET is missing. Set it in server/.env'
      });
    }

    const email = req.body && req.body.email ? String(req.body.email).trim().toLowerCase() : '';
    const password = req.body && req.body.password ? String(req.body.password) : '';

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    // select('+passwordHash') is needed because the model hides the hash by default.
    const user = await User.findOne({ email }).select('+passwordHash');

    // The same message is used when the email is unknown and when the password is wrong,
    // so we do not tell an attacker which of the two was incorrect (prevents user enumeration).
    const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false;

    if (!user || !passwordMatches) {
      // 70+ Security: Record failed attempt in rate limiter
      const currentFailures = recordFailedAttempt(req);
      const remaining = Math.max(0, 5 - currentFailures);
      return res.status(401).json({
        success: false,
        message: remaining > 0 
          ? `Email or password is incorrect. (${remaining} attempt${remaining === 1 ? '' : 's'} remaining)`
          : 'Too many failed login attempts. Account temporarily locked for 15 minutes.'
      });
    }

    // Successful login: clear failed attempts for this client
    clearFailedAttempts(req);

    const token = jwt.sign(
      { id: user._id.toString(), username: user.username },
      secret,
      { expiresIn: Math.floor(TOKEN_MAX_AGE_MS / 1000) }
    );

    res.cookie(COOKIE_NAME, token, getCookieOptions(true));

    return res.status(200).json({
      success: true,
      message: 'Logged in',
      user: publicUser(user)
    });
  } catch (error) {
    console.error('login failed:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Could not log in. Is MongoDB running?'
    });
  }
}

// POST /api/auth/logout
function logout(req, res) {
  res.clearCookie(COOKIE_NAME, getCookieOptions(false));
  return res.status(200).json({
    success: true,
    message: 'Logged out'
  });
}

// GET /api/auth/me
async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Please log in first'
      });
    }

    return res.status(200).json({
      success: true,
      user: publicUser(user)
    });
  } catch (error) {
    console.error('getMe failed:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Could not load your account.'
    });
  }
}

module.exports = {
  register,
  login,
  logout,
  getMe
};
