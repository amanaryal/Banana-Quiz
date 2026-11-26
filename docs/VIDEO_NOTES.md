<!--
Purpose: Complete 10-minute presentation guide and script designed to achieve 75-80% (First Class).
Theme: All Four Themes
-->

# 10-Minute Video Presentation Script (70+ First Class Guide)

> **Important**: The assignment grade is capped at **58%** if any mandatory submission requirement is missed.
> Record in your own voice, keep total duration under 10 minutes (target: **9:30–9:50**), demonstrate working software, and show the source code live.
> 
> **The 70+ Difference**:
> - 50s: *Describe* what the code is.
> - 60s: *Explain* how the components communicate.
> - **70+**: *Critically evaluate, justify design decisions, and compare alternatives!*

---

## Timing Overview & Checklist

| Time Window | Section | What to Show on Screen | Key Technical Terms to Say |
| --- | --- | --- | --- |
| **0:00 – 1:00** | Working Demonstration | Browser: Login, start game, answer puzzle, show timer, leaderboard. | Direct login, state management, session cookie, real-time score. |
| **1:00 – 2:00** | Architecture Overview | `docs/ARCHITECTURE.md` diagram + DevTools Network tab. | Four-tier architecture, HTTP REST, CORS credentials, reverse proxy. |
| **2:00 – 3:45** | Version Control | Terminal: `git log --graph --oneline --all`, `git branch -a`, `git tag`. | Feature branching, non-fast-forward merge, tagging `v1.0`, code review. |
| **3:45 – 5:30** | Event-Driven Programming | VS Code: `GamePage.jsx` (`EVENT:`, handlers, `useEffect` cleanup). | UI events vs System events, duplicate locking, interval cleanup, Virtual DOM. |
| **5:30 – 7:15** | Interoperability | VS Code: `bananaService.js`, `testBananaApi.js`, Network tab. | AbortController, 502/504 errors, text/html quirk, fallback resilience. |
| **7:15 – 9:00** | Virtual Identity | VS Code: `authController.js`, `rateLimiter.js`, `auth.js`, DevTools Cookie. | Bcrypt 10 salt rounds, JWT, httpOnly, SameSite, 429 rate limiting. |
| **9:00 – 10:00** | Critical Evaluation & Conclusion | Summary slide / architecture: Advantages, limits, future extensions. | Trade-offs, stateful vs stateless, Redis sessions, enterprise design. |

---

## Detailed Minute-by-Minute Script

### 0:00 – 1:00: Working Demonstration
* **Action**: Open browser at `http://localhost:5173/`.
* **Script**:
  > "Hello, my name is Aman Aryal, and this is my Week 9 demonstration of the Banana Quiz Challenge for CIS046-3 Software for Enterprise.
  > 
  > When opening the application, visitors land directly on the clean, centered login page. I will log in using my account credentials.
  > 
  > Upon successful authentication, we enter the Home page which details the game rules across three difficulty modes. Let's start an Easy game.
  > 
  > Here is the live game interface. The banana puzzle is rendered dynamically, hiding one single digit. The countdown bar ticks down every 200 milliseconds. I can submit an answer via the on-screen number pad or my keyboard. When I submit the correct digit '7', our server awards points with a streak multiplier. If I request a hint, the server gives an even/odd clue. When the game concludes, our final score is persisted to MongoDB and displayed on the filtered leaderboard."

---

### 1:00 – 2:00: Architecture Overview
* **Action**: Open `docs/ARCHITECTURE.md` in VS Code, show the Mermaid diagram.
* **Script**:
  > "Let's examine the system architecture. Banana Quiz Challenge is structured into four decoupled components:
  > 1. A React 18 Single Page Application client built with Vite on port 5173.
  > 2. A Node.js and Express RESTful backend on port 5000.
  > 3. An external third-party Banana Game API hosted by Dr. Marc Conrad.
  > 4. A MongoDB database managed via Mongoose ODM.
  > 
  > Because the frontend on port 5173 and backend on port 5000 are distinct origins, our Express server configures CORS specifically for `CLIENT_ORIGIN` with `credentials: true`. This enables secure transmission of the authentication cookie while rejecting unauthorized origins."

---

### 2:00 – 3:45: Theme 1 — Version Control (Target 75–80%)
* **Action**: In terminal, run:
  1. `git log --graph --oneline --all`
  2. `git branch -a`
  3. `git tag -n`
  4. Show `.gitignore` and `server/.env.example`.
* **Script**:
  > "Now turning to Version Control. For a First-Class standard, version control must be more than just saving files—it must be an auditable engineering workflow.
  > 
  > As you can see in `git branch -a`, I utilized a feature branch strategy with dedicated branches: `feature/api-integration`, `feature/authentication`, `feature/event-system`, and `feature/70-plus-hardening`.
  > 
  > In `git log --graph --oneline --all`, notice that features were integrated back into `main` using explicit non-fast-forward merge commits (`git merge --no-ff`), rather than simple fast-forwards. This preserves the branch topology and feature history.
  > 
  > I also tagged our release milestone as `v1.0`. In `.gitignore`, `node_modules` and `.env` are strictly excluded, while `server/.env.example` provides safe placeholder documentation.
  > 
  > **Critical Evaluation**: While Trunk-Based Development is common for solo projects, feature branching is vastly superior for enterprise quality: it ensures the `main` branch remains permanently deployable. In an enterprise team, I would extend this by enforcing GitHub Pull Requests with mandatory peer review and automated CI/CD checks before merge."

---

