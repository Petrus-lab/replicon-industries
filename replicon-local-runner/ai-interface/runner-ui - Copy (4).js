// ✅ FILE: ai-interface/runner-ui.js

const backendBaseURL = 'http://localhost:3001';

const modelNicknames = {
  "gpt-4o": "GPT-4.1",
  "gpt-4-turbo": "GPT-4 Turbo",
  "gpt-4": "GPT-4 Legacy",
  "gpt-3.5-turbo": "GPT-3.5 Turbo",
  "": ""
};

const chatgptModels = [
  { value: "gpt-4o", label: "GPT-4.1 (gpt-4o) [default]" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo (gpt-4-turbo)" },
  { value: "gpt-4", label: "GPT-4 Legacy (gpt-4)" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (gpt-3.5-turbo)" }
];

// Ensure dark mode is default on load
if (!document.body.classList.contains('dark-mode')) {
  document.body.classList.add('dark-mode');
}

const templates = {
  shell: ["ls", "dir", "echo 'Hello World'"],
  python: ["print('Hello from Python!')"],
  read: ["ai-interface/index.html", "file outputs/output.txt"],
  write: [`{
  "filename": "file outputs/test.md",
  "content": "## Example Markdown\\nHello world!"
}`],
  json: [`{
  "type": "shell",
  "command": "ls"
}`,
`{
  "type": "python",
  "command": "print('Hello from JSON Python!')"
}`]
};

function showTemplates() {
  const action = document.getElementById("actionType").value;
  const area = document.getElementById("templates");
  area.innerHTML = "";
  (templates[action] || []).forEach(t => {
    let btn = document.createElement("button");
    btn.innerText = "Insert Example";
    btn.type = "button";
    btn.onclick = () => { document.getElementById("inputBox").value = t; };
    area.appendChild(btn);
  });

  // Show/hide file browser for Read/Write
  document.getElementById("browseFileBtn").style.display =
    (action === "read" || action === "write") ? "" : "none";
}

window.addEventListener('DOMContentLoaded', () => {
  // Populate ChatGPT models dropdown with "GPT-4.1 (gpt-4o)" default
  const modelSelect = document.getElementById('chatgptModel');
  chatgptModels.forEach(m => {
    let opt = document.createElement("option");
    opt.value = m.value;
    opt.textContent = m.label;
    modelSelect.appendChild(opt);
  });
  modelSelect.value = "gpt-4o";
  document.getElementById('chatgptModelNickname').textContent = modelNicknames[modelSelect.value] ? `(${modelNicknames[modelSelect.value]})` : "";

  modelSelect.onchange = () => {
    document.getElementById('chatgptModelNickname').textContent = modelNicknames[modelSelect.value] ? `(${modelNicknames[modelSelect.value]})` : "";
  };

  showTemplates();
  document.getElementById("actionType").onchange = showTemplates;

  // File Browse function for read/write
  const browseFileBtn = document.getElementById("browseFileBtn");
  const fileInput = document.getElementById("fileInput");
  browseFileBtn.onclick = function() {
    fileInput.value = "";
    fileInput.click();
  };
  fileInput.onchange = function(e) {
    const action = document.getElementById("actionType").value;
    if (!fileInput.files.length) return;
    if (action === "read") {
      // Insert file path (limited to browser environment, shows file name)
      document.getElementById("inputBox").value = fileInput.files[0].name;
      showToast("Note: In the browser, you may need to specify the full path manually for local backend access.");
    }
    if (action === "write") {
      // Fill JSON template with filename and empty content
      const tpl = {
        filename: fileInput.files[0].name,
        content: ""
      };
      document.getElementById("inputBox").value = JSON.stringify(tpl, null, 2);
      showToast("Template for write file inserted.");
    }
  };

  // Dark mode toggle
  document.getElementById('darkToggle').onclick = function() {
    document.body.classList.toggle('dark-mode');
  };

  // Runner (local) buttons
  document.getElementById('submitBtn').onclick = submitToRunner;
  document.getElementById('clearInputBtn').onclick = clearInput;
  document.getElementById('clearOutputBtn').onclick = clearOutput;
  document.getElementById('helpBtn').onclick = openHelp;
  document.getElementById('testFirebaseBtn').onclick = () => runTest('firebase', 'Firebase');
  document.getElementById('testGitHubBtn').onclick = () => runTest('github', 'GitHub');
  document.getElementById('testVercelBtn').onclick = () => runTest('vercel', 'Vercel');
  document.getElementById('copyOutputBtn').onclick = copyOutput;
  document.getElementById('saveOutputBtn').onclick = saveOutputToFile;
  document.getElementById('sendOutputToChatGPTBtn').onclick = function() {
    const output = document.getElementById('outputBox').value;
    if (!output) return showToast("No output to send!");
    document.getElementById('chatgptPrompt').value = output;
    showToast("Output copied to ChatGPT input. Review/edit before sending.");
  };
  document.getElementById('sendChatGPTToRunnerBtn').onclick = function() {
    const gptOutput = document.getElementById('chatgptResponse').value;
    if (!gptOutput) return showToast("No GPT output to send!");
    document.getElementById('inputBox').value = gptOutput;
    showToast("ChatGPT output sent to Runner input. Review/edit before submitting.");
  };
  document.getElementById('testChatGPTBtn').onclick = testChatGPTConnectivity;

  fetchStatusBar();
  setInterval(fetchStatusBar, 15000);

  // Ask ChatGPT integration
  document.getElementById('askChatGPTBtn').onclick = async function() {
    const prompt = document.getElementById('chatgptPrompt').value.trim();
    const model = document.getElementById('chatgptModel').value;
    if (!prompt) return showToast("Enter a question for ChatGPT.");
    document.getElementById('chatgptResponse').value = "⏳ Asking ChatGPT...";
    fetch('http://localhost:3001/ask-chatgpt', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, model })
    })
      .then(r => r.json())
      .then(data => {
        document.getElementById('chatgptResponse').value = data.output;
        showToast("ChatGPT answered.");
      })
      .catch(e => {
        document.getElementById('chatgptResponse').value = "❌ Error: " + e.message;
        showToast("ChatGPT error", true);
      });
  };
});

