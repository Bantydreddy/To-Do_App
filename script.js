const TASKS_KEY = "todo-tasks";
const THEME_KEY = "todo-theme";

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const message = document.getElementById("message");
const emptyState = document.getElementById("emptyState");
const counter = document.getElementById("counter");
const clearBtn = document.getElementById("clearCompleted");
const filterBtns = document.querySelectorAll(".filter-btn");
const tooltip = document.getElementById("tooltip");

let tasks = loadTasks();
let filter = "all";
let newId = null;

/* ---------- Storage ---------- */
function loadTasks() {
    try {
        const saved = JSON.parse(localStorage.getItem(TASKS_KEY));
        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
}

function saveTasks() {
    try {
        localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch {
        /* storage unavailable (private mode, quota) - app still works */
    }
}

/* ---------- Tooltip ---------- */
document.addEventListener("mousemove", (e) => {
    tooltip.style.left = `${e.clientX + 12}px`;
    tooltip.style.top = `${e.clientY + 20}px`;
});

function showTooltip(li) {
    tooltip.textContent = li.classList.contains("completed")
        ? "Task completed"
        : "Task not completed";
    tooltip.style.display = "block";
}

function hideTooltip() {
    tooltip.style.display = "none";
}

/* ---------- Rendering ---------- */
function createItem(task) {
    const li = document.createElement("li");
    li.dataset.id = task.id;
    li.tabIndex = 0;
    li.setAttribute("role", "checkbox");
    li.setAttribute("aria-checked", String(task.done));
    if (task.done) li.classList.add("completed");
    if (task.id === newId) li.classList.add("enter");

    const span = document.createElement("span");
    span.textContent = task.text;
    li.appendChild(span);

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";
    deleteBtn.setAttribute("aria-label", `Delete task: ${task.text}`);
    deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // don't toggle the task when deleting it
        hideTooltip();
        li.classList.add("fade-out");
        setTimeout(() => {
            tasks = tasks.filter((t) => t.id !== task.id);
            saveTasks();
            render();
        }, 300); // matches the CSS transition time
    });
    li.appendChild(deleteBtn);

    li.addEventListener("click", () => toggleTask(task.id, li));
    li.addEventListener("keydown", (e) => {
        if (e.target !== li) return;
        if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            toggleTask(task.id, li);
        }
    });
    li.addEventListener("mouseenter", () => showTooltip(li));
    li.addEventListener("mouseleave", hideTooltip);

    return li;
}

function render() {
    const visible = tasks.filter((t) => {
        if (filter === "completed") return t.done;
        if (filter === "pending") return !t.done;
        return true;
    });

    taskList.innerHTML = "";
    visible.forEach((task) => taskList.appendChild(createItem(task)));
    newId = null;

    if (visible.length === 0) {
        emptyState.textContent =
            tasks.length === 0
                ? "Nothing here yet. Add your first task above."
                : filter === "completed"
                ? "No completed tasks yet."
                : "All caught up. No pending tasks.";
        emptyState.hidden = false;
    } else {
        emptyState.hidden = true;
    }

    updateMeta();
}

function updateMeta() {
    const left = tasks.filter((t) => !t.done).length;
    counter.textContent = tasks.length
        ? `${left} of ${tasks.length} task${tasks.length === 1 ? "" : "s"} left`
        : "";
    clearBtn.disabled = !tasks.some((t) => t.done);
}

/* ---------- Actions ---------- */
function showMessage(text) {
    message.textContent = text;
}

function addTask() {
    const text = taskInput.value.trim();

    if (text === "") {
        showMessage("Please enter a task.");
        taskInput.focus();
        return;
    }

    showMessage("");
    const task = { id: Date.now(), text, done: false };
    tasks.push(task);
    newId = task.id;
    saveTasks();

    // Make sure the new task is visible even if a filter hides it
    if (filter === "completed") setFilter("all");
    else render();

    taskInput.value = "";
    taskInput.focus();
}

function toggleTask(id, li) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    task.done = !task.done;
    saveTasks();

    if (filter === "all") {
        // update in place so the hover tooltip stays correct
        li.classList.toggle("completed", task.done);
        li.setAttribute("aria-checked", String(task.done));
        showTooltip(li);
        updateMeta();
    } else {
        render();
    }
}

function setFilter(next) {
    filter = next;
    filterBtns.forEach((btn) => {
        const active = btn.dataset.filter === next;
        btn.classList.toggle("active", active);
        btn.setAttribute("aria-pressed", String(active));
    });
    render();
}

/* ---------- Events ---------- */
taskForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Enter key and Add button both land here
    addTask();
});

taskInput.addEventListener("input", () => showMessage(""));

filterBtns.forEach((btn) =>
    btn.addEventListener("click", () => setFilter(btn.dataset.filter))
);

clearBtn.addEventListener("click", () => {
    tasks = tasks.filter((t) => !t.done);
    saveTasks();
    render();
});

/* ---------- Theme toggle (normal -> light -> dark) ---------- */
const themeToggle = document.getElementById("themeToggle");
const icon = themeToggle.querySelector("i");
const THEMES = [
    { className: "", icon: "fas fa-adjust" },
    { className: "light-mode", icon: "fas fa-sun" },
    { className: "dark-mode", icon: "fas fa-moon" },
];

let themeState = 0;
try {
    const savedTheme = Number(localStorage.getItem(THEME_KEY));
    if (savedTheme >= 0 && savedTheme < THEMES.length) themeState = savedTheme;
} catch {
    /* ignore */
}

function applyTheme() {
    document.body.classList.remove("light-mode", "dark-mode");
    if (THEMES[themeState].className) {
        document.body.classList.add(THEMES[themeState].className);
    }
    icon.className = THEMES[themeState].icon;
}

themeToggle.addEventListener("click", () => {
    themeState = (themeState + 1) % THEMES.length;
    applyTheme();
    try {
        localStorage.setItem(THEME_KEY, String(themeState));
    } catch {
        /* ignore */
    }
});

/* ---------- Start ---------- */
applyTheme();
setFilter("all");
