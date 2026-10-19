
const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const emptyState = document.getElementById("empty-state");
const clearCompletedBtn = document.getElementById("clear-completed");
const errorMessage = document.getElementById("error-message");
const filterButtons = document.querySelectorAll(".filter");

const STORAGE_KEY = "taskflow-tasks";

let tasks = loadTasks();
let currentFilter = "all";

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];

    return Array.isArray(parsed)
      ? parsed.filter(task =>
          task &&
          typeof task.id === "string" &&
          typeof task.text === "string" &&
          typeof task.completed === "boolean"
        )
      : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch {
    errorMessage.textContent = "Unable to save tasks in this browser.";
    return false;
  }
}

function addTask(text) {
  const task = {
    id: crypto.randomUUID(),
    text,
    completed: false
  };

  tasks.unshift(task);
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map(task =>
    task.id === id
      ? { ...task, completed: !task.completed }
      : task
  );

  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

function clearCompleted() {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
}

function renderTasks() {
  taskList.replaceChildren();

  const visibleTasks = tasks.filter(task => {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  const remaining = tasks.filter(task => !task.completed).length;

  taskCount.textContent =
    `${remaining} ${remaining === 1 ? "task" : "tasks"} left`;

  emptyState.hidden = visibleTasks.length > 0;

  if (tasks.length === 0) {
    emptyState.querySelector("h2").textContent = "No tasks yet";
    emptyState.querySelector("p").textContent =
      "Add your first task and make today productive!";
  } else if (visibleTasks.length === 0) {
    emptyState.querySelector("h2").textContent = "Nothing to show";
    emptyState.querySelector("p").textContent =
      "Try another filter to find your tasks.";
  }

  visibleTasks.forEach(task => {
    const item = document.createElement("li");
    item.className = "task-item";
    if (task.completed) item.classList.add("completed");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Complete ${task.text}`);

    checkbox.addEventListener("change", () => {
      toggleTask(task.id);
    });

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "×";
    deleteBtn.setAttribute("aria-label", `Delete ${task.text}`);

    deleteBtn.addEventListener("click", () => {
      deleteTask(task.id);
    });

    item.append(checkbox, text, deleteBtn);
    taskList.appendChild(item);
  });

  clearCompletedBtn.disabled = !tasks.some(task => task.completed);
  clearCompletedBtn.style.opacity =
    clearCompletedBtn.disabled ? "0.45" : "1";
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const text = input.value.trim();

  if (!text) {
    errorMessage.textContent = "Please enter a task first.";
    input.focus();
    return;
  }

  errorMessage.textContent = "";
  addTask(text);
  input.value = "";
  input.focus();
});

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach(btn => {
      const isActive = btn === button;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });

    renderTasks();
  });
});

clearCompletedBtn.addEventListener("click", clearCompleted);

renderTasks();
