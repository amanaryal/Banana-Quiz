/*
 * Purpose: The three game difficulties. The Banana API does not have a difficulty setting.
 * Theme: Interoperability (our server adds the rules the external API does not provide)
 * Portions generated with AI assistance (Cursor) - reviewed and understood by the author.
 *
 * Keep these numbers the same as client/src/constants/gameModes.js.
 * The server is the authority: the React cards are only labels.
 */

const ROUNDS_PER_GAME = 10;
const HINT_COST = 5;
const GRACE_MS = 1500;

const GAME_MODES = {
  easy: {
    id: 'easy',
    label: 'Easy',
    seconds: 60,
    lives: 5,
    hints: 2,
    basePoints: 10
  },
  medium: {
    id: 'medium',
    label: 'Medium',
    seconds: 30,
    lives: 3,
    hints: 1,
    basePoints: 20
  },
  hard: {
    id: 'hard',
    label: 'Hard',
    seconds: 15,
    lives: 1,
    hints: 0,
    basePoints: 40
  }
};

function getMode(name) {
  if (!name) {
    return null;
  }

  return GAME_MODES[String(name).toLowerCase()] || null;
}

module.exports = {
  GAME_MODES,
  ROUNDS_PER_GAME,
  HINT_COST,
  GRACE_MS,
  getMode
};
