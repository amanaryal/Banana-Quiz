/*
 * Purpose: Profile totals and the filtered top-10 leaderboard, read from finished games.
 * Theme: Virtual identity
 * Portions generated with AI assistance (Cursor) - reviewed and understood by the author.
 */

const Game = require('../models/Game');
const Score = require('../models/Score');
const User = require('../models/User');
const { levelFromPoints, xpProgress, rankTitle } = require('../services/scoring');

function periodStart(period) {
  const now = new Date();

  if (period === 'today') {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (period === 'week') {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  return null;
}

function buildMatch(difficulty, period) {
  const match = {};

  if (difficulty && difficulty !== 'all') {
    match.difficulty = difficulty;
  }

  const start = periodStart(period);

  if (start) {
    match.createdAt = { $gte: start };
  }

  return match;
}

async function lifetimePointsByUser() {
  const rows = await Game.aggregate([
    { $group: { _id: '$user', totalPoints: { $sum: '$score' } } }
  ]);
  const totals = new Map(rows.map((row) => [String(row._id), row.totalPoints]));
  const oldScores = await Score.find().select('user points');

  oldScores.forEach((row) => {
    const key = String(row.user);
    totals.set(key, (totals.get(key) || 0) + (row.points || 0));
  });

  return totals;
}

function shapePlayer(row, rank, totals) {
  const totalPoints = totals.get(String(row._id)) || row.totalPoints || 0;
  const level = levelFromPoints(totalPoints);

  return {
    rank,
    username: row.username || 'Unknown',
    bestScore: row.bestScore || 0,
    gamesPlayed: row.gamesPlayed || 0,
    accuracy: Math.round(row.accuracy || 0),
    level,
    rankTitle: rankTitle(level)
  };
}

// GET /api/scores/me
async function getMyScore(req, res) {
  try {
    const user = await User.findById(req.user.id);
    const games = await Game.find({ user: req.user.id }).sort({ createdAt: -1 });
    const old = await Score.findOne({ user: req.user.id });
    const gamePoints = games.reduce((sum, game) => sum + game.score, 0);
    const totalPoints = gamePoints + (old ? old.points : 0);
    const xp = xpProgress(totalPoints);
    const answered = games.reduce((sum, game) => sum + game.totalRounds, 0);
    const correct = games.reduce((sum, game) => sum + game.correctCount, 0);
    const bestByDifficulty = { easy: 0, medium: 0, hard: 0 };

    games.forEach((game) => {
      if (game.score > bestByDifficulty[game.difficulty]) {
        bestByDifficulty[game.difficulty] = game.score;
      }
    });

    const bestStreak = games.reduce((best, game) => Math.max(best, game.bestStreak), 0);

    return res.status(200).json({
      success: true,
      profile: {
        username: user ? user.username : '',
        email: user ? user.email : '',
        totalPoints,
        level: xp.level,
        rankTitle: rankTitle(xp.level),
        xpIntoLevel: xp.xpIntoLevel,
        xpForNext: xp.xpForNext,
        percent: xp.percent,
        gamesPlayed: games.length,
        accuracy: answered === 0 ? 0 : Math.round((correct / answered) * 100),
        bestStreak,
        bestByDifficulty,
        recent: games.slice(0, 5).map((game) => ({
          id: game._id,
          difficulty: game.difficulty,
          score: game.score,
          accuracy: game.accuracy,
          bestStreak: game.bestStreak,
          createdAt: game.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('getMyScore failed:', error.message);
    return res.status(500).json({ success: false, message: 'Could not load your profile.' });
  }
}

// GET /api/scores/leaderboard?difficulty=easy|medium|hard|all&period=all|week|today
async function getLeaderboard(req, res) {
  try {
    const difficulty = String(req.query.difficulty || 'all').toLowerCase();
    const period = String(req.query.period || 'all').toLowerCase();

    if (!['easy', 'medium', 'hard', 'all'].includes(difficulty)) {
      return res.status(400).json({ success: false, message: 'Difficulty must be easy, medium, hard, or all.' });
    }

    if (!['all', 'week', 'today'].includes(period)) {
      return res.status(400).json({ success: false, message: 'Period must be all, week, or today.' });
    }

    const grouped = await Game.aggregate([
      { $match: buildMatch(difficulty, period) },
      {
        $group: {
          _id: '$user',
          bestScore: { $max: '$score' },
          gamesPlayed: { $sum: 1 },
          accuracy: { $avg: '$accuracy' },
          totalPoints: { $sum: '$score' }
        }
      },
      { $sort: { bestScore: -1, gamesPlayed: 1 } }
    ]);

    const users = await User.find({ _id: { $in: grouped.map((row) => row._id) } }).select('username');
    const names = new Map(users.map((user) => [String(user._id), user.username]));
    const totals = await lifetimePointsByUser();

    grouped.forEach((row) => {
      row.username = names.get(String(row._id)) || 'Unknown';
    });

    const leaderboard = grouped.slice(0, 10).map((row, index) => shapePlayer(row, index + 1, totals));
    const myIndex = grouped.findIndex((row) => String(row._id) === String(req.user.id));
    const myRank = myIndex === -1 ? null : shapePlayer(grouped[myIndex], myIndex + 1, totals);

    return res.status(200).json({
      success: true,
      difficulty,
      period,
      leaderboard,
      myRank
    });
  } catch (error) {
    console.error('getLeaderboard failed:', error.message);
    return res.status(500).json({ success: false, message: 'Could not load the leaderboard.' });
  }
}

// GET /api/scores/preview
// Public on purpose: the landing page shows three names and scores before login.
async function getPreview(req, res) {
  try {
    const rows = await Game.aggregate([
      { $group: { _id: '$user', bestScore: { $max: '$score' } } },
      { $sort: { bestScore: -1 } },
      { $limit: 3 }
    ]);
    const users = await User.find({ _id: { $in: rows.map((row) => row._id) } }).select('username');
    const names = new Map(users.map((user) => [String(user._id), user.username]));

    return res.status(200).json({
      success: true,
      top: rows.map((row, index) => ({
        rank: index + 1,
        username: names.get(String(row._id)) || 'Unknown',
        bestScore: row.bestScore
      }))
    });
  } catch (error) {
    console.error('getPreview failed:', error.message);
    return res.status(500).json({ success: false, message: 'Could not load the top scores.' });
  }
}

module.exports = {
  getMyScore,
  getLeaderboard,
  getPreview
};
