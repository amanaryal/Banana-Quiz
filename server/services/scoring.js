/*
 * Purpose: Turns a correct guess into points, and turns total points into a level.
 * Theme: Event-driven programming (the score is the result of a guess event)
 *
 * Example: Easy base is 10. A fast answer can add up to 5 time-bonus points.
 * Three correct answers in a row multiply by 1.5. Five in a row multiply by 2.
 */

function multiplierForStreak(streak) {
  if (streak >= 5) {
    return 2;
  }

  if (streak >= 3) {
    return 1.5;
  }

  return 1;
}

// secondsLeft is how many seconds were still on the clock when the guess arrived.
function scoreCorrectAnswer(mode, streakAfter, secondsLeft) {
  const timeRatio = Math.max(0, Math.min(1, secondsLeft / mode.seconds));
  const timeBonus = Math.round(mode.basePoints * timeRatio * 0.5);
  const multiplier = multiplierForStreak(streakAfter);
  const points = Math.round((mode.basePoints + timeBonus) * multiplier);

  return { timeBonus, multiplier, points };
}

function levelFromPoints(totalPoints) {
  const safe = Math.max(0, Number(totalPoints) || 0);
  return Math.floor(Math.sqrt(safe / 50)) + 1;
}

function xpProgress(totalPoints) {
  const level = levelFromPoints(totalPoints);
  const floorPoints = (level - 1) * (level - 1) * 50;
  const nextPoints = level * level * 50;
  const span = nextPoints - floorPoints;
  const into = Math.max(0, totalPoints - floorPoints);

  return {
    level,
    xpIntoLevel: into,
    xpForNext: span,
    percent: span === 0 ? 0 : Math.min(100, Math.round((into / span) * 100))
  };
}

function rankTitle(level) {
  if (level >= 9) {
    return 'Banana Legend';
  }

  if (level >= 6) {
    return 'Banana Master';
  }

  if (level >= 4) {
    return 'Banana Pro';
  }

  if (level >= 2) {
    return 'Banana Picker';
  }

  return 'Rookie';
}

// A hint never names the digit. The first hint says even or odd. The next hint gives a range.
function buildHint(solution, hintsUsed) {
  const digit = Number(solution);

  if (hintsUsed % 2 === 0) {
    return 'The missing digit is ' + (digit % 2 === 0 ? 'even.' : 'odd.');
  }

  const low = Math.max(0, digit - 2);
  const high = Math.min(9, digit + 2);
  return 'The missing digit is between ' + low + ' and ' + high + '.';
}

module.exports = {
  scoreCorrectAnswer,
  levelFromPoints,
  xpProgress,
  rankTitle,
  buildHint
};
