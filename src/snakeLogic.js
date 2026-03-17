export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

export const OPPOSITE_DIRECTION = {
  up: "down",
  down: "up",
  left: "right",
  right: "left"
};

export function createInitialSnake({ cols, rows }) {
  assertValidBoardDimensions(cols, rows);

  const length = Math.min(3, cols);
  const headX = Math.max(length - 1, Math.floor(cols / 2));
  const centerY = Math.floor(rows / 2);

  return Array.from({ length }, (_, index) => ({
    x: headX - index,
    y: centerY
  }));
}

export function clampDeltaMs(deltaMs, maxDeltaMs) {
  if (!Number.isFinite(deltaMs) || deltaMs <= 0) {
    return 0;
  }

  return Math.min(deltaMs, maxDeltaMs);
}

export function placeFood({ cols, rows, snake, random = Math.random }) {
  const occupied = new Set(snake.map((segment) => `${segment.x},${segment.y}`));
  const available = [];

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) {
        available.push({ x, y });
      }
    }
  }

  if (available.length === 0) {
    return null;
  }

  const index = Math.min(
    available.length - 1,
    Math.floor(random() * available.length)
  );

  return available[index];
}

export function createInitialState(options = {}) {
  const cols = options.cols ?? 16;
  const rows = options.rows ?? 16;
  assertValidBoardDimensions(cols, rows);

  const snake = options.snake
    ? options.snake.map(copyPoint)
    : createInitialSnake({ cols, rows });
  const direction = options.direction ?? "right";
  const queuedDirection = direction;
  const food =
    options.food ??
    placeFood({
      cols,
      rows,
      snake,
      random: options.random
    });

  return {
    cols,
    rows,
    snake,
    direction,
    queuedDirection,
    food,
    score: options.score ?? 0,
    status: options.status ?? "ready",
    isPaused: options.isPaused ?? false
  };
}

export function queueDirection(state, nextDirection) {
  if (!DIRECTIONS[nextDirection]) {
    return state;
  }

  if (
    state.snake.length > 1 &&
    OPPOSITE_DIRECTION[state.direction] === nextDirection
  ) {
    return state;
  }

  return {
    ...state,
    queuedDirection: nextDirection
  };
}

export function togglePause(state) {
  if (state.status === "game-over" || state.status === "won") {
    return state;
  }

  return {
    ...state,
    isPaused: !state.isPaused,
    status: !state.isPaused ? "paused" : "running"
  };
}

export function restartGame(options = {}) {
  return createInitialState({
    cols: options.cols,
    rows: options.rows,
    random: options.random
  });
}

export function stepGame(state, options = {}) {
  if (
    state.status === "game-over" ||
    state.status === "won" ||
    state.status === "ready" ||
    state.isPaused
  ) {
    return state;
  }

  const nextDirection = getNextDirection(state.direction, state.queuedDirection);
  const velocity = DIRECTIONS[nextDirection];
  const currentHead = state.snake[0];
  const nextHead = {
    x: currentHead.x + velocity.x,
    y: currentHead.y + velocity.y
  };

  if (hitsBoundary(nextHead, state.cols, state.rows)) {
    return {
      ...state,
      direction: nextDirection,
      queuedDirection: nextDirection,
      status: "game-over"
    };
  }

  const willEat = state.food && nextHead.x === state.food.x && nextHead.y === state.food.y;
  const bodyToCheck = willEat ? state.snake : state.snake.slice(0, -1);

  if (bodyToCheck.some((segment) => segment.x === nextHead.x && segment.y === nextHead.y)) {
    return {
      ...state,
      direction: nextDirection,
      queuedDirection: nextDirection,
      status: "game-over"
    };
  }

  const nextSnake = [nextHead, ...state.snake.map(copyPoint)];
  if (!willEat) {
    nextSnake.pop();
  }

  const nextFood = willEat
    ? placeFood({
        cols: state.cols,
        rows: state.rows,
        snake: nextSnake,
        random: options.random
      })
    : state.food;

  return {
    ...state,
    snake: nextSnake,
    direction: nextDirection,
    queuedDirection: nextDirection,
    food: nextFood,
    score: willEat ? state.score + 1 : state.score,
    status: nextFood === null ? "won" : "running"
  };
}

export function serializeGameState(state) {
  return JSON.stringify({
    mode: state.status,
    paused: state.isPaused,
    score: state.score,
    direction: state.direction,
    board: {
      cols: state.cols,
      rows: state.rows,
      origin: "top-left",
      axes: "x increases right, y increases down"
    },
    snake: state.snake.map(copyPoint),
    food: state.food ? copyPoint(state.food) : null
  });
}

function hitsBoundary(point, cols, rows) {
  return point.x < 0 || point.y < 0 || point.x >= cols || point.y >= rows;
}

function getNextDirection(currentDirection, queuedDirection) {
  if (!queuedDirection || !DIRECTIONS[queuedDirection]) {
    return currentDirection;
  }

  if (OPPOSITE_DIRECTION[currentDirection] === queuedDirection) {
    return currentDirection;
  }

  return queuedDirection;
}

function copyPoint(point) {
  return { x: point.x, y: point.y };
}

function assertValidBoardDimensions(cols, rows) {
  if (!Number.isInteger(cols) || !Number.isInteger(rows) || cols < 1 || rows < 1) {
    throw new RangeError("Board dimensions must be positive integers.");
  }
}
