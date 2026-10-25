/*
 * Purpose: Loads a puzzle from the Banana API, and checks a player's guess.
 * Theme: Interoperability
 * Portions generated with AI assistance (Cursor) - reviewed and understood by the author.
 *
 * GET  /api/puzzle does not require login, so you can see that the solution is still hidden.
 * POST /api/puzzle/answer requires login. The route file attaches requireAuth.
 */

const { getBananaPuzzle } = require('../services/bananaService');
const { saveSolution, checkAndRemove } = require('../services/puzzleStore');
const Score = require('../models/Score');

// GET /api/puzzle
// Fetches one puzzle and returns the image plus an id. The digit stays on the server.
async function getPuzzle(req, res) {
  try {
    const puzzle = await getBananaPuzzle();
    const puzzleId = saveSolution(puzzle.solution);

    // Do not add puzzle.solution to this object. The browser must not see it.
    return res.status(200).json({
      success: true,
      puzzleId,
      imageUrl: puzzle.imageUrl
    });
  } catch (error) {
    const status = error.statusCode || 502;
    return res.status(status).json({
      success: false,
      message: error.message || 'Could not load a puzzle'
    });
  }
}

// Add 1 to the player's attempts. Add 1 point only when the guess was right.
async function saveScore(userId, correct) {
  return Score.findOneAndUpdate(
    { user: userId },
    {
      $inc: {
        totalAttempts: 1,
        correctCount: correct ? 1 : 0,
        points: correct ? 1 : 0
      },
      $setOnInsert: { createdAt: new Date() }
    },
    { upsert: true, new: true }
  );
}

// POST /api/puzzle/answer
// Body: { puzzleId, answer }. answer must be one digit.
async function submitAnswer(req, res) {
  try {
    const puzzleId = req.body ? req.body.puzzleId : null;
    const rawAnswer = req.body ? req.body.answer : undefined;
    const answerText = rawAnswer === undefined || rawAnswer === null ? '' : String(rawAnswer).trim();

    if (typeof puzzleId !== 'string' || puzzleId.length < 10 || puzzleId.length > 80) {
      return res.status(400).json({
        success: false,
        message: 'Puzzle id is missing or not valid. Load a new puzzle.'
      });
    }

    // One character, and it must be a digit. "12", "", and "a" are rejected.
    if (!/^[0-9]$/.test(answerText)) {
      return res.status(400).json({
        success: false,
        message: 'Enter a single digit from 0 to 9.'
      });
    }

    const outcome = checkAndRemove(puzzleId, answerText);

    if (outcome === 'missing') {
      return res.status(404).json({
        success: false,
        message: 'This puzzle was already answered or does not exist. Load a new puzzle.'
      });
    }

    if (outcome === 'expired') {
      return res.status(404).json({
        success: false,
        message: 'This puzzle has expired. Load a new puzzle.'
      });
    }

    // req.user.id comes from the login cookie, not from the body.
    // A player cannot send someone else's id and add points to that account.
    const correct = outcome === 'correct';
    const score = await saveScore(req.user.id, correct);

    // success means the request worked. correct means the digit was right.
    // A wrong guess is still success: true, with correct: false.
    return res.status(200).json({
      success: true,
      correct,
      message: correct ? 'Correct' : 'Wrong',
      score: {
        points: score.points,
        correctCount: score.correctCount,
        totalAttempts: score.totalAttempts
      }
    });
  } catch (error) {
    console.error('submitAnswer failed:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Could not save your answer. Is MongoDB running?'
    });
  }
}

module.exports = {
  getPuzzle,
  submitAnswer
};
