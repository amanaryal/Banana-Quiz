/*
 * Purpose: Connects puzzle URLs to the puzzle controller.
 * Theme: Interoperability
 * Portions generated with AI assistance (Cursor) - reviewed and understood by the author.
 */

const express = require('express');
const { getPuzzle, submitAnswer } = require('../controllers/puzzleController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Public: returns the image and puzzleId, never the solution.
router.get('/', getPuzzle);

// Login required: checks the guess and saves the score.
router.post('/answer', requireAuth, submitAnswer);

module.exports = router;
