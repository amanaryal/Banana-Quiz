<!--
Purpose: Bullet notes for the 10-minute video. Not a script to read aloud.
Theme: All four themes
Portions generated with AI assistance (Cursor) - reviewed and understood by the author.
-->

# Video notes

Say these in your own words. Open the file named in LOCATE and point at the function. Do not read this page line by line.

## Version control

- SHOW: `git log --oneline`, then `git status`, then `.gitignore`.
- LOCATE: `docs/GIT_WORKFLOW.md` (branch table and commit messages) and `docs/CHANGELOG.md`.
- EXPLAIN:
  - `main` is the stable line. Each feature was prepared on a `feature/...` branch and merged back.
  - A message such as `feat(server): add puzzle, auth, and score API` says what changed, in the present tense.
  - `.gitignore` keeps `node_modules`, `dist`, and `.env` out of the repository. `server/.env.example` is safe to commit because the secret values are placeholders.
  - The changelog is the "what and why" note for the later feedback step.
- EVALUATE:
  - Chosen because a marker can see the history, and a secret is harder to leak if `.env` is ignored.
  - Limit: this history was grouped into a few commits after the app worked, rather than one commit after every tiny edit. A forgotten `git add` of a secret file would still be a problem if `.gitignore` was wrong.
  - Alternative: commit directly on `main` only. That is simpler and loses the feature branches the brief asks you to explain. GitHub pull requests would be the fuller version of the same idea.

## Interoperability

- SHOW: run `npm run test:banana` in `server`, then in the browser Network tab show `GET /api/puzzle` and point out that `solution` is missing. The picture is still on screen.
- LOCATE: `getBananaPuzzle` in `server/services/bananaService.js`, then `getPuzzle` in `server/controllers/puzzleController.js`, then `saveSolution` in `server/services/puzzleStore.js`.
- EXPLAIN:
  - Request: the server sends an HTTPS GET to `api.php?out=json`.
  - Response: status 200, but the content type is `text/html`. The body is still JSON with `question` (picture link) and `solution` (a digit).
  - Data processing: parse the text, check the digit is 0–9, store it under a random `puzzleId`, return only the id and the picture link.
  - What can go wrong: the site is down (502), the body is HTML or bad JSON (502), or the call is slower than 8 seconds (504). The page shows that message instead of crashing.
- EVALUATE:
  - Chosen so the browser cannot read the answer in the JSON, and so timeout and error handling live in one place.
  - Limit: the answer list is in memory. A server restart drops unsolved puzzles. The browser still downloads the PNG from `sanfoh.com`, which is the link the API gave us, not a call to `api.php`.
  - Alternative: `base64=yes` so the server sends the picture bytes and the browser never contacts `sanfoh.com`. Redis if more than one server needed the same answer list.

## Event-driven programming

- SHOW: on the play page, click New Puzzle, type `12` and submit, then type one digit and submit. Point at "Loading puzzle...", the validation message, and Correct or Wrong, plus the score numbers changing.
- LOCATE: `client/src/pages/PuzzlePage.jsx`. Search for `EVENT:`.
  - `onClick` → `handleNewPuzzle` → new puzzle shown.
  - `onChange` → `handleAnswerChange` → the digit is kept in state.
  - `onSubmit` → `handleSubmitAnswer` → Correct or Wrong, and the score updates.
- EXPLAIN:
  - `event.preventDefault()` stops the form from reloading the whole page.
  - Empty text and anything other than one digit are rejected in the browser before the request. The server checks again, because a user can bypass the page.
  - React state is the result: `setPuzzle`, `setError`, `setScore`. When state changes, React draws the page again.
- EVALUATE:
  - Chosen because the brief asks for a button, a form, and an input, and React's state is the straightforward way to show a result.
  - Limit: these are user-interface events, not a message queue. Nothing else is notified when a score changes until that player opens the leaderboard again.
  - Alternative: a plain form with no JavaScript would reload the page. A websocket could push a live leaderboard. Both are more than this assignment needs.

## Virtual identity

