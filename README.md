<!--
Purpose: How to run Banana Quiz Challenge, and where the main API routes are.
Theme: All four themes
Portions generated with AI assistance (Cursor) - reviewed and understood by the author.
-->

# Banana Quiz Challenge

CIS046-3 Software for Enterprise, Assignment 1 (University of Bedfordshire).

A 10-round banana game. The player picks Easy, Medium, or Hard, sees a puzzle from the Banana API, and guesses the missing digit before the timer runs out. Lives, hints, streaks, and points are decided by our server. Logged-in players get a profile, XP, and a filtered leaderboard.

The browser talks only to the Express server. The Express server talks to the Banana API and to MongoDB. The correct digit is not sent to the browser.

## Tech stack

| Part | Tools |
| --- | --- |
| Client | React, Vite, plain CSS, `fetch` |
| Server | Node, Express, Mongoose, bcrypt, jsonwebtoken, cookie-parser, cors, dotenv |
| Database | MongoDB |
| External API | [Banana Game API](https://marcconrad.com/uob/banana/doc.php) |

## Setup

You need Node.js 18 or newer, and MongoDB running on your machine.

1. Start MongoDB (on this PC the Windows service is named `MongoDB`).
2. Install each part once, and create the server settings file:

```bash
cd server
npm install
copy .env.example .env
cd ../client
npm install
cd ..
```

Edit `server/.env`. Set `JWT_SECRET` to a long random string. Do not commit `.env`.

3. From the Banana Quiz folder (the folder VS Code opens), start both:

```bash
npm run dev
```

That command starts the API on http://localhost:5000 and the website on http://localhost:5173. Open the website, register, and play. Press Ctrl+C to stop both.

4. Optional check of the external API, from the `server` folder:

```bash
npm run test:banana
```

That script prints the real Banana response, including the solution. The game routes do not.

## How a game works

- Easy: 60 seconds, 5 lives, 2 hints, 10 base points.
- Medium: 30 seconds, 3 lives, 1 hint, 20 base points.
- Hard: 15 seconds, 1 life, no hints, 40 base points.
- A game is 10 rounds, or it ends when lives reach 0.
- Three correct answers in a row score ×1.5. Five in a row score ×2. A faster answer adds a time bonus.
- A hint costs 5 points and only says even/odd or a range. It never shows the digit.
- The Banana API is not asked for a difficulty. It only supplies the picture and the hidden digit.

## API

Errors use `{ "success": false, "message": "..." }`.

| Method | Path | Login | What it does |
| --- | --- | --- | --- |
| GET | `/api/health` | No | Says the server is up, and whether MongoDB is connected |
| POST | `/api/game/start` | Yes | Starts 10 rounds. Body: `{ "difficulty": "easy" }` |
| GET | `/api/game/puzzle` | Yes | Current picture, round, lives, and timer. No solution |
| POST | `/api/game/answer` | Yes | Body `{ "guess": "4" }` or `{ "timedOut": true }` |
| POST | `/api/game/hint` | Yes | Even/odd or a range. Costs 5 points |
| POST | `/api/game/finish` | Yes | Saves the game and returns the result |
| GET | `/api/puzzle` | No | Older single-puzzle route. Still hides the solution |
| POST | `/api/auth/register` | No | Creates a user. Stores a bcrypt hash |
| POST | `/api/auth/login` | No | Checks the password and sets an httpOnly cookie |
| POST | `/api/auth/logout` | No | Clears the cookie |
| GET | `/api/auth/me` | Yes | Returns the current user |
| GET | `/api/scores/preview` | No | Top 3 names for the home page |
| GET | `/api/scores/me` | Yes | Profile: level, XP, best scores, last 5 games |
| GET | `/api/scores/leaderboard` | Yes | Top 10. Query `difficulty` and `period` |

A missing or expired login cookie gets **401**.

## Project folders

| Path | Role |
| --- | --- |
| `client/src/pages` | Home, level select, game, result, login, leaderboard, profile |
| `client/src/components` | Navbar, number pad, timer, lives, modal, confetti |
| `server/config/gameModes.js` | Easy, medium, and hard rules |
| `server/services/gameStore.js` | The hidden digit and the clock for the active game |
| `server/models/Game.js` | One saved game. The older `Score` model is only a lifetime bonus |
| `docs` | Architecture, API evidence, tests, video notes |

## Screenshots

Add your own images before you submit. Suggested shots:

- Login page
- Puzzle page with a picture and the score
- Correct or Wrong message
- Leaderboard
- Browser Network tab showing `/api/puzzle` without a `solution` field

## More detail

- `docs/ARCHITECTURE.md` — diagram and data flow
- `docs/API_EVIDENCE.md` — real Banana request and failures
- `docs/TESTING.md` — test table
- `docs/GIT_WORKFLOW.md` — branches and commit messages
- `docs/VIDEO_NOTES.md` — 10-minute video notes
- `docs/ACKNOWLEDGEMENTS.md` — AI help and libraries. Edit it before you hand the work in.
