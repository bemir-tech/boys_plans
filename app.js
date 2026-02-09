const planBody = document.getElementById("planBody");
const filterInput = document.getElementById("filterInput");
const weekToggle = document.getElementById("weekToggle");
const clearBtn = document.getElementById("clearBtn");
const todayBtn = document.getElementById("todayBtn");

const STORAGE_KEY = "family-plans-2026";

const startDate = makeUTCDate(2026, 2, 9);
const endDate = makeUTCDate(2026, 12, 31);

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  timeZone: "UTC",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

function makeUTCDate(year, month, day) {
  return new Date(Date.UTC(year, month - 1, day));
}

function addDaysUTC(date, days) {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

function loadActivities() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveActivities(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const activities = loadActivities();

function buildTable() {
  planBody.innerHTML = "";

  let current = startDate;
  while (current <= endDate) {
    const key = dateKey(current);
    const dayName = dayFormatter.format(current);

    if (weekToggle.checked && dayName === "Monday") {
      const weekRow = document.createElement("tr");
      weekRow.className = "week-sep";
      const weekCell = document.createElement("td");
      weekCell.colSpan = 3;
      weekCell.textContent = `Week of ${dateFormatter.format(current)}`;
      weekRow.appendChild(weekCell);
      planBody.appendChild(weekRow);
    }

    const row = document.createElement("tr");
    row.id = `row-${key}`;
    row.dataset.date = key;

    const dayCell = document.createElement("td");
    dayCell.textContent = dayName;

    const dateCell = document.createElement("td");
    dateCell.textContent = dateFormatter.format(current);

    const activityCell = document.createElement("td");
    const activityBox = document.createElement("div");
    activityBox.className = "activity";
    activityBox.contentEditable = "true";
    activityBox.spellcheck = true;
    activityBox.dataset.date = key;
    activityBox.textContent = activities[key] || "";

    activityBox.addEventListener("input", (event) => {
      const target = event.currentTarget;
      activities[target.dataset.date] = target.textContent.trim();
      saveActivities(activities);
    });

    activityCell.appendChild(activityBox);

    row.appendChild(dayCell);
    row.appendChild(dateCell);
    row.appendChild(activityCell);

    planBody.appendChild(row);
    current = addDaysUTC(current, 1);
  }

  highlightToday();
}

function highlightToday() {
  const today = new Date();
  const key = dateKey(makeUTCDate(today.getFullYear(), today.getMonth() + 1, today.getDate()));
  const row = document.getElementById(`row-${key}`);
  if (row) row.classList.add("row-today");
}

function filterTable() {
  const query = filterInput.value.trim().toLowerCase();
  const rows = Array.from(planBody.querySelectorAll("tr"));
  rows.forEach((row) => {
    if (row.classList.contains("week-sep")) {
      row.style.display = weekToggle.checked ? "" : "none";
      return;
    }
    if (!query) {
      row.style.display = "";
      return;
    }
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(query) ? "" : "none";
  });
}

filterInput.addEventListener("input", filterTable);
weekToggle.addEventListener("change", () => {
  buildTable();
  filterTable();
});

clearBtn.addEventListener("click", () => {
  if (!confirm("Clear all activities for 2026? This cannot be undone.")) return;
  Object.keys(activities).forEach((key) => delete activities[key]);
  saveActivities(activities);
  buildTable();
});

todayBtn.addEventListener("click", () => {
  const today = new Date();
  const key = dateKey(makeUTCDate(today.getFullYear(), today.getMonth() + 1, today.getDate()));
  const row = document.getElementById(`row-${key}`);
  if (row) {
    row.scrollIntoView({ behavior: "smooth", block: "center" });
  } else {
    planBody.firstElementChild?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
});

buildTable();
