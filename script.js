/*******************************/
/*  Monopoly Simulation Class  */
/*******************************/
class MonopolySim {
    constructor() {
        /* DOM refs */
        this.boardEl = document.getElementById("board");
        this.tokenEl = document.getElementById("token");
        this.startBtn = document.getElementById("startBtn");
        this.stopBtn = document.getElementById("stopBtn");
        this.restartBtn = document.getElementById("restartBtn");
        this.speedRange = document.getElementById("speedRange");
        this.speedDisp = document.getElementById("speedDisplay");
        this.showVisitsBtn = document.getElementById("showVisitsBtn");
        this.die1El = document.getElementById("die1");
        this.die2El = document.getElementById("die2");
        this.totalEl = document.getElementById("total");

        /* State */
        this.position = 0;
        this.visits = Array(40).fill(0);
        this.speed = Number(this.speedRange.value); // ms per turn
        this.running = false;
        this.lastStepTime = 0;                              // for rAF timing

        /* Init */
        this.#buildBoard();
        this.#placeToken(0);
        this.#attachEvents();
    }

    /* ───────────────────────────────────────── private helpers ───── */
    #buildBoard() {
        for (let row = 0; row < 11; row++) {
            for (let col = 0; col < 11; col++) {
                const cell = document.createElement("div");
                const isEdge = row === 0 || row === 10 || col === 0 || col === 10;

                if (!isEdge) {
                    cell.className = "empty";
                } else {
                    const idx = MonopolySim.#indexFor(row, col);
                    cell.className = "space";
                    cell.id = `space-${idx}`;
                    cell.textContent = idx;
                }
                this.boardEl.appendChild(cell);
            }
        }
    }

    static #indexFor(r, c) {
        if (r === 10) return 10 - c;           // bottom row → 10‑0
        if (c === 0) return 10 + (10 - r);     // left column → 11‑19
        if (r === 0) return 20 + c;            // top row → 20‑30
        return 30 + r;                         // right column → 31‑39
    }

    #attachEvents() {
        this.startBtn.onclick = () => this.start();
        this.stopBtn.onclick = () => this.stop();
        this.restartBtn.onclick = () => this.reset();
        this.speedRange.oninput = e => {
            this.speed = Number(e.target.value);
            this.speedDisp.textContent = `${this.speed} ms`;
        };
        this.showVisitsBtn.onclick = () => {
            const visits = this.visits.map((v, i) => `${i}: ${v}`).join("\n");
            alert(`Visits:\n${visits}`);
        };
    }

    /* ───────────────────────────────────────── simulation control ─── */
    start() {
        if (!this.running) {
            this.running = true;
            this.lastStepTime = performance.now();
            requestAnimationFrame(this.#loop.bind(this));
        }
    }

    stop() { this.running = false; }

    reset() {
        this.stop();
        this.position = 0;
        this.visits.fill(0);
        this.#placeToken(0);
        this.die1El.textContent = this.die2El.textContent = this.totalEl.textContent = "0";
    }

    /* ───────────────────────────────────────── simulation loop ───── */
    #loop(ts) {
        if (!this.running) return;
        if (ts - this.lastStepTime >= this.speed) {
            this.#takeTurn();
            this.lastStepTime = ts;
        }
        requestAnimationFrame(this.#loop.bind(this));
    }

    #takeTurn() {
        const d1 = MonopolySim.#rollDie();
        const d2 = MonopolySim.#rollDie();
        const move = d1 + d2;

        const newPosition = (this.position + move) % 40;
        this.position = newPosition;
        this.visits[this.position]++;

        /* update UI */
        this.die1El.textContent = d1;
        this.die2El.textContent = d2;
        this.totalEl.textContent = move;
        this.#placeToken(this.position);

        /* TODO: render visit stats / chart */
    }

    #placeToken(spaceIdx) {
        const target = document.getElementById(`space-${spaceIdx}`);
        const boardRect = this.boardEl.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();

        const x = targetRect.left - boardRect.left + targetRect.width / 2;
        const y = (targetRect.top - boardRect.top + targetRect.height / 2) - 10;

        this.tokenEl.style.transform = `translate(${x-10}px, ${y-602}px)`;
    }

    /* ───────────────────────────────────────── utilities ──────────── */
    static #rollDie() { return Math.floor(Math.random() * 6) + 1; }
}

/* ───── bootstrap ────────────────────────────────────────────────── */
window.addEventListener("DOMContentLoaded", () => new MonopolySim());


