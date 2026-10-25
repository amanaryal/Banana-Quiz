/*
 * Purpose: The same three difficulties as the server, used only to label the level cards.
 * Theme: Interoperability
 * Portions generated with AI assistance (Cursor) - reviewed and understood by the author.
 *
 * The server decides the real timer, lives, and points. If these labels ever disagree
 * with server/config/gameModes.js, trust the server.
 */

export const GAME_MODES = [
  {
    id: 'easy',
    label: 'Easy',
    seconds: 60,
    lives: 5,
    hints: 2,
    basePoints: 10,
    blurb: 'A calm minute, five lives, and two hints.'
  },
  {
    id: 'medium',
    label: 'Medium',
    seconds: 30,
    lives: 3,
    hints: 1,
    basePoints: 20,
    blurb: 'Half a minute, three lives, and one hint.'
  },
  {
    id: 'hard',
    label: 'Hard',
    seconds: 15,
    lives: 1,
    hints: 0,
    basePoints: 40,
    blurb: 'Fifteen seconds, one life, no hints.'
  }
];

export const ROUNDS_PER_GAME = 10;
