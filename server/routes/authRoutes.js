/*
 * Purpose: Connects auth URLs to the auth controller with security rate limiting.
 * Theme: Virtual identity
 */

const express = require('express');
const { register, login, logout, getMe } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { loginRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', register);
// 70+ Security: Attach rate limiter to login route to mitigate brute-force dictionary attacks
router.post('/login', loginRateLimiter, login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);

module.exports = router;
