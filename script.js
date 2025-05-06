const board = document.getElementById("board");
const token = document.getElementById("token");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const restartBtn = document.getElementById("restartBtn");
const speedRange = document.getElementById("speedRange");

let position = 0;
let visitCounts = new Array(40).fill(0);
let intervalId = null;
let speed = speedRange.value;

// Create 40 Monopoly spaces
for (let i = 0; i < 40; i++) {
  const space = document.createElement("div");
  space.className = "space";
  space.id = "space-" + i;
  space.textContent = i;
  board.appendChild(space);
}

// Position token initially
moveToken(position);

// Simulation loop
function startSimulation() {
  if (intervalId) return;

  intervalId = setInterval(() => {
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const move = dice1 + dice2;

    position = (position + move) % 40;
    visitCounts[position]++;
    moveToken(position);
  }, speed);
}

function stopSimulation() {
  clearInterval(intervalId);
  intervalId = null;
}

function restartSimulation() {
  stopSimulation();
  position = 0;
  visitCounts.fill(0);
  moveToken(position);
}

function moveToken(pos) {
  const target = document.getElementById("space-" + pos);
  const rect = target.getBoundingClientRect();
  const boardRect = board.getBoundingClientRect();
  token.style.top = rect.top - boardRect.top + "px";
  token.style.left = rect.left - boardRect.left + "px";
}

startBtn.addEventListener("click", startSimulation);
stopBtn.addEventListener("click", stopSimulation);
restartBtn.addEventListener("click", restartSimulation);
speedRange.addEventListener("input", () => {
  speed = speedRange.value;
  if (intervalId) {
    stopSimulation();
    startSimulation();
  }
});
