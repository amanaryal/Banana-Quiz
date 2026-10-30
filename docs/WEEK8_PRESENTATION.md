<!--
Purpose: Week 8 checklist and short answers to practise out loud.
Theme: All four themes
-->

# Week 8 presentation

These are practice notes. Answer in your own words. Point at the screen while you talk.

## Checklist before you present

- [ ] MongoDB is running. `npm run dev` works in `server` and in `client`.
- [ ] You can register, log in, load a puzzle, submit a digit, open the leaderboard, and log out.
- [ ] DevTools Network shows `GET /api/puzzle` with no `solution` field.
- [ ] `git log --oneline` shows your commits. `git status` does not list `.env` or `node_modules`.
- [ ] You can open `PuzzlePage.jsx` and find the three `EVENT:` comments.
- [ ] You can open `authController.js` and say why the password is hashed and why the token is a cookie.
- [ ] You have rewritten `docs/ACKNOWLEDGEMENTS.md` and `docs/CHANGELOG.md` in your own words.

## Practice questions

**What problem does it solve?**

- A player is shown a picture with a missing digit, guesses that digit, and gets a point.
- Logged-in players keep a score and can see a top 10.
- For the module, the same small app is the place to show version control, an external API, React events, and login.

**What are the components, and how do they communicate?**

- Browser (React, port 5173) talks HTTP JSON to Express (port 5000), and sends the login cookie.
- Express talks HTTPS to the Banana API, and talks to MongoDB for users and scores.
- Open `docs/ARCHITECTURE.md` and the diagram.

**What does the Banana API contribute?**

- It supplies the puzzle picture and the correct digit.
- Our server keeps the digit. The browser only receives the picture link and a puzzle id.
- Show `docs/API_EVIDENCE.md` and the Network tab side by side.

**Explain a commit.**

- Pick one line from `git log`.
- Say the branch, the message, and why that change was separate from the others.
- Example shape: `feat(server): add puzzle, auth, and score API` is the server half, so the client commit can be reviewed on its own.

**Explain an event and a handler.**

- On the play page, the New Puzzle button is the event.
- `handleNewPuzzle` is the handler. It calls `GET /api/puzzle` and stores the picture in state, which makes React draw it.
- The form uses `onSubmit` and `event.preventDefault()` so the browser does not reload the page.

**How are identity and sessions managed?**

- Register hashes the password with bcrypt and stores `passwordHash`.
- Login checks the hash, signs a JWT, and puts it in an httpOnly cookie for 2 hours.
- `requireAuth` rejects a missing or expired cookie with 401.
- Logout clears the cookie. There is no refresh token.

**What problem did you meet?**

- Use a problem you actually saw. A real one from the API check: the documented address is `http`, and that call returns 301 to `https`.
- Another: the successful body is JSON, but the `Content-Type` header says `text/html`. The server parses the text instead of trusting the header.
- Say what you changed because of it (`server/config/banana.js` uses https, `bananaService.js` uses `JSON.parse`).

**What would you improve?**

- Rate limiting on login, so guessing passwords is slower.
- A refresh token, or server-side sessions, so a stolen cookie can be cancelled.
- A CSRF token, because a cookie is sent automatically.
- Store puzzle answers in Redis if more than one server was running.
- Ask the Banana API for `base64=yes` if the browser should not load the picture from `sanfoh.com`.
