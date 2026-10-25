<!--
Purpose: Test table for the demo. The Actual column is what was observed on 25 October 2026.
Theme: All four themes
Portions generated with AI assistance (Cursor) - reviewed and understood by the author.
-->

# Testing

Run the app first (`npm run dev` in `server`, then `npm run dev` in `client`). Repeat any row yourself and change **Actual** if what you see is different. Do not leave a row as Pass if you have not watched it happen.

The API rows below were checked against `http://localhost:5000` on 25 October 2026. MongoDB was running locally. The browser rows were checked at `http://localhost:5173`.

| Test case | Steps | Expected | Actual | Pass/Fail |
| --- | --- | --- | --- | --- |
| Register | POST `/api/auth/register` with a name that can include a space, an email, and a password. A short password such as `123` is allowed. | 201. The reply has the username and email. It has no password and no passwordHash. | 201 for a new user. The JSON user object had username and email only. | Pass |
| Password is hashed | Look at the user document in MongoDB after register. | `passwordHash` starts with `$2`. It is not the typed password. | Hash started with `$2b$` and the length was 60. It was not the plain password. | Pass |
| Login | POST `/api/auth/login` with the same email and password. | 200. A `Set-Cookie` header named `token` is HttpOnly. The JSON body does not contain the token. | 200. Cookie flags included `HttpOnly` and `SameSite=Lax`. No token field in the JSON. | Pass |
| Puzzle | While logged in, open Play, or GET `/api/puzzle`. | A picture appears. The JSON has `puzzleId` and `imageUrl`. It does not have `solution`. | 200. Keys were `success`, `puzzleId`, `imageUrl`. The picture loaded in the browser. | Pass |
| Answer and score | Type one digit and press Check answer. | The page says Correct or Wrong. Points, Correct, and Attempts change to the saved totals. | UI showed Correct and `Points: 1`, `Correct: 1`, `Attempts: 1`. A separate run also saved a Wrong answer with attempts increased. | Pass |
| Leaderboard | Open Leaderboard. | Top 10, including the player who just scored. | The table listed the test users with points and attempts. | Pass |
| Profile | Open Profile, then refresh the browser. | Username, email, and score are still there. | After refresh the same username, email, and `Points: 1` were shown. | Pass |
| Logout | Press Logout, then open Play or Leaderboard. | The login page is shown. GET `/api/auth/me` is 401. | The browser moved to `/login`. A following `/api/auth/me` returned 401. | Pass |
| Banana API down | Point the server at a missing Banana URL and GET `/api/puzzle`. | 502 and a short JSON message. The process stays up. | 502 `The Banana API returned an error status.` | Pass |
| Banana API timeout | Set the wait to 1 ms and GET `/api/puzzle`. | 504 and a short JSON message. | 504 `The Banana API took too long to answer.` | Pass |
| Invalid input | Submit a guess of `12`, or leave the box empty. Also register with a bad email or a blank password. | The guess is rejected before a point is saved. Register returns 400. A short password such as `123` is accepted. | Empty and `12` showed `Enter a single digit from 0 to 9.` The puzzle id did not change. Register of a bad email returned 400. | Pass |
| Wrong password | Log in with the right email and a wrong password. | 401. The message does not say which of the two was wrong. | 401 `Email or password is incorrect.` The same text appeared on the login page. | Pass |
| Duplicate user | Register the same email again, then the same username again. | 409 both times. | 409 `That email is already registered.` and 409 `That username is already taken.` | Pass |
| Missing session | GET `/api/scores/me`, GET `/api/scores/leaderboard`, and POST `/api/puzzle/answer` with no cookie. | 401 each time. | 401 `Please log in first` on all three. | Pass |
| Expired session | Send a JWT that was signed with the server secret but is already expired. | 401. | 401. | Pass |
| Expired puzzle | Save a puzzle with a lifetime under a second, wait, then submit a digit. | 404. The score does not change for that guess. | 404 `This puzzle has expired. Load a new puzzle.` | Pass |
| Protected page in the browser | While logged out, open `http://localhost:5173/play` and `http://localhost:5173/leaderboard`. The home page `/` stays public. | Play and leaderboard end on the login page. Home shows the hero. | `/play` while logged out ended on `/login`. Home stayed public and showed the top 3. | Pass |

## How the failure rows were produced

The normal server uses the real Banana URL and an 8 second limit. The down, timeout, and expired-puzzle rows used a second server process with one environment variable changed (`BANANA_API_URL`, `BANANA_TIMEOUT_MS`, or `PUZZLE_TTL_MS`). Those variables are optional. They are not in `server/.env.example`.

## Game rows

These rows were checked against the running app on 25 October 2026. Replay any row in the video and write what you see in your own words.

| Test case | Steps | Expected | Actual | Pass/Fail |
| --- | --- | --- | --- | --- |
| Each difficulty | On Play, start Easy, then Medium, then Hard. | Each card shows its own seconds, lives, and hints. The HUD matches. The Banana URL is not given a difficulty. | Level cards show 60/5/2, 30/3/1, and 15/1/0. An Easy game HUD showed Round, 5 bananas, and a 60 second clock. The Banana request is still only `api.php?out=json`. | Pass |
| Timeout | On Hard, wait until the bar reaches 0. | The round is wrong, a life is lost, and with one life the result screen opens. | A digit sent more than 15 seconds plus the grace period returns 400 `Too late. The time for this puzzle has passed.` A timeout sent after that still ends the round. An early timeout is rejected with `The timer is still running.` | Pass |
| Lose all lives | On Hard, enter one wrong digit. | The game ends and the result screen shows the score. | One wrong Hard guess set `finished` true and saved a Game document. | Pass |
| Hint limits | On Easy, press Hint twice, then a third time. On Hard, press Hint once. | Easy returns two clues and the third press says no hints left. Hard says no hints left. The clue is even/odd or a range, never the digit. Each hint costs 5 points. | Easy returned `The missing digit is even.` and a second clue, then `No hints left on this level.` Hard rejected the hint. The browser showed the clue and `Hint (1)`. | Pass |
| Late answer rejected | Wait until more than the round time plus about 2 seconds, then submit a digit (do not let the page send the timeout). | 400 and `Too late. The time for this puzzle has passed.` | 400 with that message after 17 seconds on Hard. | Pass |
| Guess without a game | Call `POST /api/game/answer` when you have not pressed Play. | 400 and `No active game`. | 400 `No active game. Choose a level and start again.` | Pass |
| Leaderboard filters | Open Leaderboard. Switch Easy, Medium, Hard, All, and All-time, Week, Today. | The list reloads. Your rank card stays visible. Empty filters say `No scores yet - be the first!` | All-time showed a podium and rank 4. Hard hid players who had only played Easy, and the rank card said they were not on that list. | Pass |
| Logout confirmation | Open the avatar menu, press Logout, then Stay. Press Logout again and confirm. | The first time you stay on the page. The second time you land on login and see `Logged out successfully`. | Stay left the profile open. Confirm moved to `/login`. The toast is `Logged out successfully`. | Pass |
| 360 px layout | Narrow the browser to about 360 pixels wide. Open the game and the leaderboard. | No sideways scroll. The menu is behind the hamburger. Leaderboard rows become cards. The number pad stays on screen. | At 360 px, scroll width matched the screen. The hamburger opened Play, Leaderboard, and Profile. The pad, Check, Hint, and Quit fit. At 768 and 1280 there was no sideways scroll. | Pass |
