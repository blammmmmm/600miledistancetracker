import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getDatabase, ref, onValue, update, get } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

const GOAL_MILES = 600;
const DEFAULT_STATE = {
  milesCompleted: 0,
  status: "RIDING",
  visible: true,
  updatedAt: Date.now()
};

let db;
let state = { ...DEFAULT_STATE };
let history = [];

const rideRefPath = "rideOverlay";
const milesInput = document.getElementById("milesInput");
const setMilesBtn = document.getElementById("setMilesBtn");
const undoBtn = document.getElementById("undoBtn");
const previewDone = document.getElementById("previewDone");
const previewLeft = document.getElementById("previewLeft");
const previewStatus = document.getElementById("previewStatus");
const previewUpdated = document.getElementById("previewUpdated");
const overlayUrl = document.getElementById("overlayUrl");

function clampMiles(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return Math.min(GOAL_MILES, Math.max(0, num));
}

function formatMiles(value) {
  return clampMiles(value).toFixed(1);
}

function formatDate(timestamp) {
  if (!timestamp) return "Never";
  return new Date(timestamp).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function render() {
  const completed = clampMiles(state.milesCompleted);
  previewDone.textContent = formatMiles(completed);
  previewLeft.textContent = Math.max(0, GOAL_MILES - completed).toFixed(1);
  previewStatus.textContent = state.status || "RIDING";
  previewUpdated.textContent = formatDate(state.updatedAt);
  milesInput.value = formatMiles(completed);

  document.querySelectorAll(".status-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.status === state.status);
  });
}

async function save(partial, shouldUpdateTimestamp = true) {
  if (!db) {
    alert("Firebase config is missing. Add your config in firebase-config.js first.");
    return;
  }

  history.push({ ...state });
  if (history.length > 20) history.shift();

  const next = {
    ...partial,
    updatedAt: shouldUpdateTimestamp ? Date.now() : state.updatedAt
  };

  await update(ref(db, rideRefPath), next);
}

async function initFirebase() {
  const config = window.FIREBASE_CONFIG;
  if (!config || String(config.apiKey).includes("PASTE_")) {
    render();
    return;
  }

  const app = initializeApp(config);
  db = getDatabase(app);
  const rideRef = ref(db, rideRefPath);

  const existing = await get(rideRef);
  if (!existing.exists()) {
    await update(rideRef, DEFAULT_STATE);
  }

  onValue(rideRef, (snapshot) => {
    state = { ...DEFAULT_STATE, ...(snapshot.val() || {}) };
    render();
  });
}

setMilesBtn.addEventListener("click", () => {
  save({ milesCompleted: clampMiles(milesInput.value) });
});

milesInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") save({ milesCompleted: clampMiles(milesInput.value) });
});

document.querySelectorAll("[data-delta]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const delta = Number(btn.dataset.delta);
    save({ milesCompleted: clampMiles(state.milesCompleted + delta) });
  });
});

document.querySelectorAll(".status-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    save({ status: btn.dataset.status }, false);
  });
});

document.getElementById("showBtn").addEventListener("click", () => save({ visible: true }, false));
document.getElementById("hideBtn").addEventListener("click", () => save({ visible: false }, false));

undoBtn.addEventListener("click", async () => {
  const previous = history.pop();
  if (!previous) return;
  await update(ref(db, rideRefPath), previous);
});

const currentUrl = new URL(window.location.href);
currentUrl.pathname = currentUrl.pathname.replace("controller.html", "overlay.html");
overlayUrl.textContent = currentUrl.href;

initFirebase();
