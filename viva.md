# CIS046-3 Software for Enterprise – AY 26/27  
## Assignment 1 viva sheet (Week 8)

**Student Name:**  
**Student Number:**  
**Student Signature:**  
**Date:** November 2026 (Week 8)

Print this form and bring it to the presentation. The tutor checks it against the running app, then signs it. After sign-off, scan it and submit on BREO with the video and the code.

At Week 8 a **working prototype** is shown, plus a short plan for the rest of development.

GitHub: https://github.com/amanaryal/Banana-Quiz  
Run locally: MongoDB running, then `npm run dev` from the project folder. Client: http://localhost:5173  Server: http://localhost:5000

---

## What this app is (demo this first)

**Banana Quiz Challenge** is a 10-round missing-digit game.

1. Register / log in (account + session cookie).
2. Home page: how to play, top-3 preview (no login needed for the preview).
3. Play: pick Easy, Medium, or Hard.
4. Each round shows a Banana API picture. The player guesses the missing digit (0–9) before the timer ends.
5. Lives, hints, streaks, and points are decided by **our** Express server, not by the Banana API.
6. Game ends after 10 rounds, 0 lives, or Quit. One `Game` document is saved in MongoDB.
7. Result screen, profile (XP, level, rank, best by difficulty, last games), and a filtered leaderboard.

The browser never calls the Banana API. Only Express does. The correct digit is stored on the server and is **not** sent to the browser JSON.

| Mode | Seconds | Lives | Hints | Base points |
| --- | --- | --- | --- | --- |
| Easy | 60 | 5 | 2 | 10 |
| Medium | 30 | 3 | 1 | 20 |
| Hard | 15 | 1 | 0 | 40 |

Scoring extras: 3-in-a-row ×1.5, 5-in-a-row ×2, faster answers get a time bonus. A hint costs 5 points and only says even/odd or a range.

---

## Version Control

**How did you develop your code (e.g., what features have been added after first version)?**

Git, with `main` as the stable line and one branch per feature. `.gitignore` keeps `node_modules`, `dist`, and `.env` out of GitHub. `server/.env.example` is committed with placeholders only.

**First version (prototype on `main`):** folders, ignore rules, then Express talking to the Banana API and hiding the digit (`GET /api/puzzle`). The browser only received the picture.

**Features added after that first version:**

| Order | Branch / commit | What was added |
| --- | --- | --- |
| 1 | `69df14d` `chore: initialise the Banana Quiz project folders and ignore rules` | Repo, ignore rules, env example. |
| 2 | `feature/api-integration` `245feb5` | Express + Banana API. Solution stored on the server. |
| 3 | `feature/authentication` `834749f` | Register, login, logout, `/api/auth/me`, bcrypt, httpOnly cookie, scores. |
| 4 | `feature/event-system` `f52f84c` | React screens and event handlers (pad, timer, hint, logout). |
| 5 | `83aad30` docs | Architecture, tests, video notes, Postman collection. |
| 6 | **Week 9 upgrade (still on this repo)** | Single puzzle became a **10-round game** with Easy / Medium / Hard, server clock, lives, hints, XP, filtered leaderboard, result page. |
| 7 | `feccbf1` `feat(client): tighten mobile layout and profile recent games` | Phone top bar, Home tab, safe-area CSS, profile recent games as a table. |

Show live: `git log --oneline`, `git branch -vv`, GitHub `main`.

**Week 8 status:** working prototype (register, play a puzzle, score, login cookie).  
**After Week 8:** keep the 10-round game, mobile layout, profile, and leaderboard as the path to the final demo/video.

---

## Event Driven Architectures

**What in your code triggers events (e.g., GUI, buttons, timeout …)?**

React is event-driven: a click, key, submit, timer, or resize runs a handler; the handler updates state or calls Express; React redraws.

Search the client for comments starting `EVENT:`.

