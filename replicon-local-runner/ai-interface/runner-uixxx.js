// ----- DARK MODE: Default On -----
document.addEventListener("DOMContentLoaded", function () {
    document.body.classList.add("dark-mode");
    document.getElementById("darkModeToggle").checked = true;
});
document.getElementById("darkModeToggle").addEventListener("change", function () {
    document.body.classList.toggle("dark-mode", this.checked);
});

// --------- GLOBALS ---------
let actionType = "Run Shell Command";
let history = [];
let localOutput = "";
let gptOutput = "";
let gptModels = [
    { id: "gpt-4o", label: "GPT-4.1 (gpt-4o) [default]", nick: "GPT-4.1" },
    { id: "gpt-4-turbo", label: "GPT-4 Turbo", nick: "Turbo" },
    { id: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", nick: "3.5" }
];
let gptSelectedModel = gptModels[0].id;
let openAIApiKey = null;

// --------- INIT ----------
window.onload = function () {
    // Action type selection
    const actionTypeEl = document.getElementById("actionType");
    actionTypeEl.value = actionType;
    actionTypeEl.onchange = function () {
        actionType = this.value;
        updateExampleButtons();
        updateFileBrowse();
        updateHistory();
    };

    // Model dropdown
    const modelEl = document.getElementById("gptModelSelect");
    if (modelEl) {
        modelEl.innerHTML = "";
        gptModels.forEach(model => {
            let opt = document.createElement("option");
            opt.value = model.id;
            opt.innerText = model.label;
            if (model.id === gptSelectedModel) opt.selected = true;
            modelEl.appendChild(opt);
        });
        modelEl.onchange = function () {
            gptSelectedModel = this.value;
        };
    }

    updateExampleButtons();
    updateFileBrowse();
    updateHistory();
};

// --------- EXAMPLES ----------
function updateExampleButtons() {
    const examplesRow = document.getElementById("exampleButtons");
    if (!examplesRow) return;
    let html = "";
    switch (actionType) {
        case "Run Shell Command":
            html = `<button class="example-btn" onclick="insertExample('dir')">dir</button>
                    <button class="example-btn" onclick="insertExample('ls -la')">ls -la</button>
                    <button class="example-btn" onclick="insertExample('echo Hello World')">echo Hello World</button>`;
            break;
        case "Read File":
            html = `<button class="example-btn" onclick="insertExample('operators-manual.md')">operators-manual.md</button>
                    <button class="example-btn" onclick="insertExample('ai-interface/runner-ui.js')">runner-ui.js</button>`;
            break;
        case "Write File":
            html = `<button class="example-btn" onclick="insertExample(JSON.stringify({filename: 'file outputs/test.md', content: '# Example Markdown\\nhello world!'}, null, 2))">test.md</button>`;
            break;
        case "Run Python":
            html = `<button class="example-btn" onclick="insertExample('print(\\'Hello from Python!\\')')">print("Hello from Python!")</button>`;
            break;
        case "Run JSON":
            html = `<button class="example-btn" onclick="insertExample('{\\"type\\": \\"python\\", \\"command\\": \\"print('Hello from JSON Python!')\\"}')">{ "type": "python", ... }</button>`;
            break;
        default:
            html = "";
    }
    examplesRow.innerHTML = html;
}
window.insertExample = function (val) {
    document.getElementById("inputBox").value = val;
};

// --------- FILE BROWSE / UPLOAD / SAVE-AS ----------
function updateFileBrowse() {
    const browseBtn = document.getElementById("fileBrowseBtn");
    const uploadBtn = document.getElementById("fileUploadBtn");
    if (!browseBtn || !uploadBtn) return;

    // Show browse for Read/Write
    browseBtn.style.display = (actionType === "Read File" || actionType === "Write File") ? "inline-block" : "none";
    uploadBtn.style.display = (actionType === "Read File") ? "inline-block" : "none";
}
window.browseFile = function () {
    // Use native file picker, then put path in box
    const inputBox = document.getElementById("inputBox");
    const fileEl = document.createElement("input");
    fileEl.type = "file";
    if (actionType === "Read File") fileEl.webkitdirectory = false;
    fileEl.onchange = function (e) {
        if (fileEl.files.length) {
            let path = fileEl.files[0].path || fileEl.files[0].name;
            inputBox.value = path;
        }
    };
    fileEl.click();
};
window.saveAsFile = function () {
    // Use file picker to choose location for writing (Save As)
    const inputBox = document.getElementById("inputBox");
    // For browsers, Save As dialog can only be simulated with a download, so use fallback
    alert("Save-As dialog for writing is only possible in a desktop/Electron app. Please enter desired path in input or upload from a file.");
};

// --------- UPLOAD SUPPORT ----------
window.uploadFile = function () {
    const uploadEl = document.createElement("input");
    uploadEl.type = "file";
    uploadEl.onchange = function () {
        const file = uploadEl.files[0];
        const reader = new FileReader();
        reader.onload = function (evt) {
            // Send to backend with file name and content
            fetch("/upload", {
                method: "POST",
                headers: {},
                body: JSON.stringify({
                    filename: file.name,
                    content: evt.target.result,
                    targetDir: prompt("Enter target directory to upload to (eg. file outputs):", "file outputs")
                })
            }).then(r => r.json()).then(resp => {
                alert(resp.status || JSON.stringify(resp));
            });
        };
        reader.readAsText(file);
    };
    uploadEl.click();
};

// --------- MAIN SUBMIT ----------
window.submitToRunner = function () {
    const input = document.getElementById("inputBox").value.trim();
    if (!input) return;
    let body = {};
    if (actionType === "Run Shell Command") {
        body = { action: "shell", inputData: input };
    } else if (actionType === "Run Python") {
        body = { action: "python", inputData: input };
    } else if (actionType === "Read File") {
        body = { action: "read", inputData: input };
    } else if (actionType === "Write File") {
        try { body = { action: "write", ...JSON.parse(input) }; } catch {
            alert("Write File: Input must be valid JSON");
            return;
        }
    } else if (actionType === "Run JSON") {
        try { body = { action: "json", inputData: input }; } catch {
            alert("Run JSON: Input must be valid JSON");
            return;
        }
    }
    fetch("/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    }).then(r => r.json()).then(out => {
        localOutput = out.stdout || out.status || out.error || JSON.stringify(out, null, 2);
        updateLocalOutput();
        history.unshift({ t: new Date(), action: actionType, input });
        updateHistory();
    });
};

function updateLocalOutput() {
    document.getElementById("localOutputBox").value = localOutput || "";
}
function updateHistory() {
    const histEl = document.getElementById("historyList");
    if (!histEl) return;
    histEl.innerHTML = "";
    history.slice(0, 5).forEach(h => {
        let t = h.t.toLocaleTimeString();
        histEl.innerHTML += `<div>${t} | <b>${h.action}</b>: <code>${h.input}</code></div>`;
    });
}

// GPT Block (unchanged for this patch)
