/*
 * Purpose: Register, log in, log out, and report who is logged in.
 * Theme: Virtual identity
 * Portions generated with AI assistance (Cursor) - reviewed and understood by the author.
 *
 * Security choices:
 * - Passwords are hashed with bcrypt (10 salt rounds). MongoDB stores passwordHash, never the plain password.
 * - The login token is a JWT in an httpOnly cookie, not in localStorage.
 *   Any script on the page can read localStorage (XSS). An httpOnly cookie cannot be read by script.
 * - The token expires after 2 hours. There is no refresh token, so the user logs in again.
 * - There is no CSRF token and no rate limiting.
 * - Alternatives: server-side sessions (the cookie is only an id, the server stores the login),
 *   or OAuth (for example "Sign in with Google").
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  getCookieOptions,
  COOKIE_NAME,
  TOKEN_MAX_AGE_MS
} = require('../middleware/auth');

const BCRYPT_SALT_ROUNDS = 10;

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

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Please enter a valid email address.' };
  }

  // A short password such as "123" is allowed, and a long one is allowed too.
  // The box cannot be empty. bcrypt only uses the first 72 characters.
  if (password.length < 1) {
    return { error: 'Please enter a password.' };
  }

  // bcrypt only uses the first 72 bytes of a password.
  if (password.length > 72) {
    return { error: 'Password must be 72 characters or fewer.' };
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

    // The plain password is used only to build the hash. We do not save it.
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
    // so we do not tell an attacker which of the two was incorrect.
    const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false;

    if (!user || !passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Email or password is incorrect.'
      });
    }

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
