
const GOALS_KEY = "portfolio-goals";
const THEME_KEY = "portfolio-theme";

const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeIcon.textContent = theme === "dark" ? "☀" : "☾";
}

function getInitialTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") {
    return saved;
  }
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem(THEME_KEY, next);
}

const DEFAULT_GOALS = [
  { id: 1, text: "Да науча Git и GitHub", done: false },
  { id: 2, text: "Да науча адаптивен дизайн", done: false },
  { id: 3, text: "Да науча как се работи с API", done: false },
];

function loadGoals() {
  const saved = localStorage.getItem(GOALS_KEY);

  if (saved === null) {
    return DEFAULT_GOALS.map((goal) => ({ ...goal }));
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveGoals() {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

let goals = loadGoals(); 
let currentFilter = "all"; 

function normalize(text) {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
}

function validateGoal(text) {
  const clean = normalize(text);

  if (clean === "") {
    return "Моля, напиши цел — полето не може да е празно или само с интервали.";
  }

  const isDuplicate = goals.some((goal) => normalize(goal.text) === clean);
  if (isDuplicate) {
    return "Тази цел вече я има в списъка.";
  }

  return "";
}

function addGoal(text) {
  const newGoal = {
    id: Date.now(),
    text: text.trim().replace(/\s+/g, " "),
    done: false,
  };
  goals.push(newGoal);
  saveGoals();
  render();
}

function toggleGoal(id) {
  const goal = goals.find((g) => g.id === id);
  if (goal) {
    goal.done = !goal.done;
    saveGoals();
    render();
  }
}

function deleteGoal(id) {
  const goal = goals.find((g) => g.id === id);
  if (!goal) return;

  const confirmed = confirm(`Сигурен ли си, че искаш да изтриеш „${goal.text}“?`);
  if (!confirmed) return;

  goals = goals.filter((g) => g.id !== id);
  saveGoals();
  render();
}

function setFilter(filter) {
  currentFilter = filter;

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });

  render();
}

function getFilteredGoals() {
  if (currentFilter === "active") {
    return goals.filter((g) => !g.done);
  }
  if (currentFilter === "completed") {
    return goals.filter((g) => g.done);
  }
  return goals;
}

const goalList = document.getElementById("goal-list");
const emptyMessage = document.getElementById("empty-message");

function createGoalElement(goal) {
  const li = document.createElement("li");
  li.className = goal.done ? "goal-item done" : "goal-item";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = goal.done;
  checkbox.id = "goal-" + goal.id;
  checkbox.addEventListener("change", () => toggleGoal(goal.id));

  const label = document.createElement("label");
  label.htmlFor = checkbox.id;
  label.className = "goal-text";
  label.textContent = goal.text;

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "✕";
  deleteBtn.setAttribute("aria-label", "Изтрий цел: " + goal.text);
  deleteBtn.addEventListener("click", () => deleteGoal(goal.id));

  li.append(checkbox, label, deleteBtn);
  return li;
}

function renderList() {
  goalList.innerHTML = "";

  const visibleGoals = getFilteredGoals();
  visibleGoals.forEach((goal) => {
    goalList.appendChild(createGoalElement(goal));
  });

  if (goals.length === 0) {
    emptyMessage.textContent = "Все още нямаш цели. Добави първата си цел отгоре!";
    emptyMessage.hidden = false;
  } else if (visibleGoals.length === 0 && currentFilter === "active") {
    emptyMessage.textContent = "Няма активни цели — всичко е завършено. Браво!";
    emptyMessage.hidden = false;
  } else if (visibleGoals.length === 0 && currentFilter === "completed") {
    emptyMessage.textContent = "Все още няма завършени цели. Отметни някоя, когато я постигнеш.";
    emptyMessage.hidden = false;
  } else {
    emptyMessage.hidden = true;
  }
}

function renderProgress() {
  const total = goals.length;
  const done = goals.filter((g) => g.done).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  document.getElementById("stat-total").textContent = total;
  document.getElementById("stat-done").textContent = done;
  document.getElementById("stat-percent").textContent = percent + "%";
  document.getElementById("progress-fill").style.width = percent + "%";
  document.getElementById("progress-bar").setAttribute("aria-valuenow", percent);
}

function render() {
  renderList();
  renderProgress();
}

const form = document.getElementById("goal-form");
const input = document.getElementById("goal-input");
const formError = document.getElementById("form-error");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const error = validateGoal(input.value);
  if (error) {
    formError.textContent = error;
    input.classList.add("invalid");
    input.focus();
    return;
  }

  addGoal(input.value);
  input.value = "";
  formError.textContent = "";
  input.classList.remove("invalid");
  input.focus();
});

input.addEventListener("input", () => {
  formError.textContent = "";
  input.classList.remove("invalid");
});

document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => setFilter(btn.dataset.filter));
});

themeToggle.addEventListener("click", toggleTheme);

applyTheme(getInitialTheme());
render();
