/*
 * Purpose: Connects the game URLs to the game controller. Every route needs a login cookie.
 * Theme: Virtual identity
 */

const express = require('express');
const {
  startGame,
  getCurrentPuzzle,
  submitAnswer,
  useHint,
  finishGame
} = require('../controllers/gameController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/start', requireAuth, startGame);
router.get('/puzzle', requireAuth, getCurrentPuzzle);
router.post('/answer', requireAuth, submitAnswer);
router.post('/hint', requireAuth, useHint);
router.post('/finish', requireAuth, finishGame);

module.exports = router;
