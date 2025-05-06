/*******************************/
/*  Monopoly Simulation Class  */
/*******************************/
class MonopolySim {
    constructor() {
      /* DOM refs */
      this.boardEl   = document.getElementById("board");
      this.tokenEl   = document.getElementById("token");
      this.startBtn  = document.getElementById("startBtn");
      this.stopBtn   = document.getElementById("stopBtn");
      this.restartBtn= document.getElementById("restartBtn");
      this.speedRange= document.getElementById("speedRange");
      this.speedDisp = document.getElementById("speedDisplay");
      this.showVisitsBtn = document.getElementById("showVisitsBtn");
  
      this.die1El = document.getElementById("die1");
      this.die2El = document.getElementById("die2");
      this.totalEl= document.getElementById("total");
  
      /* State */
      this.position = 0;
      this.visits   = Array(40).fill(0);
      this.speed    = Number(this.speedRange.value); // ms per turn
      this.running  = false;
      this.lastStep = 0;
  
      /* Init */
      this.#buildBoard();
      this.#createChart();      // ← NEW
      this.#placeToken(0);
      this.#attachEvents();
    }
  
    /* ───────────────────────────────────────── board helpers ───── */
    #buildBoard() {
      for (let r = 0; r < 11; r++) {
        for (let c = 0; c < 11; c++) {
          const cell     = document.createElement("div");
          const isEdge   = r === 0 || r === 10 || c === 0 || c === 10;
          if (!isEdge) {
            cell.className = "empty";
          } else {
            const idx = MonopolySim.#indexFor(r, c);
            cell.className = "space";
            cell.id        = `space-${idx}`;
            cell.textContent = idx;
          }
          this.boardEl.appendChild(cell);
        }
      }
    }
    static #indexFor(r, c) {
      if (r === 10) return 10 - c;            // bottom row 0‑10
      if (c === 0)  return 10 + (10 - r);     // left col   11‑19
      if (r === 0)  return 20 + c;            // top row    20‑30
      return 30 + r;                          // right col  31‑39
    }
  
    /* ───────────────────────────────────────── chart setup ─────── */
    #createChart() {
      const ctx = document.getElementById("visitsChart").getContext("2d");
      this.chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: Array.from({length: 40}, (_, i) => i.toString()),
          datasets: [{
            label: "Space Visits",
            data: this.visits,
            borderWidth: 1
          }]
        },
        options: {
          animation: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: { precision:0 }
            }
          }
        }
      });
    }
  
    #updateChart() {
      this.chart.data.datasets[0].data = this.visits;
      this.chart.update();
    }
  
    /* ───────────────────────────────────────── events ──────────── */
    #attachEvents() {
      this.startBtn.onclick    = () => this.start();
      this.stopBtn.onclick     = () => this.stop();
      this.restartBtn.onclick  = () => this.reset();
      this.speedRange.oninput  = e => {
        this.speed = Number(e.target.value);
        this.speedDisp.textContent = `${this.speed} ms`;
      };
      this.showVisitsBtn.onclick = () => {
        alert(this.visits.map((v,i)=>`${i}: ${v}`).join("\n"));
      };
    }
  
    /* ───────────────────────────────────────── control loop ───── */
    start() {
      if (!this.running) {
        this.running   = true;
        this.lastStep  = performance.now();
        requestAnimationFrame(this.#loop.bind(this));
      }
    }
    stop()  { this.running = false; }
    reset() {
      this.stop();
      this.position = 0;
      this.visits.fill(0);
      this.#placeToken(0);
      this.die1El.textContent =
      this.die2El.textContent =
      this.totalEl.textContent = "0";
      this.#updateChart(); // clear bars
    }
  
    #loop(ts) {
      if (!this.running) return;
      if (ts - this.lastStep >= this.speed) {
        this.#takeTurn();
        this.lastStep = ts;
      }
      requestAnimationFrame(this.#loop.bind(this));
    }
  
    /* ───────────────────────────────────────── per‑turn logic ─── */
    #takeTurn() {
      const d1 = MonopolySim.#rollDie();
      const d2 = MonopolySim.#rollDie();
      const move = d1 + d2;
  
      this.position = (this.position + move) % 40;
      this.visits[this.position]++;
  
      /* UI updates */
      this.die1El.textContent = d1;
      this.die2El.textContent = d2;
      this.totalEl.textContent= move;
      this.#placeToken(this.position);
      this.#updateChart();           // ← live chart refresh
    }
  
    #placeToken(idx) {
      const target     = document.getElementById(`space-${idx}`);
      const boardRect  = this.boardEl.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const x = targetRect.left - boardRect.left + targetRect.width  / 2;
      const y = targetRect.top  - boardRect.top  + targetRect.height / 2;
      this.tokenEl.style.transform = `translate(${x-10}px, ${y-612}px)`;
    }
  
    /* ───────────────────────────────────────── utils ───────────── */
    static #rollDie() { return Math.floor(Math.random() * 6) + 1; }
  }
  
  /* bootstrap */
  window.addEventListener("DOMContentLoaded", () => new MonopolySim());
  