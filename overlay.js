import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

const GOAL_MILES = 600;
let state = {
  milesCompleted: 0,
  status: "RIDING",
  visible: true,
  updatedAt: Date.now()
};

const overlay = document.getElementById("overlay");
const milesDone = document.getElementById("milesDone");
const milesLeft = document.getElementById("milesLeft");
const statusText = document.getElementById("statusText");
const statusDot = document.getElementById("statusDot");
const updatedAgo = document.getElementById("updatedAgo");

function clampMiles(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return Math.min(GOAL_MILES, Math.max(0, num));
}

function formatMiles(value) {
  return clampMiles(value).toFixed(1);
}

function formatAgo(timestamp) {
  if (!timestamp) return "NEVER";
  const diffMs = Math.max(0, Date.now() - timestamp);
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 15) return "JUST NOW";
  if (seconds < 60) return `${seconds} SEC AGO`;
  if (minutes < 60) return `${minutes} MIN AGO`;
  if (hours < 24) return `${hours} HR AGO`;
  return `${Math.floor(hours / 24)} DAY AGO`;
}

function render() {
  const completed = clampMiles(state.milesCompleted);
  const left = Math.max(0, GOAL_MILES - completed);

  milesDone.textContent = formatMiles(completed);
  milesLeft.textContent = left.toFixed(1);
  statusText.textContent = state.status || "RIDING";
  updatedAgo.textContent = formatAgo(state.updatedAt);

  statusDot.className = `status-dot ${(state.status || "RIDING").toLowerCase()}`;
  overlay.classList.toggle("hidden", state.visible === false);
  overlay.classList.toggle("visible", state.visible !== false);
}

function startFirebase() {
  const config = window.FIREBASE_CONFIG;
  if (!config || String(config.apiKey).includes("PASTE_")) {
    console.warn("Firebase config missing. Overlay running in demo mode.");
    render();
    return;
  }

  const app = initializeApp(config);
  const db = getDatabase(app);
  const rideRef = ref(db, "rideOverlay");

  onValue(rideRef, (snapshot) => {
    state = { ...state, ...(snapshot.val() || {}) };
    render();
  });
}

setInterval(render, 1000);
startFirebase();
