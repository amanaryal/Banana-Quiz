<!--
Purpose: A running record of what changed and why, used for the week 9 feedback step.
Theme: Version control
Portions generated with AI assistance (Cursor) - reviewed and understood by the author.
-->

# Changelog

Rewrite these sentences in your own words before you submit. Say what you changed and why.

| Date | Commit / step | What changed and why |
| --- | --- | --- |
|  | Step 1 | Added the folders, `.gitignore`, and `server/.env.example` so later work can be committed without saving secrets or `node_modules`. |
|  | Step 2 | Added the Banana test script and `GET /api/puzzle`, with 502 and 504 errors, so the server can show a puzzle without giving the browser the digit. |
|  | Step 3 | Added the React puzzle page with loading and error text, so a failed API call is visible instead of a blank page. |
|  | Step 4 | Added the New Puzzle button, the answer form, and `POST /api/puzzle/answer`, so a click or a submit updates the picture and the score. |
|  | Step 5 | Added register, login, logout, and `/api/auth/me`, with bcrypt and an httpOnly cookie, so a player has an account and a session. |
|  | Step 6 | Required login before an answer is saved, and added the leaderboard and profile pages, so scores belong to a user. |
|  | Step 7 | Added the architecture, testing, readme, and acknowledgements pages so the design and the test results are written down. |
|  | Step 8 | Added the video notes and the week 8 question list so the presentation has a place to point at each theme. |
|  | Week 9 | Turned the single puzzle into a 10-round game with Easy, Medium, and Hard. The server owns the clock, lives, hints, and points because the Banana API has no difficulty setting. Finished games are saved as their own documents so a player can have a history, a level, and a filtered leaderboard. The pages were rebuilt as a game screen so the video can show events, not a plain form. |
