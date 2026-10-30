/*
 * Purpose: Connects score URLs to the score controller.
 * Theme: Virtual identity
 */

const express = require('express');
const { getMyScore, getLeaderboard, getPreview } = require('../controllers/scoreController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Public: three names for the landing page. No email and no cookie required.
router.get('/preview', getPreview);
router.get('/me', requireAuth, getMyScore);
router.get('/leaderboard', requireAuth, getLeaderboard);

module.exports = router;
