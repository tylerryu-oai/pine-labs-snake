import test from "node:test";
import assert from "node:assert/strict";

import {
  createInitialState,
  placeFood,
  queueDirection,
  stepGame
} from "../src/snakeLogic.js";

test("moves one cell in the current direction", () => {
  const state = createInitialState({
    snake: [
      { x: 3, y: 3 },
      { x: 2, y: 3 },
      { x: 1, y: 3 }
    ],
    direction: "right",
    food: { x: 10, y: 10 },
    status: "running"
  });

  const next = stepGame(state);

  assert.deepEqual(next.snake, [
    { x: 4, y: 3 },
    { x: 3, y: 3 },
    { x: 2, y: 3 }
  ]);
  assert.equal(next.score, 0);
});

test("grows and increments score after eating food", () => {
  const state = createInitialState({
    snake: [
      { x: 3, y: 3 },
      { x: 2, y: 3 },
      { x: 1, y: 3 }
    ],
    direction: "right",
    food: { x: 4, y: 3 },
    status: "running"
  });

  const next = stepGame(state, { random: () => 0 });

  assert.equal(next.score, 1);
  assert.equal(next.snake.length, 4);
  assert.deepEqual(next.snake[0], { x: 4, y: 3 });
  assert.notDeepEqual(next.food, { x: 4, y: 3 });
});

test("detects wall collisions", () => {
  const state = createInitialState({
    cols: 5,
    rows: 5,
    snake: [
      { x: 4, y: 2 },
      { x: 3, y: 2 },
      { x: 2, y: 2 }
    ],
    direction: "right",
    food: { x: 0, y: 0 },
    status: "running"
  });

  const next = stepGame(state);

  assert.equal(next.status, "game-over");
});

test("detects self collisions", () => {
  const state = createInitialState({
    snake: [
      { x: 3, y: 2 },
      { x: 3, y: 3 },
      { x: 2, y: 3 },
      { x: 2, y: 2 },
      { x: 2, y: 1 },
      { x: 3, y: 1 }
    ],
    direction: "down",
    food: { x: 10, y: 10 },
    status: "running"
  });

  const queued = queueDirection(state, "left");
  const next = stepGame(queued);

  assert.equal(next.status, "game-over");
});

test("food placement avoids snake cells", () => {
  const food = placeFood({
    cols: 3,
    rows: 2,
    snake: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 }
    ],
    random: () => 0
  });

  assert.deepEqual(food, { x: 2, y: 1 });
});

test("reverse direction input is ignored", () => {
  const state = createInitialState({
    direction: "right",
    status: "running"
  });

  const next = queueDirection(state, "left");

  assert.equal(next.queuedDirection, "right");
});