| Trigger | Where | Handler | Result |
| --- | --- | --- | --- |
| Click level card | `LevelSelectPage.jsx` | `handleStart` | `POST /api/game/start` — 10-round game begins |
| Number pad / digit key | `GamePage.jsx`, `NumberPad.jsx` | `handleDigitPress` | Digit shown in the answer box |
| Backspace | `GamePage.jsx` | `handleBackspace` | Answer box clears |
| Check / Enter | `GamePage.jsx` | `handleCheckAnswer` | `POST /api/game/answer` — Correct or Wrong |
| Timer interval (every 200 ms) | `GamePage.jsx` | interval → `handleTimeout` | Bar shrinks; at 0s send `{ timedOut: true }`, lose a life |
| Hint button | `GamePage.jsx` | `handleHint` | Even/odd or range; −5 points |
| Quit confirm | `GamePage.jsx` + `Modal.jsx` | `handleQuit` | Game saved, result screen |
| Login / register submit | `LoginPage.jsx`, `RegisterPage.jsx` | `handleLogin` / `handleRegister` | Cookie set or account created (`preventDefault` so the page does not reload) |
| Show password | Login / Register | `handleTogglePassword` | Password visible or hidden |
| Avatar click | `Navbar.jsx` | `setDropdownOpen` | Profile menu |
| Click outside / resize | `Navbar.jsx` | pointer / resize handlers | Menu closes |
| Mute | `Navbar.jsx` | `handleToggleMute` | Beeps on/off |
| Logout confirm | `Navbar.jsx` | `handleConfirmLogout` | Cookie cleared |
| Leaderboard filters | `LeaderboardPage.jsx` | `setDifficulty` / `setPeriod` | Top 10 refetched |
| Toast timeout | `ToastContext.jsx` | `setTimeout` | Toast disappears |
| Correct/wrong flash | `GamePage.jsx` | `setTimeout` 700 ms | Flash and float score clear |

The **server clock** is the real timeout. The page countdown is a guide. A guess more than 1.5 seconds late is rejected (`GRACE_MS` in `server/config/gameModes.js`).

This is UI events, not a message bus. The leaderboard does not live-update until the player opens it again.

---

## Interoperability

**Do you use the API https://marcconrad.com/uob/tomato/api.php?**

**No.** This project uses the **Banana** API (same lecturer site, banana puzzles instead of tomato):

- Docs: https://marcconrad.com/uob/banana/doc.php  
- Call we make: `https://marcconrad.com/uob/banana/api.php?out=json`  
- File: `server/services/bananaService.js` (`getBananaPuzzle`)  
- Config: `server/config/banana.js`

**Where interoperability is shown**

| Hop | Protocol | What happens |
| --- | --- | --- |
| React → Express | HTTP JSON, port 5000, `credentials: 'include'` | Game, auth, scores. Cookie sent automatically. |
| Express → Banana API | HTTPS GET | Body is JSON `{ question, solution }` even though `Content-Type` is `text/html`. We `JSON.parse` the text. |
| Express → MongoDB | MongoDB wire protocol (Mongoose) | Users and finished games. |
| Browser → `sanfoh.com` | HTTPS GET of the PNG | Picture only. Not a call to `api.php`. |

Express keeps `solution` in memory (`gameStore.js` / `puzzleStore.js`) and returns **only** `imageUrl` + game HUD fields. Network tab on `GET /api/game/puzzle` or `GET /api/puzzle` must not show `solution`.

Banana has **no difficulty parameter**. Easy/Medium/Hard live in `server/config/gameModes.js`.

Errors: 502 if Banana is down or returns junk; 504 if slower than 8 seconds (`AbortController`). Script: `npm run test:banana` in `server`. Evidence: `docs/API_EVIDENCE.md`. Documented `http://` URL returns **301** to `https://`, so we call HTTPS.

CORS: client origin 5173 vs API 5000. Server allows `CLIENT_ORIGIN` with `credentials: true` (needed for cookies).

---

## Virtual Identity

**How did you implement virtual identity in your code? (e.g., Passwords, Cookies, IP Numbers …)**

**Passwords + httpOnly cookie JWT.** Not IP address. Not a token in `localStorage`.

