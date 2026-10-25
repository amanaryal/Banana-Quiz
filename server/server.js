/*
 * Purpose: Starts the Express server and mounts every route.
 * Theme: All four themes (this file connects the pieces)
 * Portions generated with AI assistance (Cursor) - reviewed and understood by the author.
 *
 * Routes:
 *   GET  /api/health
 *   GET  /api/puzzle
 *   POST /api/puzzle/answer          login required
 *   POST /api/auth/register
 *   POST /api/auth/login
 *   POST /api/auth/logout
 *   GET  /api/auth/me                login required
 *   POST /api/game/start             login required
 *   GET  /api/game/puzzle            login required
 *   POST /api/game/answer            login required
 *   POST /api/game/hint              login required
 *   POST /api/game/finish            login required
 *   GET  /api/scores/preview         public top 3
 *   GET  /api/scores/me              login required
 *   GET  /api/scores/leaderboard     login required
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connectDB, isDatabaseConnected } = require('./config/db');
const puzzleRoutes = require('./routes/puzzleRoutes');
const authRoutes = require('./routes/authRoutes');
const scoreRoutes = require('./routes/scoreRoutes');
const gameRoutes = require('./routes/gameRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// The browser is on a different port from this server, so this is cross-origin.
// credentials: true lets the browser send the login cookie.
// origin must be the real React address, not "*", when cookies are used.
app.use(cors({
  origin: clientOrigin,
  credentials: true
}));

app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    database: isDatabaseConnected() ? 'connected' : 'disconnected'
  });
});

app.use('/api/puzzle', puzzleRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/game', gameRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Express needs 4 parameters here so it treats this as an error handler.
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      message: 'Request body must be JSON'
    });
  }

  console.error(error);
  return res.status(500).json({
    success: false,
    message: 'Something went wrong on the server'
  });
});

async function start() {
  const dbOk = await connectDB();

  if (!dbOk) {
    console.log('Server will still start, but login and scores need MongoDB.');
  }

  app.listen(PORT, () => {
    console.log('Server listening on port ' + PORT);
    console.log('Allowed browser origin: ' + clientOrigin);
  });
}

start();
