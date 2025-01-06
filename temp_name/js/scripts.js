function showParameterFields() {
    const taskType = document.getElementById("task-type").value;
    document.getElementById("css-parameters").classList.add("hidden");
    document.getElementById("regex-parameters").classList.add("hidden");

    if (taskType === "parse") {
        document.getElementById("css-parameters").classList.remove("hidden");
    } else if (taskType === "regex_parse") {
        document.getElementById("regex-parameters").classList.remove("hidden");
    }
}

function addCSSField() {
    const container = document.getElementById("css-parameter-fields");
    const newField = document.createElement("div");
    newField.className = "field-group";
    newField.innerHTML = `
        <input type="text" placeholder="Name" name="name">
        <input type="text" placeholder="CSS Selector" name="selector">
        <select name="attribute">
            <option value="text">Text</option>
            <option value="href">Href</option>
            <option value="src">Src</option>
            <option value="alt">Alt</option>
        </select>
        <label>
            <input type="checkbox" name="multiple"> Multiple
        </label>
    `;
    container.appendChild(newField);
}

function addRegexField() {
    const container = document.getElementById("regex-fields");
    const newField = document.createElement("div");
    newField.className = "field-group";
    newField.innerHTML = `<input type="text" placeholder="Enter regex pattern" name="regex_pattern">`;
    container.appendChild(newField);
}

async function submitTask() {
    const taskType = document.getElementById("task-type").value;
    const urls = document.getElementById("urls").value.split("\n").filter(url => url.trim());
    let parameters = {};

    if (taskType === "parse") {
        const fields = document.querySelectorAll("#css-parameter-fields .field-group");
        const elements = Array.from(fields).map(field => ({
            name: field.querySelector("input[name='name']").value,
            selector: field.querySelector("input[name='selector']").value,
            attribute: field.querySelector("select[name='attribute']").value,
            multiple: field.querySelector("input[name='multiple']").checked
        }));
        parameters.parse_parameters = { elements };
    } else if (taskType === "regex_parse") {
        const regexFields = document.querySelectorAll("#regex-fields input[name='regex_pattern']");
        const regexPatterns = Array.from(regexFields).map(input => input.value);
        parameters.regex_patterns = regexPatterns;
    }

    const response = await fetch("/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            task_type: taskType,
            parameters: { urls, ...parameters }
        })
    });

    const result = await response.json();
    alert(result.message);
    loadTasks();
}

async function loadTasks() {
    const response = await fetch("/tasks");
    const tasks = await response.json();
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = "";
    for (const [taskId, task] of Object.entries(tasks)) {
        const li = document.createElement("li");
        li.textContent = `Task ${taskId}: ${task.status}`;
        taskList.appendChild(li);
    }
}

// async function loadTasks() {
//     const response = await fetch('/tasks');
//     const tasks = await response.json();

//     const tasksList = document.getElementById('tasks-list');
//     tasksList.innerHTML = '';

//     for (const taskId in tasks) {
//         const task = tasks[taskId];
//         const li = document.createElement('li');
//         li.textContent = `Task ${task.task_id}: ${task.status}`;
//         tasksList.appendChild(li);
//     }
// }

async function loadTasks() {
    const response = await fetch('/tasks');
    const tasks = await response.json();

    const tasksList = document.getElementById('tasks-list');
    tasksList.innerHTML = '';

    for (const taskId in tasks) {
        const task = tasks[taskId];
        const li = document.createElement('li');
        li.innerHTML = `
            Task ${task.task_id}: ${task.status} 
            <button onclick="viewTaskDetails('${task.task_id}')">View Details</button>
        `;
        tasksList.appendChild(li);
    }
}

async function viewTaskDetails(taskId) {
    const response = await fetch(`/tasks/${taskId}`);
    if (response.ok) {
        const task = await response.json();
        const taskDetails = document.getElementById('task-details');
        const content = document.getElementById('task-details-content');
        
        content.textContent = JSON.stringify(task, null, 2);
        
        taskDetails.style.display = 'block';
    } else {
        alert('Task not found!');
    }
}

document.getElementById('close-details').addEventListener('click', () => {
    document.getElementById('task-details').style.display = 'none';
});

loadTasks();