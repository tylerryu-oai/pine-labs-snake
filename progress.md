Original prompt: Build a classic Snake game in this repo.

- Repo inspection: workspace was empty; no git repo, package.json, or existing framework/tooling to integrate with.
- Decision: build a dependency-free static web app with plain HTML/CSS/JS and a tiny Node static server so the game is runnable without adding packages.
- Planned files: `index.html`, `styles.css`, `src/snakeLogic.js`, `src/snakeApp.js`, `server.js`, `tests/snakeLogic.test.js`.
- Implemented initial app shell, pure snake logic module, canvas renderer, keyboard/touch controls, restart/pause controls, and Node static server.
- Added zero-dependency tests with `node --test` against movement, growth, collisions, direction queueing, and food placement.
- Tightened state gating so the board remains idle in `ready` and `won` states until input or restart.
- Verification:
  - `npm test` passes.
  - Browser smoke test via the bundled Playwright client passed for movement and paused state.
  - Port `3000` was already in use locally during testing; `PORT=3210 node server.js` worked.
