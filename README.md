# Snake

A minimal browser implementation of the classic Snake game.

This repo uses plain HTML, CSS, and JavaScript with a tiny Node static server. There are no runtime dependencies and no framework setup to install.

## Run locally

Prerequisites:

- Node.js 18+.

Start the app:

1. Run `npm install`.
   This repo does not pull packages today, but this keeps the workflow consistent and creates a lockfile if you want one later.
2. Run `npm run dev`.
3. Open `http://localhost:3000`.

If port `3000` is already in use, start the server on a different port:

1. Run `PORT=3210 npm run dev`.
2. Open `http://localhost:3210`.

## Run tests

Run:

```bash
npm test
```

This uses Node's built-in test runner to verify the core game rules in `tests/snakeLogic.test.js`.

## Controls

- Move with the arrow keys.
- Move with `W`, `A`, `S`, and `D`.
- Pause or resume with `Space` or `P`.
- Restart with `Enter` or `R`.
- On narrow screens, use the on-screen direction buttons.

## What is implemented

- Grid-based movement on a fixed board.
- Snake growth after eating food.
- Random food placement on unoccupied cells.
- Score tracking.
- Game-over on wall collision or self-collision.
- Pause and restart controls.

## Project structure

- `index.html`: App shell, HUD, canvas, and control buttons.
- `styles.css`: Minimal layout and game styling.
- `server.js`: Tiny static file server used by `npm run dev`.
- `src/snakeLogic.js`: Pure game logic for movement, direction queueing, food placement, collisions, serialization, and restart.
- `src/snakeApp.js`: Canvas renderer, input handling, tick loop, and browser hooks.
- `tests/snakeLogic.test.js`: Rule-level tests for the core game logic.
- `progress.md`: Build notes and verification history from implementation.

## Browser hooks

The browser app exposes two helpers on `window`:

- `window.advanceTime(ms)`: Advances the game loop deterministically for testing.
- `window.render_game_to_text()`: Returns a concise JSON snapshot of the current game state.

These hooks exist to support deterministic smoke tests and visual inspection.

## Manual verification checklist

Use this checklist after making gameplay or rendering changes:

1. Start the game and confirm the snake does not move until the first direction input.
2. Turn the snake with both arrow keys and `WASD`.
3. Eat food and confirm the score increments and the snake grows by one segment.
4. Pause the game and confirm the board state does not advance while paused.
5. Restart the game and confirm the score, snake, and food reset.
6. Hit a wall and confirm the game ends.
7. Run into the snake's body and confirm the game ends.
8. On a narrow viewport, confirm the on-screen direction buttons work.

## Notes for future changes

- Keep gameplay rules in `src/snakeLogic.js` so they stay easy to test.
- Keep `src/snakeApp.js` focused on rendering and browser input.
- If you add behavior that changes timing or state transitions, extend the Node tests first.
