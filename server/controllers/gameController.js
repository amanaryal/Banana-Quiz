/*
 * Purpose: Starts a 10-round game, checks guesses, gives hints, and saves the result.
 * Theme: Interoperability and virtual identity
 * The Banana API is only asked for a picture and a digit. Difficulty, the clock,
 * lives, hints, and points are decided here. The digit is never sent to the browser.
 */

const { getMode, ROUNDS_PER_GAME, HINT_COST, GRACE_MS } = require('../config/gameModes');
const { getBananaPuzzle } = require('../services/bananaService');
const { scoreCorrectAnswer, buildHint } = require('../services/scoring');
const {
  getGame,
  removeGame,
  createGame,
  setPuzzle,
  publicGame
} = require('../services/gameStore');
const Game = require('../models/Game');

function fail(res, status, message) {
  return res.status(status).json({ success: false, message });
}

function bananaMessage(error) {
  if (error.statusCode === 504) {
    return 'The Banana service took too long. Try again.';
  }

  if (error.statusCode === 502) {
    return 'Banana service is down, try again.';
  }

  return 'Could not load a puzzle.';
}

async function giveNewPuzzle(game) {
  const puzzle = await getBananaPuzzle();
  setPuzzle(game, puzzle);
}

async function saveFinishedGame(game, userId) {
  const previous = await Game.findOne({ user: userId, difficulty: game.difficulty })
    .sort({ score: -1 });
  const previousBest = previous ? previous.score : null;
  const accuracy = game.answered === 0
    ? 0
    : Math.round((game.correctCount / game.answered) * 100);
  const durationSeconds = Math.max(0, Math.round((Date.now() - game.startedAt) / 1000));

  await Game.create({
    user: userId,
    difficulty: game.difficulty,
    score: game.score,
    correctCount: game.correctCount,
    totalRounds: game.answered,
    bestStreak: game.bestStreak,
    accuracy,
    durationSeconds,
    timeBonus: game.timeBonusTotal
  });

  removeGame(userId);

  return {
    score: game.score,
    accuracy,
    bestStreak: game.bestStreak,
    timeBonus: game.timeBonusTotal,
    correctCount: game.correctCount,
    totalRounds: game.answered,
    durationSeconds,
    difficulty: game.difficulty,
    personalBest: previousBest === null ? game.score > 0 : game.score > previousBest
  };
}