| Piece | Implementation |
| --- | --- |
| Register | `POST /api/auth/register`. Password hashed with **bcrypt, 10 salt rounds**. MongoDB stores `passwordHash` only. |
| Login | `POST /api/auth/login`. Compare hash, sign **JWT** (`id`, `username`), `Set-Cookie` name `token`. |
| Cookie | **httpOnly**, `sameSite: lax`, `path: /`, **2 hours**. `secure` only when `NODE_ENV=production` (localhost is HTTP). |
| Who am I | `GET /api/auth/me` + `AuthContext` on load. Cookie sent by the browser. |
| Gate | `requireAuth` in `server/middleware/auth.js`. Missing/bad cookie → **401**. User id comes from the token, not the request body. |
| Protected UI | `ProtectedRoute.jsx` — Play, game, result, leaderboard, profile. |
| Logout | `POST /api/auth/logout` clears the cookie. |

Protected API includes all `/api/game/*` routes, `/api/auth/me`, `/api/scores/me`, `/api/scores/leaderboard`, `POST /api/puzzle/answer`.

**Limits to say if asked:** no refresh token; logout cannot revoke a stolen JWT until it expires; no CSRF token; no login rate limit. Alternatives: server-side sessions, or OAuth (Sign in with Google).

---

## Any other interesting features

- Server-owned timer (`issuedAt`) so the player cannot pause the browser clock and still score.
- Hints never reveal the digit.
- XP, level, rank title on the profile; best score per difficulty; last games table.
- Leaderboard filters: difficulty + period (e.g. all time / week).
- Public top-3 on the home page without login (`GET /api/scores/preview`).
- Confetti on a good result, Web Audio beeps, mute in the nav.
- Toasts for login/logout/errors.
- Older `GET /api/puzzle` route still works (single puzzle, digit hidden) plus the 10-round `/api/game` routes.
- Postman collection in `postman/`.
- Mobile: sticky top bar, bottom tab bar including Home, safe-area padding, responsive grids.

---

## Architecture (one sentence + files to open)

Four parts: **React browser** ↔ **Express** ↔ **Banana API** and **MongoDB**. Diagram: `docs/ARCHITECTURE.md`.

| Theme | Open this |
| --- | --- |
| Version control | `git log`, `docs/GIT_WORKFLOW.md`, `docs/CHANGELOG.md` |
| Events | `client/src/pages/GamePage.jsx` (`EVENT:` comments) |
| Interoperability | `server/services/bananaService.js`, Network tab with no `solution` |
| Identity | `server/controllers/authController.js`, `server/middleware/auth.js` |

---

## Week 8: working prototype + how to continue

**Show today**

- Register and log in (Network: `Set-Cookie`, HttpOnly).
- Start Easy, guess a digit, show timer and lives.
- Refresh: still logged in (`GET /api/auth/me`).
- Logout, then Play → login page; a protected request is 401.
- `git log --oneline` and GitHub.

**Continue after Week 8 (already in the current code, polish for the video)**

- Keep demonstrating the 10-round game, not only one puzzle.
- Record the 10-minute video from `docs/VIDEO_NOTES.md`.
- Fill `docs/ACKNOWLEDGEMENTS.md` in your own words.
- Screenshots in the README; run `docs/TESTING.md` once more.
- Optional next work if time: login rate limiting, CSRF token, Redis for the in-memory game so a restart does not drop a match.

---

## One-line answers if the tutor is fast

- **VC:** Feature branches after a first Banana prototype; then auth, React events, 10-round game, mobile polish. History is on GitHub.  
- **Events:** Buttons, number pad, keyboard, form submit, timer interval, timeout, hint, quit, logout, toasts.  
- **Interop:** Not Tomato; Banana `api.php?out=json` over HTTPS from Express only.  
- **Identity:** bcrypt passwords + JWT in an httpOnly cookie for 2 hours.  
- **App:** 10-round banana digit quiz with lives, hints, XP, and a leaderboard.
