// Dark mode ON by default
document.addEventListener("DOMContentLoaded", function () {
    document.body.classList.add("dark-mode");
});

const backendBaseURL = 'http://localhost:3001';

const modelNicknames = {
    "gpt-4o": "GPT-4.1",
    "gpt-4-turbo": "GPT-4 Turbo",
    "gpt-4": "GPT-4 Legacy",
    "gpt-3.5-turbo": "GPT-3.5 Turbo"
};

const chatgptModels = [
    { value: "gpt-4o", label: "GPT-4.1 (gpt-4o) [default]" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo (gpt-4-turbo)" },
    { value: "gpt-4", label: "GPT-4 Legacy (gpt-4)" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (gpt-3.5-turbo)" }
];

const templates = {
    shell: ["ls", "dir", "echo 'Hello World'"],
    python: ["print('Hello from Python!')"],
    read: ["ai-interface/index.html", "file outputs/output.txt"],
    write: [`{
  "filename": "file outputs/test.md",
  "content": "## Example Markdown\\nHello world!"
}`],
    upload: [],
    json: [`{
  "type": "shell",
  "command": "ls"
}`,
`{
  "type": "python",
  "command": "print('Hello from JSON Python!')"
}`]
};

window.addEventListener('DOMContentLoaded', () => {
    // Model selector setup
    const modelSelect = document.getElementById('chatgptModel');
    chatgptModels.forEach(m => {
        let opt = document.createElement("option");
        opt.value = m.value;
        opt.textContent = m.label;
        modelSelect.appendChild(opt);
    });
    modelSelect.value = "gpt-4o";
    document.getElementById('chatgptModelNickname').textContent = modelNicknames[modelSelect.value];
    modelSelect.onchange = () => {
        document.getElementById('chatgptModelNickname').textContent = modelNicknames[modelSelect.value] || "";
    };

    // Action type template example buttons
    function showTemplates() {
        const action = document.getElementById("actionType").value;
        const area = document.getElementById("templates");
        area.innerHTML = "";
        (templates[action] || []).forEach(t => {
            let btn = document.createElement("button");
            btn.innerText = "Insert Example";
            btn.type = "button";
            btn.onclick = () => { document.getElementById("inputBox").value = t; checkFileExistsUI(); };
            area.appendChild(btn);
        });

        // Show/hide file browser for Read/Write
        document.getElementById("browseFileBtn").style.display =
            (action === "read" || action === "write") ? "" : "none";
        // Show/hide existence indicator
        document.getElementById("fileExistsIndicator").style.display =
            (action === "read" || action === "write") ? "" : "none";
        // Show/hide upload section
        document.getElementById("uploadSection").style.display =
            (action === "upload") ? "" : "none";
        // Hide warning by default
        document.getElementById("pathWarning").style.display = "none";
    }
    showTemplates();
    document.getElementById("actionType").onchange = () => { showTemplates(); checkFileExistsUI(); };

    // File browse function for read/write
    document.getElementById("browseFileBtn").onclick = function() {
        document.getElementById("fileInput").value = "";
        document.getElementById("fileInput").click();
    };
    document.getElementById("fileInput").onchange = function(e) {
        const action = document.getElementById("actionType").value;
        if (!this.files.length) return;
        if (action === "read") {
            document.getElementById("inputBox").value = this.files[0].name;
            showToast("Note: In browser, backend will only see files in its local directory. Use Upload for browser → backend transfer.");
            checkFileExistsUI();
        }
        if (action === "write") {
            const tpl = {
                filename: this.files[0].name,
                content: ""
            };
            document.getElementById("inputBox").value = JSON.stringify(tpl, null, 2);
            showToast("Template for write file inserted.");
            checkFileExistsUI();
        }
    };

    // File existence check on typing/paste for Read/Write
    document.getElementById("inputBox").addEventListener("input", checkFileExistsUI);

    // Upload Section
    document.getElementById("uploadBtn").onclick = handleUpload;
    document.getElementById("uploadDestPath").oninput = function() {
        checkPathWarning(this.value);
    };

    // All control buttons
    document.getElementById('submitBtn').onclick = submitToRunner;
    document.getElementById('clearInputBtn').onclick = () => { document.getElementById("inputBox").value = ""; checkFileExistsUI(); };
    document.getElementById('clearOutputBtn').onclick = () => { document.getElementById("outputBox").value = ""; };
    document.getElementById('helpBtn').onclick = () => { window.open("operators-manual.md", "_blank"); };
    document.getElementById('testFirebaseBtn').onclick = () => fetchStatusBar(true, "firebase");
    document.getElementById('testGitHubBtn').onclick = () => fetchStatusBar(true, "github");
    document.getElementById('testVercelBtn').onclick = () => fetchStatusBar(true, "vercel");
    document.getElementById('copyOutputBtn').onclick = function () {
        const t = document.getElementById("outputBox").value;
        navigator.clipboard.writeText(t);
        showToast("Output copied!");
    };
    document.getElementById('saveOutputBtn').onclick = function () {
        const t = document.getElementById("outputBox").value;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([t], {type: "text/plain"}));
        a.download = "output.txt";
        a.click();
    };
    document.getElementById('sendOutputToChatGPTBtn').onclick = function() {
        document.getElementById('chatgptPrompt').value = document.getElementById('outputBox').value;
    };

    // ChatGPT controls
    document.getElementById('askChatGPTBtn').onclick = askChatGPT;
    document.getElementById('clearChatGPTInputBtn').onclick = function () {
        document.getElementById('chatgptPrompt').value = "";
    };
    document.getElementById('clearChatGPTOutputBtn').onclick = function () {
        document.getElementById('chatgptResponse').value = "";
    };
    document.getElementById('sendChatGPTToRunnerBtn').onclick = function () {
        document.getElementById('inputBox').value = document.getElementById('chatgptResponse').value;
    };
    document.getElementById('testChatGPTBtn').onclick = function () {
        document.getElementById('chatgptResponse').value = "✅ ChatGPT test simulated.";
    };

    fetchStatusBar();
    setInterval(fetchStatusBar, 30000);
});

// --- File Existence Check ---
function checkFileExistsUI() {
    const action = document.getElementById("actionType").value;
    const fileExistsEl = document.getElementById("fileExistsIndicator");
    let path = document.getElementById("inputBox").value.trim();
    if (!(action === "read" || action === "write")) {
        fileExistsEl.style.display = "none";
        return;
    }
    if (!path) {
        fileExistsEl.textContent = "";
        return;
    }
    checkPathWarning(path);
    // Simulate with always "?"
    fileExistsEl.innerHTML = `<span style="color:gray;font-size:1.2em;" title="Unknown">?</span>`;
}

// --- Warn if path looks dangerous (absolute or outside project) ---
function checkPathWarning(path) {
    const warningEl = document.getElementById("pathWarning");
    if (/^([A-Za-z]:\\|\/)/.test(path) || path.includes("..")) {
        warningEl.textContent = "Warning: Absolute or parent paths may be dangerous. Proceed with caution!";
        warningEl.style.display = "block";
    } else {
        warningEl.style.display = "none";
    }
}

// --- Upload File (simulated logic) ---
function handleUpload() {
    const fileInput = document.getElementById("uploadFileInput");
    const destPath = document.getElementById("uploadDestPath").value.trim();
    const status = document.getElementById("uploadStatus");
    if (!fileInput.files.length) {
        status.textContent = "Select a file first!";
        status.style.color = "red";
        return;
    }
    if (!destPath) {
        status.textContent = "Enter destination path!";
        status.style.color = "red";
        return;
    }
    checkPathWarning(destPath);
    status.textContent = "Uploading (simulated)...";
    status.style.color = "orange";
    setTimeout(() => {
        status.textContent = "Upload successful! (simulated)";
        status.style.color = "green";
    }, 900);
}

// --- Output/History ---
function submitToRunner() {
    const val = document.getElementById("inputBox").value;
    document.getElementById("outputBox").value = `[Runner] ${val}`;
    updateHistory(`[${new Date().toLocaleTimeString()}] ${val}`);
    showToast("Runner executed.");
}
let historyArr = [];
function updateHistory(entry) {
    historyArr.unshift(entry);
    if (historyArr.length > 5) historyArr.pop();
    const histList = document.getElementById('historyList');
    if (!histList) return;
    histList.innerHTML = "";
    historyArr.forEach((h, i) => {
        let item = document.createElement("li");
        item.innerText = h;
        histList.appendChild(item);
    });
}

// --- Status Bar ---
function fetchStatusBar(force, which) {
    // Simulate: always green for demo (replace with real AJAX if backend active)
    let bar = document.getElementById('statusbar');
    bar.innerHTML = `<span class='status-ok'>Firebase ✓</span> <span class='status-ok'>GitHub ✓</span> <span class='status-ok'>Vercel ✓</span>`;
    bar.style.color = "#17ff7f";
}

// --- ChatGPT ---
function askChatGPT() {
    // Protocol: explicit error if API key is missing
    const fakeKey = ""; // Set "" to simulate missing key
    if (!fakeKey) {
        document.getElementById('chatgptResponse').value =
            "❌ OpenAI API key not inserted. Please insert your API key in the `.env` file to activate cloud LLM features.";
        showToast("ChatGPT error: API key missing.", true);
        return;
    }
    // Simulate LLM reply
    const q = document.getElementById('chatgptPrompt').value;
    document.getElementById('chatgptResponse').value = `[GPT-4.1] Simulated: ${q}`;
    showToast("ChatGPT answered.");
}

function showToast(msg, error) {
    let el = document.getElementById("toast");
    el.innerText = msg;
    el.className = "toast show" + (error ? " error" : "");
    setTimeout(() => { el.className = "toast"; }, 2600);
}
