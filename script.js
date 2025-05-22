const tooltip = document.getElementById("tooltip");

// Move tooltip with the mouse
document.addEventListener("mousemove", (e) => {
    tooltip.style.left = `${e.pageX + 10}px`;
    tooltip.style.top = `${e.pageY + 20}px`;
});

// Tooltip behavior
function showTooltip(e) {
    const li = e.currentTarget;
    tooltip.textContent = li.classList.contains("completed")
        ? "Task completed"
        : "Task not completed";
    tooltip.style.display = "block";
}

function hideTooltip() {
    tooltip.style.display = "none";
}

// Add task to list
function addTask() {
    const taskInput = document.getElementById("taskInput");
    const taskText = taskInput.value.trim();

    if (taskText === "") {
        alert("Please enter a task.");
        return;
    }

    const taskList = document.getElementById("taskList");
    const li = document.createElement("li");

    // Create span for task content
    const span = document.createElement("span");
    span.textContent = taskText;
    li.appendChild(span);

    // Create delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";
    deleteBtn.onclick = () => {
        li.classList.add("fade-out");
        setTimeout(() => taskList.removeChild(li), 300); // match transition time
    };
    
    li.appendChild(deleteBtn);

    // Toggle completed state on click
    li.addEventListener("click", () => {
        li.classList.toggle("completed");
    });

    // Tooltip listeners
    li.addEventListener("mouseenter", showTooltip);
    li.addEventListener("mouseleave", hideTooltip);

    // Add task to list
    taskList.appendChild(li);
    taskInput.value = "";
}

// Allow Enter key to add task
document.getElementById("taskInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        addTask();
    }
});


// Theme toggle
const themeToggle = document.getElementById("themeToggle");
const icon = themeToggle.querySelector("i");

let themeState = 0; // 0 = normal, 1 = light, 2 = dark

themeToggle.addEventListener("click", () => {
    document.body.classList.remove("light-mode", "dark-mode");

    themeState = (themeState + 1) % 3;

    if (themeState === 1) {
        document.body.classList.add("light-mode");
        icon.className = "fas fa-sun";
    } else if (themeState === 2) {
        document.body.classList.add("dark-mode");
        icon.className = "fas fa-moon";
    } else {
        icon.className = "fas fa-adjust"; // normal mode
    }
});
