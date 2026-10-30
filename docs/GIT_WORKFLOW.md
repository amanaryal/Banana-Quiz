<!--
Purpose: Explains how this project uses Git so the version-control theme is easy to show in the video.
Theme: Version control
-->

# Git workflow

This file is the plan for how code is saved over time. Each finished feature gets its own branch and one clear commit. Commits are made by hand after a feature is tested. The assistant does not commit for you.

## Branch strategy

| Branch | What it is for |
| --- | --- |
| `main` | Stable code that runs. Only merge here after a feature works. |
| `feature/...` | One branch per feature, created from `main`. Example: `feature/banana-api`. |

Rules:

- Do new work on a feature branch, not directly on `main` (except the first setup commit, which can go on `main`).
- Finish and test the feature, then commit.
- Merge the feature branch back into `main` when you are happy with it.
- Do not commit `node_modules/`, `server/.env`, or `client/dist/`. Those are ignored. Commit `server/.env.example` only.

### Create a feature branch

```bash
git checkout main
git pull
git checkout -b feature/short-name
```

### Merge it back when the feature works

```bash
git checkout main
git merge feature/short-name
```

## Commit message convention

Use this shape:

```text
type(area): short description in the present tense
```

| Type | Use it when |
| --- | --- |
| `feat` | You add something the user or the API can do |
| `fix` | You repair a bug |
| `docs` | You only change documentation |
| `chore` | You change setup (folders, ignore rules, config examples) |

`area` is optional. Use `server`, `client`, or `docs` when it helps.

Good example: `feat(server): add /api/puzzle route with error handling`

Weak example: `update` or `fixed stuff`

## Planned commits

The features were finished together, so they are recorded as four commits. Splitting them into eight commits would mean committing files that only work halfway (the answer route also saves the score, and the puzzle page also uses login).

| Order | Branch | Commit message | Theme |
| --- | --- | --- | --- |
| 1 | `main` | `chore: initialise project folders, gitignore, and env example` | Version control |
| 2 | `feature/server-api` | `feat(server): add puzzle, auth, and score API` | Interoperability and virtual identity |
| 3 | `feature/react-client` | `feat(client): add puzzle page, login, and leaderboard` | Event-driven programming and virtual identity |
| 4 | `feature/docs` | `docs: add architecture, testing notes, and video guide` | All four themes |

`docs/CHANGELOG.md` still lists the work as eight steps, so you can say what each theme added. After you commit, write the date and a sentence in your own words in that file.

## Commands to record this project

The app was built as one piece, so the history below is four commits instead of eight half-finished ones. The messages still match the themes. Run them from the project folder. Do not commit `server/.env` or either `node_modules` folder.

Check `git status` before every commit. Those two must not appear in the list.

```bash
git init
git checkout -b main
git add .gitignore package.json dev.js server/.env.example docs/GIT_WORKFLOW.md
git commit -m "chore: initialise project folders, gitignore, and env example"

git checkout -b feature/server-api
git add server/package.json server/package-lock.json server/server.js server/config server/controllers server/middleware server/models server/routes server/services server/scripts
git commit -m "feat(server): add puzzle, auth, and score API"
git checkout main
git merge feature/server-api

git checkout -b feature/react-client
git add client/package.json client/package-lock.json client/index.html client/vite.config.js client/src
git commit -m "feat(client): add puzzle page, login, and leaderboard"
git checkout main
git merge feature/react-client

git checkout -b feature/docs
git add README.md docs/CHANGELOG.md docs/ARCHITECTURE.md docs/API_EVIDENCE.md docs/TESTING.md docs/ACKNOWLEDGEMENTS.md docs/VIDEO_NOTES.md docs/WEEK8_PRESENTATION.md
git commit -m "docs: add architecture, testing notes, and video guide"
git checkout main
git merge feature/docs
```

After the last commit, `git status` should be clean, and `git log --oneline` should show four commits. Add today's date to `docs/CHANGELOG.md` in your own words if you want that file to mention the real commit names. That edit can be a fifth small docs commit.
