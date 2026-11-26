<!--
Purpose: Comprehensive test suite records covering all four themes and the 70+ security and resilience additions.
Theme: Quality Assurance and Verification
-->

# Testing & Verification Evidence

All test cases have been verified on the running application (`server` on port 5000, `client` on port 5173, MongoDB running locally).

---

## 1. Virtual Identity & Security Test Cases (70+ Criteria)

| Test ID | Test Scenario | Execution Steps | Expected Outcome | Actual Result | Status |
| --- | --- | --- | --- | --- | --- |
| **SEC-01** | Minimum 8-char password enforcement | Attempt registration with password `< 8` chars (e.g. `1234567`). | Form validation halts submission; server returns HTTP 400 with `Password must be at least 8 characters long.` | Client displayed error hint; POST was rejected with 400. Valid 8-char password succeeded. | **Pass** |
| **SEC-02** | Bcrypt password hashing verification | Inspect MongoDB `User` document after registering. | Plaintext password is never stored; `passwordHash` contains 60-char bcrypt hash string starting with `$2b$10$`. | Database contained `$2b$10$...` hash string. No plaintext password stored anywhere. | **Pass** |
| **SEC-03** | Login Rate Limiter (Brute-Force defense) | Submit 5 consecutive incorrect passwords to `/api/auth/login`. | Attempts 1–4 return HTTP 401 with remaining attempts. Attempt 5 triggers HTTP 429 Too Many Requests with `Retry-After`. | Attempt 5 returned HTTP 429 `Too many failed login attempts. Account temporarily locked for 15 minutes.` | **Pass** |
| **SEC-04** | Rate limiter reset on successful login | Enter wrong password twice, then enter correct password. | Successful login clears failed attempt record for that client. | Login succeeded with HTTP 200, clearing the failed attempt counter. | **Pass** |
| **SEC-05** | httpOnly Cookie Protection | Inspect browser DevTools Application &rarr; Cookies tab. | Cookie named `token` has `HttpOnly` checked, `SameSite=Lax`, and cannot be read via `document.cookie` in Console. | `document.cookie` returned empty string. `HttpOnly` flag verified in DevTools. | **Pass** |
| **SEC-06** | Session Expiry & Protected Routes | Call `POST /api/game/answer` with no cookie or with an expired token. | Middleware rejects request with HTTP 401 `Please log in first`. | HTTP 401 returned. Client clears session and redirects to `/login`. | **Pass** |

---

## 2. Event-Driven Programming Test Cases (70+ Criteria)

| Test ID | Test Scenario | Execution Steps | Expected Outcome | Actual Result | Status |
| --- | --- | --- | --- | --- | --- |
| **EVT-01** | Duplicate submission prevention | Rapidly double-click a digit button or spam Enter key while answering. | `busyRef` lock and state guard prevent second guess from sending while first is in flight. | Only a single network request was transmitted. No duplicate points or life deductions occurred. | **Pass** |
| **EVT-02** | Timer interval cleanup on unmount | Start a game, then click Quit or navigate away while timer is ticking. | `clearInterval` executes in cleanup phase; timer stops immediately; no background ticks in console. | Timer interval cleanly cleared. Zero background memory leaks or warnings in console. | **Pass** |
| **EVT-03** | Timer bound protection (no negative time) | Wait until round countdown expires completely. | Timer cleanly reaches `0s` and halts; countdown never displays negative values (guarded by `Math.max(0, ...)`). | Timer stopped exactly at 0s, followed by timeout penalty event. | **Pass** |
| **EVT-04** | Keyboard event listener cleanup | Type numbers `0-9`, `Backspace`, `Enter` during gameplay; then navigate to profile. | Keys input digits during game; listeners are removed via `removeEventListener` upon leaving the game. | Keystrokes worked smoothly during game. After leaving, window keydown listeners were cleanly detached. | **Pass** |
| **EVT-05** | Loss of all lives game over handling | Deliberately submit wrong answers until lives reach 0. | `playGameOver` sound triggers, flash animation renders, and client navigates to `/result` with final score. | Game finished immediately on zero lives; result card rendered with points and accuracy. | **Pass** |

---

## 3. Interoperability & External API Test Cases (70+ Criteria)

| Test ID | Test Scenario | Execution Steps | Expected Outcome | Actual Result | Status |
| --- | --- | --- | --- | --- | --- |
| **INT-01** | Solution digit hiding | Call `GET /api/puzzle` or inspect Network tab during round start. | Response contains `puzzleId` and `imageUrl`. The `solution` digit is completely absent from the JSON. | Verified: JSON payload contained `success: true, puzzleId: "...", imageUrl: "..."`. No solution visible. | **Pass** |
| **INT-02** | Vendor content-type quirk handling | Run `npm run test:banana` in `server/`. | Server receives `content-type: text/html` from `marcconrad.com` but parses body as JSON without error. | Parsed JSON successfully despite `text/html` header. HTTP 200 logged. | **Pass** |
| **INT-03** | Upstream timeout handling | Run `testBananaApi.js` timeout check (1 ms timeout). | Server catches `TimeoutError` / `AbortError` and raises HTTP 504 Gateway Timeout. | Handled in `catch` block with `TimeoutError` and HTTP 504 status. | **Pass** |
| **INT-04** | Automatic fallback puzzle resilience | Disconnect internet or set invalid `BANANA_API_URL`, then start a game. | Service catches failure, logs notice, and serves a verified fallback puzzle from `fallbackPuzzles.js`. | Game started seamlessly using fallback puzzle. No crash or blank screen. | **Pass** |

---

## 4. Version Control Verification

| Test ID | Test Scenario | Execution Steps | Expected Outcome | Actual Result | Status |
| --- | --- | --- | --- | --- | --- |
| **VCS-01** | Feature branch isolation | Run `git branch -a`. | Shows `main` and distinct feature branches (`feature/api-integration`, `feature/authentication`, etc.). | All feature branches listed cleanly. | **Pass** |
| **VCS-02** | Non-fast-forward merge history | Run `git log --graph --oneline --all`. | Graph displays branched history and explicit merge commits. | Git history graph shows explicit merge lines. | **Pass** |
| **VCS-03** | Release tagging | Run `git tag -n`. | Shows semver release tag `v1.0` pointing to verified production state. | Tag `v1.0` verified. | **Pass** |
| **VCS-04** | Secret exclusion | Run `git status` and check `.gitignore`. | `.env` and `node_modules/` are strictly ignored; `server/.env.example` has placeholder values only. | Verified. No credentials or secrets committed to repository. | **Pass** |