### 3:45 – 5:30: Theme 2 — Event-Driven Programming (Target 75–80%)
* **Action**: Open `client/src/pages/GamePage.jsx`. Highlight:
  - Lines with `EVENT:`, `handleDigitPress`, `handleCheckAnswer`, `handleTimeout`
  - `busyRef` lock
  - `useEffect` timer cleanup `clearInterval`
  - `removeEventListener`
* **Script**:
  > "Moving to Event-Driven Programming in `GamePage.jsx`.
  > 
  > Our implementation separates events into two distinct categories:
  > 1. **User Interface Events**: Keystrokes (`0-9`, `Enter`, `Backspace`) and button clicks (`handleDigitPress`, `handleCheckAnswer`, `handleHint`, `handleQuit`).
  > 2. **System & Temporal Events**: A `setInterval` timer tick firing every 200ms to animate the countdown bar, and the timer expiry event which triggers `handleTimeout`.
  > 
  > For 70+ quality, I implemented three critical safeguards:
  > First, **duplicate submission prevention**: using `busyRef` and `timeoutLock`, rapid double-clicking cannot submit two guesses for the same round.
  > Second, **timer lifecycle cleanup**: in `useEffect`, the interval is explicitly cleared via `clearInterval(intervalId)` upon unmount or round change, preventing interval leaks.
  > Third, **keyboard cleanup**: `window.removeEventListener('keydown', handleKeyDown)` removes listeners on unmount.
  > 
  > **Critical Justification**: Event-driven React state updates (`setState`) provide instantaneous, non-blocking DOM updates. Compared to traditional multi-page request-response reloads, events eliminate page flicker and preserve game state. Compared to polling, events avoid wasted HTTP requests."

---

### 4:30 – 7:15: Theme 3 — Interoperability (Target 75–80%)
* **Action**: Open `server/services/bananaService.js`, run `npm run test:banana` in server terminal, show Network tab in DevTools.
* **Script**:
  > "Next, Interoperability in `bananaService.js`.
  > 
  > Our server communicates with Dr. Marc Conrad's Banana API over HTTPS GET requesting JSON output.
  > 
  > **Why does only the server call the external API?**
  > 1. *Data Isolation*: The external API returns both the question link AND the solution digit. If the browser called it directly, any user could view the solution in the Network tab and cheat. Our Express backend strips the solution digit and only sends the image URL to the client.
  > 2. *CORS Isolation*: The external API does not provide CORS headers for web browsers.
  > 
  > **Handling Upstream Quirks & Failures**:
  > Notice that the Banana API returns `Content-Type: text/html` even when returning JSON. Our service reads the raw text and explicitly parses it.
  > We wrap the call in an 8-second `AbortController` timeout, mapping failures to HTTP 502 Bad Gateway and 504 Gateway Timeout.
  > 
  > **70+ Resilience Feature**: To prevent a Single Point of Failure, I built an offline fallback puzzle cache in `fallbackPuzzles.js`. If the external API is unreachable or times out, our server automatically serves a verified cached puzzle so user gameplay is never disrupted.
  > 
  > **Alternative Evaluated**: A self-hosted puzzle generator would eliminate external latency, but relying on the web service satisfies enterprise interoperability while our fallback cache guarantees 100% uptime."

---

### 7:15 – 9:00: Theme 4 — Virtual Identity (Target 75–80%)
* **Action**: Open `server/controllers/authController.js`, `server/middleware/rateLimiter.js`, and `server/middleware/auth.js`.
* **Script**:
  > "Next, Virtual Identity and Security.
  > 
  > In `authController.js`, registration hashes passwords using `bcrypt` with 10 salt rounds. Plaintext passwords are never saved.
  > 
  > **70+ Security Hardening**:
  > 1. *Password Policy*: Enforces a minimum 8-character password (up to 72 characters, bcrypt's maximum input size), rejecting weak passwords.
  > 2. *Login Rate Limiting*: In `rateLimiter.js`, I implemented an in-memory rate limiter restricting failed login attempts to 5 per 15-minute window, returning HTTP 429 Too Many Requests to stop brute-force dictionary attacks.
  > 3. *Cookie Security*: The JWT token is issued in an `httpOnly` cookie with `SameSite=Lax` and `Path=/`.
  > 
  > **Why httpOnly cookies beat localStorage?** Any cross-site script (XSS) can access tokens stored in `localStorage`. An `httpOnly` cookie is inaccessible to JavaScript, protecting the session.
  > 
  > **Critical Evaluation of Alternatives**:
  > Stateless JWT cookies vs Server-Side Sessions: JWT is stateless and scales horizontally across multiple servers without session replication. However, JWT cannot be immediately revoked before its 2-hour expiry without a distributed token blacklist. Server sessions (like Redis-backed express-session) allow instant revocation at the expense of database lookups on every request."

---

### 9:00 – 10:00: Critical Evaluation & Conclusion
* **Action**: Return to browser, show the running app.
* **Script**:
  > "To conclude our critical evaluation:
  > Across all four themes, we have moved beyond basic functionality to robust enterprise design:
  > - Version Control uses auditable feature branches, non-fast-forward merges, and semver tags.
  > - Event-Driven Programming implements duplicate submission locks, interval cleanup, and listener detachment.
  > - Interoperability hides solutions, handles content-type anomalies, and provides automatic fallback resilience.
  > - Virtual Identity enforces 8-character passwords, 429 rate limiting, and secure httpOnly cookies.
  > 
  > If extending this project for production, the next steps would be integrating Redis for distributed session blacklisting and adding an automated CI/CD GitHub Actions workflow.
  > 
  > Thank you for listening to my presentation."