// POST /api/game/start  body: { difficulty: "easy" | "medium" | "hard" }
async function startGame(req, res) {
  try {
    const mode = getMode(req.body && req.body.difficulty);

    if (!mode) {
      return fail(res, 400, 'Choose easy, medium, or hard.');
    }

    const existing = getGame(req.user.id);

    if (existing && existing.status === 'active' && existing.answered > 0) {
      await saveFinishedGame(existing, req.user.id);
    } else if (existing) {
      removeGame(req.user.id);
    }

    const game = createGame(req.user.id, mode);
    await giveNewPuzzle(game);

    return res.status(200).json({
      success: true,
      game: publicGame(game)
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return fail(res, status, error.statusCode ? bananaMessage(error) : 'Could not start the game.');
  }
}

// GET /api/game/puzzle
// Returns the picture for the current round. The same picture is returned until it is answered.
async function getCurrentPuzzle(req, res) {
  try {
    const game = getGame(req.user.id);

    if (!game || game.status !== 'active') {
      return fail(res, 400, 'No active game. Choose a level and start again.');
    }

    if (!game.currentPuzzle) {
      await giveNewPuzzle(game);
    }

    return res.status(200).json({
      success: true,
      game: publicGame(game)
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return fail(res, status, error.statusCode ? bananaMessage(error) : 'Could not load a puzzle.');
  }
}

// POST /api/game/answer  body: { guess: "4" } or { timedOut: true }
async function submitAnswer(req, res) {
  try {
    const game = getGame(req.user.id);

    if (!game || game.status !== 'active' || !game.currentPuzzle) {
      return fail(res, 400, 'No active game. Choose a level and start again.');
    }

    const mode = getMode(game.difficulty);
    const elapsed = Date.now() - game.currentPuzzle.issuedAt;
    const limitMs = mode.seconds * 1000;
    const timedOut = Boolean(req.body && req.body.timedOut);

    // A digit that arrives after the limit plus a short grace period is rejected.
    // A timeout from the page is still accepted, so a slow network does not freeze the round.
    if (!timedOut && elapsed > limitMs + GRACE_MS) {
      return fail(res, 400, 'Too late. The time for this puzzle has passed.');
    }

    if (timedOut && elapsed < limitMs - 500) {
      return fail(res, 400, 'The timer is still running.');
    }

    const pastLimit = elapsed > limitMs;
    let correct = false;
    let pointsEarned = 0;
    let timeBonus = 0;
    let multiplier = 1;
    let reason = 'wrong';

    if (timedOut || pastLimit) {
      game.streak = 0;
      game.lives -= 1;
      reason = 'timeout';
    } else {
      const raw = req.body ? req.body.guess : undefined;
      const text = raw === undefined || raw === null ? '' : String(raw).trim();

      if (!/^[0-9]$/.test(text)) {
        return fail(res, 400, 'Enter a single digit from 0 to 9.');
      }

      correct = Number(text) === game.currentPuzzle.solution;

      if (correct) {
        const nextStreak = game.streak + 1;
        const secondsLeft = Math.max(0, mode.seconds - elapsed / 1000);
        const scored = scoreCorrectAnswer(mode, nextStreak, secondsLeft);
        pointsEarned = scored.points;
        timeBonus = scored.timeBonus;
        multiplier = scored.multiplier;
        game.streak = nextStreak;
        game.bestStreak = Math.max(game.bestStreak, nextStreak);
        game.score += pointsEarned;
        game.timeBonusTotal += timeBonus;
        game.correctCount += 1;
        reason = 'correct';
      } else {
        game.streak = 0;
        game.lives -= 1;
        reason = 'wrong';
      }
    }

    game.answered += 1;
    game.currentPuzzle = null;

    const gameOver = game.lives <= 0 || game.answered >= ROUNDS_PER_GAME;
    let result = null;

    if (gameOver) {
      result = await saveFinishedGame(game, req.user.id);
    } else {
      game.round = game.answered + 1;

      try {
        await giveNewPuzzle(game);
      } catch (loadError) {
        return res.status(loadError.statusCode || 502).json({
          success: false,
          message: bananaMessage(loadError),
          game: publicGame(game)
        });
      }
    }

    const message = reason === 'correct' ? 'Correct' : reason === 'timeout' ? 'Time is up' : 'Wrong';

    return res.status(200).json({
      success: true,
      correct,
      reason,
      message,
      pointsEarned,
      timeBonus,
      multiplier,
      finished: Boolean(result),
      game: result ? null : publicGame(getGame(req.user.id)),
      result
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return fail(res, status, error.statusCode ? bananaMessage(error) : 'Could not check that answer.');
  }
}

// POST /api/game/hint
async function useHint(req, res) {
  try {
    const game = getGame(req.user.id);

    if (!game || game.status !== 'active' || !game.currentPuzzle) {
      return fail(res, 400, 'No active game. Choose a level and start again.');
    }

    const elapsed = Date.now() - game.currentPuzzle.issuedAt;
    const limitMs = getMode(game.difficulty).seconds * 1000;

    if (elapsed > limitMs + GRACE_MS) {
      return fail(res, 400, 'Too late. The time for this puzzle has passed.');
    }

    if (game.hintsLeft <= 0) {
      return fail(res, 400, 'No hints left on this level.');
    }

    const hint = buildHint(game.currentPuzzle.solution, game.hintsUsed);
    game.hintsUsed += 1;
    game.hintsLeft -= 1;
    game.score = Math.max(0, game.score - HINT_COST);

    return res.status(200).json({
      success: true,
      hint,
      cost: HINT_COST,
      game: publicGame(game)
    });
  } catch (error) {
    return fail(res, 500, 'Could not use a hint.');
  }
}

// POST /api/game/finish
// The player quit, or the client is saving a game that is already over.
async function finishGame(req, res) {
  try {
    const game = getGame(req.user.id);

    if (!game || game.status !== 'active') {
      return fail(res, 400, 'No active game. Choose a level and start again.');
    }

    const result = await saveFinishedGame(game, req.user.id);

    return res.status(200).json({
      success: true,
      finished: true,
      result
    });
  } catch (error) {
    console.error('finishGame failed:', error.message);
    return fail(res, 500, 'Could not save the game.');
  }
}

module.exports = {
  startGame,
  getCurrentPuzzle,
  submitAnswer,
  useHint,
  finishGame
};
