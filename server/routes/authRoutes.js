/*
 * Purpose: Connects auth URLs to the auth controller.
 * Theme: Virtual identity
 * Portions generated with AI assistance (Cursor) - reviewed and understood by the author.
 */

const express = require('express');
const { register, login, logout, getMe } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);

module.exports = router;
