/*
 * Purpose: Describes one player's saved score in MongoDB.
 * Theme: Virtual identity
 *
 * Older one-row-per-user total from the first version of the quiz.
 * New finished games are stored by models/Game.js.
 * The profile still adds these old points into the lifetime total.
 */

const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  points: {
    type: Number,
    default: 0
  },
  correctCount: {
    type: Number,
    default: 0
  },
  totalAttempts: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Score', scoreSchema);
