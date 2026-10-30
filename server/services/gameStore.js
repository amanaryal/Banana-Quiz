/*
 * Purpose: Remembers the game that is in progress for each logged-in player.
 * Theme: Interoperability and virtual identity
 *
 * The correct digit stays in this memory. The browser only receives the picture.
 * One player has one active game. Restarting the server forgets unfinished games.
 * Finished games are copied into MongoDB by gameController before they are deleted here.
 */

const crypto = require('crypto');

const games = new Map();

function getGame(userId) {
  return games.get(String(userId)) || null;
}

function removeGame(userId) {
  games.delete(String(userId));
}

function createGame(userId, mode) {
  const game = {
    gameId: crypto.randomUUID(),
    userId: String(userId),
    difficulty: mode.id,
    seconds: mode.seconds,
    maxLives: mode.lives,
    lives: mode.lives,
    hintsLeft: mode.hints,
    hintsUsed: 0,
    round: 1,
    streak: 0,
    bestStreak: 0,
    score: 0,
    timeBonusTotal: 0,
    correctCount: 0,
    answered: 0,
    startedAt: Date.now(),
    status: 'active',
    currentPuzzle: null
  };

  games.set(game.userId, game);
  return game;
}

// Stores the digit and the time the picture was issued. issuedAt is the server clock.
function setPuzzle(game, puzzle) {
  game.currentPuzzle = {
    puzzleId: crypto.randomUUID(),
    solution: Number(puzzle.solution),
    imageUrl: puzzle.imageUrl,
    issuedAt: Date.now()
  };
}

// Safe copy for the browser. Do not add solution to this object.
function publicGame(game) {
  if (!game) {
    return null;
  }

  return {
    gameId: game.gameId,
    difficulty: game.difficulty,
    round: game.round,
    roundsTotal: 10,
    lives: game.lives,
    maxLives: game.maxLives,
    hintsLeft: game.hintsLeft,
    streak: game.streak,
    bestStreak: game.bestStreak,
    score: game.score,
    timeBonusTotal: game.timeBonusTotal,
    correctCount: game.correctCount,
    answered: game.answered,
    seconds: game.seconds,
    imageUrl: game.currentPuzzle ? game.currentPuzzle.imageUrl : null,
    puzzleId: game.currentPuzzle ? game.currentPuzzle.puzzleId : null,
    issuedAt: game.currentPuzzle ? game.currentPuzzle.issuedAt : null,
    status: game.status
  };
}

module.exports = {
  getGame,
  removeGame,
  createGame,
  setPuzzle,
  publicGame
};
