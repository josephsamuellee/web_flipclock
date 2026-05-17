/**
 * Total time for one digit fold (fold to edge-on, swap, unfold).
 * Default 150 ms; override temporarily with ?flip=200 (milliseconds, clamped 0–4000).
 */
function readFlipDurationMs() {
  const raw = new URLSearchParams(window.location.search).get("flip");
  if (raw === null || raw === "") return 150;
  const n = Number(raw);
  if (!Number.isFinite(n)) return 150;
  return Math.min(4000, Math.max(0, Math.round(n)));
}

const FLIP_DURATION_MS = readFlipDurationMs();

const root = document.documentElement;
const digitFlips = Array.from(document.querySelectorAll(".digit-flip"));
const digitChars = digitFlips.map((el) => el.querySelector(".digit-char"));

function applyFlipTiming() {
  const half = Math.max(0, FLIP_DURATION_MS) / 2;
  root.style.setProperty("--flip-half", `${half}ms`);
}

applyFlipTiming();

function pad2(n) {
  return String(n).padStart(2, "0");
}

function timeDigits(date) {
  const h = pad2(date.getHours());
  const m = pad2(date.getMinutes());
  return `${h}${m}`.split("");
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function waitTransitionEnd(el) {
  return new Promise((resolve) => {
    const done = (e) => {
      if (e.target !== el) return;
      el.removeEventListener("transitionend", done);
      resolve();
    };
    el.addEventListener("transitionend", done);
  });
}

async function flipDigit(index, nextChar) {
  const flip = digitFlips[index];
  const charEl = digitChars[index];
  if (!flip || !charEl) return;

  const current = charEl.textContent;
  if (current === nextChar) return;

  if (prefersReducedMotion() || FLIP_DURATION_MS === 0) {
    charEl.textContent = nextChar;
    flip.style.transform = "rotateX(0deg)";
    return;
  }

  flip.style.transition = `transform var(--flip-half) ease-in-out`;
  flip.style.transform = "rotateX(90deg)";
  await waitTransitionEnd(flip);

  charEl.textContent = nextChar;
  flip.style.transition = "none";
  flip.style.transform = "rotateX(-90deg)";
  flip.offsetHeight;
  flip.style.transition = `transform var(--flip-half) ease-in-out`;
  flip.style.transform = "rotateX(0deg)";
  await waitTransitionEnd(flip);
}

async function updateDisplay(nextDigits) {
  const tasks = [];
  for (let i = 0; i < 4; i += 1) {
    tasks.push(flipDigit(i, nextDigits[i]));
  }
  await Promise.all(tasks);
}

function scheduleNextMinute() {
  const now = new Date();
  const delay = 60000 - now.getSeconds() * 1000 - now.getMilliseconds();
  return window.setTimeout(runMinuteTick, delay);
}

let minuteTimerId = 0;

async function runMinuteTick() {
  const next = timeDigits(new Date());
  await updateDisplay(next);
  minuteTimerId = scheduleNextMinute();
}

function init() {
  const now = new Date();
  const digits = timeDigits(now);
  for (let i = 0; i < 4; i += 1) {
    digitChars[i].textContent = digits[i];
    digitFlips[i].style.transform = "rotateX(0deg)";
  }
  if (minuteTimerId) window.clearTimeout(minuteTimerId);
  minuteTimerId = scheduleNextMinute();
}

init();