- SHOW: register, log in, refresh the profile page (the name is still there), log out, then try Play again and land on the login page. In Network, open the login response and show `Set-Cookie` with `HttpOnly`, and show a 401 from `/api/scores/me` after logout.
- LOCATE:
  - `register` and `login` in `server/controllers/authController.js` (bcrypt and the cookie).
  - `requireAuth` in `server/middleware/auth.js`.
  - `AuthProvider` in `client/src/context/AuthContext.jsx` and `ProtectedRoute` in `client/src/components/ProtectedRoute.jsx`.
- EXPLAIN:
  - The password is hashed with bcrypt, 10 salt rounds. MongoDB stores `passwordHash` only.
  - The JWT sits in an httpOnly cookie for 2 hours. Page scripts cannot read it, unlike `localStorage`, which any injected script can read (XSS).
  - `sameSite: lax` sends the cookie from our React app to our API. `secure` is on only when `NODE_ENV` is production, because localhost is HTTP.
  - Protected routes use the user id inside the token, not an id typed by the browser, so one player cannot add points to another account.
- EVALUATE:
  - Chosen because a cookie the script cannot read is safer for a login token than `localStorage`, and bcrypt means a stolen database is not a list of passwords.
  - Limits, also written at the top of `authController.js`: no refresh token (the user logs in again after 2 hours), no CSRF token, no rate limiting. Logout deletes the cookie but cannot cancel a copy of the token until it expires.
  - Alternatives: server-side sessions (the cookie is only an id, the server stores the login and can delete it), or OAuth such as "Sign in with Google".

## How the four themes relate

- Version control is the history of the files. The other three are the behaviour inside those files.
- Interoperability is server-to-server: Express calls the Banana API.
- Event-driven programming is person-to-page: a click or a submit updates React state.
- Virtual identity is person-to-account: the cookie says who gets the point.
- They meet on one guess. A commit saved `GamePage.jsx` (version control). The number pad runs `handleDigitPress` (events). That calls Express, which calls Banana and hides the digit (interoperability). The answer request includes the cookie, and the finished game is stored for that user (identity).

## Game upgrade (use this if the marker asks about the new version)

- SHOW: start Easy, let the bar change colour, press a digit, press Hint, then open the avatar menu and cancel logout.
- LOCATE:
  - Rules: `server/config/gameModes.js`
  - Hidden digit and clock: `setPuzzle` in `server/services/gameStore.js`
  - Points: `scoreCorrectAnswer` in `server/services/scoring.js`
  - Events: search `EVENT:` in `client/src/pages/GamePage.jsx`
  - Cookie: `requireAuth` in `server/middleware/auth.js` is on every `/api/game` route
- EXPLAIN:
  - The Banana API does not offer a difficulty. Our server adds the timer, lives, hints, and points.
  - `issuedAt` is the server time. A guess more than 1.5 seconds after the limit is rejected, so the browser cannot pause the clock and still score.
  - The in-memory game is the session. MongoDB only receives it when the game ends.
- EVALUATE:
  - Server-side time stops a player editing the countdown in the browser.
  - Limit: the active game is in one Node process. A restart drops an unfinished game. A second server would not see it.
  - Alternative: store the active game in Redis, or push the next picture with WebSockets instead of the page asking again. WebSockets are more moving parts than this assignment needs. The cookie login would stay the same.

## 10-minute timing

- 0:00–1:00 Demo. Log in, pick Easy, answer one digit, show the timer and lives, open the leaderboard.
- 1:00–2:00 Architecture and interoperability. `docs/ARCHITECTURE.md` diagram, then `getBananaPuzzle` and a Network response with no `solution`.
- 2:00–3:45 Version control. `git log`, one commit message, `.gitignore`, one line in `docs/CHANGELOG.md`.
- 3:45–5:30 Event-driven programming. The `EVENT:` comments in `GamePage.jsx` (number pad, Enter, timer tick, timeout).
- 5:30–7:15 Virtual identity. `register` hash, `login` cookie, `requireAuth` 401, refresh still logged in, logout.
- 7:15–9:15 Critical evaluation. For each theme: why it was chosen, one limit, one alternative. Use the EVALUATE bullets above. Mention the `text/html` content type and the in-memory puzzle list.
- 9:15–10:00 Conclusion. One sentence on the problem, one on the four parts, one on what you would add next (rate limiting or sessions).
