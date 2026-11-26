<!--
Purpose: Explicit declaration of third-party services, open-source libraries, and AI assistance.
Theme: Academic Integrity and Professional Ethics
-->

# Acknowledgements & Declaration of AI Assistance

**Author:** Aman Aryal  
**Module:** CIS046-3 Software for Enterprise (AY 26/27)  
**Project:** Banana Quiz Challenge  

---

## 1. Academic Declaration & Author Ownership

I declare that this submission is my own individual work for CIS046-3 Software for Enterprise. I have read, tested, and understood every line of source code and documentation in this repository. I can personally explain, justify, debug, and demonstrate all components during the viva presentation and video recording.

---

## 2. External Service

- **Banana Game API**: Created by Dr. Marc Conrad, University of Bedfordshire.
  - API documentation: `https://marcconrad.com/uob/banana/doc.php`
  - Base endpoint: `https://marcconrad.com/uob/banana/api.php?out=json`
  - Puzzle imagery is hosted dynamically on `https://www.sanfoh.com/`. Images are loaded on demand and are not bundled into this repository.

---

## 3. Declaration of AI Assistance (Compliance Note)

In accordance with University of Bedfordshire academic integrity guidelines and the CIS046-3 assessment regulations:

- **AI Tools Used**: Cursor (Claude 3.5 Sonnet) and Antigravity (Gemini AI assistant).
- **Scope of AI Assistance**:
  - Drafting initial boilerplate code and folder scaffolding.
  - Reviewing code against marking criteria and identifying areas for 70+ enhancements.
  - Formatting markdown documentation, diagrams, and video timing guides.
- **Student Ownership & Verification**:
  - Every architectural choice (Express server isolation, bcrypt hashing, JWT httpOnly cookies, rate limiting, event-driven state updates, and fallback resilience) was verified, tested, and reviewed by me.
  - No code was accepted blindly. All business logic, scoring formulas, and validation rules were tested locally and validated in manual testing sessions.

---

## 4. Open Source Libraries & Frameworks

All libraries were installed using standard `npm` package management. No third-party source files were directly copied into the repository:

| Layer | Library | Version | Purpose |
| --- | --- | --- | --- |
| **Backend** | Express | ^4.21.2 | Lightweight HTTP REST server and middleware routing |
| | Mongoose | ^8.19.2 | MongoDB object data modeling for User, Game, and Score schemas |
| | bcrypt | ^5.1.1 | Cryptographic password hashing (10 salt rounds) |
| | jsonwebtoken | ^9.0.2 | Cryptographically signed authentication tokens |
| | cookie-parser | ^1.4.7 | Parsing httpOnly session cookies |
| | cors | ^2.8.5 | Cross-Origin Resource Sharing with credentials allowlist |
| | dotenv | ^16.6.1 | Loading environment configuration from `.env` |
| **Frontend** | React | ^18.3.1 | Component-based, event-driven reactive user interface |
| | React Router DOM | ^6.28.0 | Declarative client-side routing and protected routes |
| | Vite | ^6.4.5 | Modern fast build tooling and development server |

---

## 5. Media & Design Assets

- **Typography**: Google Fonts (`Fredoka` for display headings and `Nunito` for UI copy).
- **Art & Icons**: 
  - The vector banana illustration on the landing page is an inline SVG written specifically for this project.
  - Status indicators use native Unicode emoji (`🍌`, `🎮`, `🏆`, `👤`, `🔊`, `🔇`).
  - Sound effects (correct beep, wrong buzz, game over tone) are generated programmatically in the browser using the Web Audio API (`AudioContext`). No audio asset files are downloaded.
