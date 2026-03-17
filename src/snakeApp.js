import {
  createInitialState,
  queueDirection,
  restartGame,
  serializeGameState,
  stepGame,
  togglePause
} from "./snakeLogic.js";

const CELL_COUNT = 16;
const TICK_MS = 140;

const canvas = document.querySelector("#board");
const context = canvas.getContext("2d");
const scoreEl = document.querySelector("#score");
const statusEl = document.querySelector("#status");
const restartButton = document.querySelector("#restart-button");
const pauseButton = document.querySelector("#pause-button");
const touchButtons = document.querySelectorAll("[data-direction]");

let state = createInitialState({ cols: CELL_COUNT, rows: CELL_COUNT });
let accumulatedMs = 0;
let lastFrameTime = performance.now();

function frame(now) {
  const delta = now - lastFrameTime;
  lastFrameTime = now;
  update(delta);
  render();
  requestAnimationFrame(frame);
}

function update(deltaMs) {
  accumulatedMs += deltaMs;

  while (accumulatedMs >= TICK_MS) {
    accumulatedMs -= TICK_MS;
    state = stepGame(state);
  }
}

function render() {
  const cellSize = canvas.width / state.cols;

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#f6f0e4";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = "#e6dccb";
  context.lineWidth = 1;

  for (let index = 0; index <= state.cols; index += 1) {
    const position = index * cellSize;
    context.beginPath();
    context.moveTo(position, 0);
    context.lineTo(position, canvas.height);
    context.stroke();

    context.beginPath();
    context.moveTo(0, position);
    context.lineTo(canvas.width, position);
    context.stroke();
  }

  if (state.food) {
    drawCell(state.food.x, state.food.y, "#c95a45", cellSize, 0.18);
  }

  state.snake.forEach((segment, index) => {
    drawCell(
      segment.x,
      segment.y,
      index === 0 ? "#315c3a" : "#4f8a57",
      cellSize,
      0.12
    );
  });

  scoreEl.textContent = String(state.score);
  statusEl.textContent = formatStatus(state);
  pauseButton.textContent = state.isPaused ? "Resume" : "Pause";

  if (state.status === "game-over") {
    drawOverlay("Game Over", "Press Enter or R to restart");
  } else if (state.status === "ready") {
    drawOverlay("Snake", "Press any direction to start");
  } else if (state.status === "won") {
    drawOverlay("You Win", "Press Enter or R to restart");
  } else if (state.isPaused) {
    drawOverlay("Paused", "Press Space or P to resume");
  }
}

function drawCell(x, y, color, cellSize, insetFactor) {
  const inset = cellSize * insetFactor;
  context.fillStyle = color;
  context.fillRect(
    x * cellSize + inset,
    y * cellSize + inset,
    cellSize - inset * 2,
    cellSize - inset * 2
  );
}

function drawOverlay(title, subtitle) {
  context.fillStyle = "rgba(47, 36, 24, 0.16)";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#2f2418";
  context.textAlign = "center";
  context.font = '700 32px "Avenir Next", Avenir, sans-serif';
  context.fillText(title, canvas.width / 2, canvas.height / 2 - 8);
  context.font = '500 16px "Avenir Next", Avenir, sans-serif';
  context.fillText(subtitle, canvas.width / 2, canvas.height / 2 + 26);
}

function formatStatus(currentState) {
  if (currentState.status === "game-over") {
    return "Game over";
  }
  if (currentState.status === "won") {
    return "Won";
  }
  if (currentState.isPaused) {
    return "Paused";
  }
  if (currentState.status === "ready") {
    return "Ready";
  }
  return "Running";
}

function handleDirection(direction) {
  if (state.status === "game-over" || state.status === "won") {
    return;
  }

  state = queueDirection(state, direction);
  if (state.status === "ready") {
    state = { ...state, status: "running" };
  }
  render();
}

function handleRestart() {
  state = restartGame({ cols: CELL_COUNT, rows: CELL_COUNT });
  accumulatedMs = 0;
  render();
}

function handlePauseToggle() {
  if (state.status === "ready") {
    return;
  }
  state = togglePause(state);
  render();
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (key === "arrowup" || key === "w") {
    event.preventDefault();
    handleDirection("up");
    return;
  }
  if (key === "arrowdown" || key === "s") {
    event.preventDefault();
    handleDirection("down");
    return;
  }
  if (key === "arrowleft" || key === "a") {
    event.preventDefault();
    handleDirection("left");
    return;
  }
  if (key === "arrowright" || key === "d") {
    event.preventDefault();
    handleDirection("right");
    return;
  }
  if (key === " " || key === "p") {
    event.preventDefault();
    handlePauseToggle();
    return;
  }
  if (key === "enter" || key === "r") {
    event.preventDefault();
    handleRestart();
  }
});

restartButton.addEventListener("click", handleRestart);
pauseButton.addEventListener("click", handlePauseToggle);
touchButtons.forEach((button) => {
  button.addEventListener("click", () => {
    handleDirection(button.dataset.direction);
  });
});

window.render_game_to_text = () => serializeGameState(state);
window.advanceTime = (ms) => {
  update(ms);
  render();
};

render();
requestAnimationFrame(frame);
