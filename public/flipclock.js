/**
 * Total time for one digit fold (fold to edge-on, swap, unfold).
 * Default 1000 ms; override temporarily with ?flip=500 (milliseconds, clamped 0–15000).
 */
function readFlipDurationMs() {
  const raw = new URLSearchParams(window.location.search).get("flip");
  if (raw === null || raw === "") return 1000;
  const n = Number(raw);
  if (!Number.isFinite(n)) return 1000;
  return Math.min(15000, Math.max(0, Math.round(n)));
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

/** Per tab session via sessionStorage (not cookies): show once, then hide for reloads until the tab is closed. */
const DONATION_BANNER_STORAGE_KEY = "flipclock-donation-banner-dismissed";
const DONATION_BANNER_VISIBLE_MS = 10000;

function initDonationBanner() {
  const banner = document.getElementById("donation-banner");
  if (!banner) return;

  let dismissed = false;
  try {
    dismissed = sessionStorage.getItem(DONATION_BANNER_STORAGE_KEY) === "1";
  } catch {
    /* sessionStorage unavailable — show once this load without persisting */
  }
  if (dismissed) return;

  banner.hidden = false;

  const fadeMs = prefersReducedMotion() ? 0 : 850;

  window.setTimeout(() => {
    banner.classList.add("donation-banner--fade-out");

    let completed = false;
    const finish = () => {
      if (completed) return;
      completed = true;
      try {
        sessionStorage.setItem(DONATION_BANNER_STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
      banner.hidden = true;
    };

    if (fadeMs === 0) {
      finish();
      return;
    }

    const onEnd = (e) => {
      if (e.target !== banner || e.propertyName !== "opacity") return;
      banner.removeEventListener("transitionend", onEnd);
      finish();
    };
    banner.addEventListener("transitionend", onEnd);
    window.setTimeout(finish, fadeMs + 400);
  }, DONATION_BANNER_VISIBLE_MS);
}

initDonationBanner();
