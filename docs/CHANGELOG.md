<!--
Purpose: Chronological engineering record documenting development steps, rationale, and 70+ improvements.
Theme: Version Control and Software Evolution
-->

# Changelog

This changelog records the evolution of the Banana Quiz Challenge across all development phases, culminating in the 70+ First Class architectural improvements.

---

| Phase / Step | Feature & Branch | What was implemented | Technical Rationale & 70+ Justification |
| --- | --- | --- | --- |
| **Step 1** | `main` | Repository initialization, folder structure (`client/`, `server/`, `docs/`), `.gitignore`, and `server/.env.example`. | Established strict version control hygiene. Ignored `.env` and `node_modules` to prevent secret leaks and repository bloat. |
| **Step 2** | `feature/api-integration` | Server-to-server Banana API integration (`GET /api/puzzle`), 8-second timeout, error status mapping (502/504), solution hiding. | Avoided browser CORS restrictions and prevented cheating by keeping the solution digit strictly on the server. Handled the `text/html` content-type vendor quirk. |
| **Step 3** | `feature/event-system` | React client setup with Vite, state-driven rendering, loading indicators, error feedback. | Replaced traditional multi-page reloads with dynamic single-page application (SPA) architecture for responsive UX. |
| **Step 4** | `feature/event-system` | Interactive Game screen with number pad, keyboard listener (`0-9`, `Enter`, `Backspace`), dynamic timer bar, hint system, and quit modal. | Fully implemented event-driven architecture with clean `EVENT -> HANDLER -> STATE UPDATE` cycle. Handled temporal interval ticks. |
| **Step 5** | `feature/authentication` | User authentication: `register`, `login`, `logout`, `/api/auth/me`. Bcrypt password hashing (10 salt rounds) and JWT stored in an `httpOnly` cookie. | Provided virtual identity. Used `httpOnly` cookies instead of `localStorage` to defend against token theft via Cross-Site Scripting (XSS). |
| **Step 6** | `feature/event-system` | 10-round game mechanics, difficulty settings (Easy 60s, Medium 30s, Hard 15s), streak scoring multipliers (1.5x, 2.0x), and filtered leaderboard. | Transformed single-puzzle demo into a full enterprise game. Decoupled game difficulty from the external API which lacked difficulty tiers. |
| **Step 7** | `docs` | Complete architecture documentation, test evidence table, Postman collection, video presentation outline. | Documented all four themes for assessment auditability and tutor sign-off. |
| **Step 8 (70+)** | `feature/70-plus-hardening` | **Virtual Identity Hardening**: Enforced 8-character minimum password policy, login rate limiting (max 5 failed attempts per 15 minutes returning HTTP 429), SameSite cookie CSRF defenses, and Origin header verification. | Eliminated security vulnerabilities. Defended against brute-force dictionary attacks, weak credentials, and cross-site request forgery. |
| **Step 9 (70+)** | `feature/70-plus-hardening` | **Event-Driven Hardening**: Implemented duplicate answer submission locking (`busyRef`), explicit timer interval cleanup on unmount, `Math.max(0, ...)` bounds protection, and `removeEventListener` cleanup. | Prevented race conditions, phantom duplicate score submissions, memory leaks, and timer underflow bugs. |
| **Step 10 (70+)** | `feature/70-plus-hardening` | **Interoperability Resilience**: Created offline fallback puzzle pool (`fallbackPuzzles.js`) providing graceful automatic degradation if `marcconrad.com` experiences downtime or latency. | Resolved single point of failure (SPOF) risk. Guaranteed system availability even during external third-party outages. |
| **Release v1.0** | `main` | Merged `feature/70-plus-hardening` with non-fast-forward merge commit (`git merge --no-ff`) and created release tag `v1.0`. | Demonstrated professional Git branching strategy with auditable merge commits and semver release tagging. |