function testChatGPTConnectivity() {
  const model = document.getElementById('chatgptModel').value || "gpt-4o";
  document.getElementById('chatgptResponse').value = "⏳ Testing ChatGPT connectivity...";
  fetch('http://localhost:3001/ask-chatgpt', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "ping", model })
  })
    .then(r => r.json())
    .then(data => {
      document.getElementById('chatgptResponse').value = data.output;
      if (data.output && data.output.startsWith('❌')) {
        showToast("ChatGPT cloud NOT available!", true);
      } else {
        showToast("ChatGPT cloud is working.");
      }
    })
    .catch(e => {
      document.getElementById('chatgptResponse').value = "❌ Error: " + e.message;
      showToast("ChatGPT error", true);
    });
}

// --- Core Runner Logic Functions ---
function submitToRunner() {
  const actionType = document.getElementById('actionType').value;
  let input = document.getElementById('inputBox').value;
  let data = { action: actionType };
  if (actionType === "read") data.targetPath = input.trim();
  else if (actionType === "write") data.inputData = input.trim();
  else if (actionType === "json") data.raw = input.trim();
  else data.inputData = input.trim();

  document.getElementById('spinner').style.display = "block";
  fetch(`${backendBaseURL}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then(r => r.json())
    .then(res => {
      document.getElementById('outputBox').value = res.output || "";
      updateHistory(actionType, input, res.output || "");
      document.getElementById('spinner').style.display = "none";
    })
    .catch(e => {
      document.getElementById('outputBox').value = "❌ Error: " + e.message;
      document.getElementById('spinner').style.display = "none";
    });
}

function clearInput() {
  document.getElementById('inputBox').value = "";
}

function clearOutput() {
  document.getElementById('outputBox').value = "";
}

function openHelp() {
  window.open("operators-manual.md", "_blank");
}

function runTest(target, display) {
  document.getElementById('outputBox').value = `Testing ${display}...`;
  fetch(`${backendBaseURL}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "test_all_integrations", targets: [target] })
  })
    .then(r => r.json())
    .then(res => {
      document.getElementById('outputBox').value = res.output || "";
      updateHistory(`[TEST ${display}]`, "", res.output || "");
    })
    .catch(e => {
      document.getElementById('outputBox').value = "❌ Error: " + e.message;
    });
}

function copyOutput() {
  const output = document.getElementById('outputBox').value;
  if (output) {
    navigator.clipboard.writeText(output);
    showToast("Output copied!");
  } else {
    showToast("Nothing to copy!");
  }
}

function saveOutputToFile() {
  const data = document.getElementById('outputBox').value;
  const blob = new Blob([data], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = window.URL.createObjectURL(blob);
  a.download = "runner-output.txt";
  a.click();
  showToast("Output file saved.");
}

function fetchStatusBar() {
  fetch(`${backendBaseURL}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "test_all_integrations", targets: ["firebase", "github", "vercel"] })
  })
    .then(r => r.json())
    .then(data => {
      let html = "";
      html += /✅\s*Firebase/i.test(data.output) ? `<span class='status-ok'>Firebase ✓</span>` : `<span class='status-missing'>Firebase ✗</span>`;
      html += /✅\s*GitHub/i.test(data.output) ? `<span class='status-ok'>GitHub ✓</span>` : `<span class='status-missing'>GitHub ✗</span>`;
      html += /✅\s*Vercel/i.test(data.output) ? `<span class='status-ok'>Vercel ✓</span>` : `<span class='status-missing'>Vercel ✗</span>`;
      document.getElementById("statusbar").innerHTML = html;
    })
    .catch(() => {
      document.getElementById("statusbar").innerHTML = "<span style='color:red'>Status: Error fetching integrations</span>";
    });
}

// --- History Handling (unchanged) ---
let historyArr = [];
function updateHistory(action, input, output) {
  historyArr.unshift({ action, input, output, time: new Date().toLocaleTimeString() });
  if (historyArr.length > 5) historyArr.pop();
  const histList = document.getElementById('historyList');
  histList.innerHTML = "";
  historyArr.forEach((h, i) => {
    let item = document.createElement("li");
    item.innerHTML = `[${h.time}] <code>${h.action}</code>: ${h.input.slice(0,40)}${h.input.length>40?'...':''}`;
    item.onclick = () => {
      document.getElementById("inputBox").value = h.input;
      document.getElementById("outputBox").value = h.output;
    };
    histList.appendChild(item);
  });
}

function showToast(msg, error) {
  let el = document.getElementById("toast");
  el.innerText = msg;
  el.className = "toast show" + (error ? " error" : "");
  setTimeout(() => { el.className = "toast"; }, 2600);
}
