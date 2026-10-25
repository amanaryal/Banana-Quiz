/*
 * Purpose: Remembers each puzzle's correct digit on the server, for a short time.
 * Theme: Interoperability
 * Portions generated with AI assistance (Cursor) - reviewed and understood by the author.
 *
 * The browser receives a puzzleId and the image only. It never receives the digit.
 * When the player submits a guess, we look the digit up here.
 *
 * Limitation: this memory is inside this one Node process. Restarting the server
 * forgets every puzzle. Two servers would not share the list.
 * Alternative: store the digit in the user's session, or in Redis.
 */

const crypto = require('crypto');

const puzzles = new Map();
const TEN_MINUTES_MS = 10 * 60 * 1000;
const PUZZLE_TTL_MS = Number(process.env.PUZZLE_TTL_MS) || TEN_MINUTES_MS;

// Drop old puzzles so the list does not grow forever.
function removeExpired() {
  const now = Date.now();

  for (const [puzzleId, entry] of puzzles) {
    if (entry.expiresAt <= now) {
      puzzles.delete(puzzleId);
    }
  }
}

// Save a solution and return a new id. The id is not the answer.
function saveSolution(solution) {
  removeExpired();

  const puzzleId = crypto.randomUUID();
  puzzles.set(puzzleId, {
    solution: Number(solution),
    expiresAt: Date.now() + PUZZLE_TTL_MS
  });

  return puzzleId;
}

// Check one guess, then forget the puzzle so the same id cannot be tried again.
// Returns 'correct', 'wrong', 'expired', or 'missing'.
function checkAndRemove(puzzleId, answer) {
  const entry = puzzles.get(puzzleId);

  if (!entry) {
    return 'missing';
  }

  if (entry.expiresAt <= Date.now()) {
    puzzles.delete(puzzleId);
    return 'expired';
  }

  const correct = Number(answer) === entry.solution;
  puzzles.delete(puzzleId);
  return correct ? 'correct' : 'wrong';
}

module.exports = {
  saveSolution,
  checkAndRemove
};
