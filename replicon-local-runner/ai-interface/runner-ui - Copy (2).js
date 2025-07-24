// [All prior logic preserved...]

const backendBaseURL = 'http://localhost:3001';

// ---- 1. Ensure dark mode is default on load ----
if (!document.body.classList.contains('dark-mode')) {
  document.body.classList.add('dark-mode');
}

// ---- 2. Action Templates for each action type ----
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

// ---- 3. Show Templates ----
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
}

// ---- 4. Event Wiring on DOM Ready ----
window.addEventListener('DOMContentLoaded', () => {
  // Default: show templates for selected action
  showTemplates();
  document.getElementById("actionType").onchange = showTemplates;

  // Dark mode toggle
  document.getElementById('darkToggle').onclick = function() {
    document.body.classList.toggle('dark-mode');
  };

  // Button actions
  document.getElementById('submitBtn').onclick = submitToRunner;
  document.getElementById('clearInputBtn').onclick = clearInput;
  document.getElementById('clearOutputBtn').onclick = clearOutput;
  document.getElementById('helpBtn').onclick = openHelp;
  document.getElementById('testFirebaseBtn').onclick = () => runTest('firebase', 'Firebase');
  document.getElementById('testGitHubBtn').onclick = () => runTest('github', 'GitHub');
  document.getElementById('testVercelBtn').onclick = () => runTest('vercel', 'Vercel');
  document.getElementById('copyOutputBtn').onclick = copyOutput;
  document.getElementById('saveOutputBtn').onclick = saveOutputToFile;

  fetchStatusBar();
  setInterval(fetchStatusBar, 15000);

  // --- Ask ChatGPT integration ---
  document.getElementById('askChatGPTBtn').onclick = async function() {
    const prompt = document.getElementById('chatgptPrompt').value.trim();
    if (!prompt) return showToast("Enter a question for ChatGPT.");
    document.getElementById('chatgptResponse').value = "⏳ Asking ChatGPT...";
    fetch('http://localhost:3001/ask-chatgpt', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
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

// ---- 5. Status Bar Handling ----
async function fetchStatusBar() {
  let res;
  try {
    res = await fetch(`${backendBaseURL}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "test_all_integrations", targets: ["firebase", "github", "vercel"] })
    });
    let data = await res.json();
    let html = "";
    html += /✅\s*Firebase/i.test(data.output) ? `<span class='status-ok'>Firebase ✓</span>` : `<span class='status-missing'>Firebase ✗</span>`;
    html += /✅\s*GitHub/i.test(data.output) ? `<span class='status-ok'>GitHub ✓</span>` : `<span class='status-missing'>GitHub ✗</span>`;
    html += /✅\s*Vercel/i.test(data.output) ? `<span class='status-ok'>Vercel ✓</span>` : `<span class='status-missing'>Vercel ✗</span>`;
    document.getElementById("statusbar").innerHTML = html;
  } catch (e) {
    document.getElementById("statusbar").innerHTML = "<span style='color:red'>Status: Error fetching integrations</span>";
  }
}

// ---- 6. Submit & Spinner ----
function submitToRunner() {
  const action = document.getElementById("actionType").value;
  const input = document.getElementById("inputBox").value.trim();
  let payload = { action };

  if (["shell", "python"].includes(action)) {
    if (!confirm("Are you sure you want to run this " + action + " code?")) return;
  }

  switch (action) {
    case "shell":
    case "python":
      payload.inputData = input;
      break;
    case "read":
      payload.targetPath = input;
      break;
    case "write":
      try { JSON.parse(input); payload.inputData = input; }
      catch (e) { showToast("Write File input must be valid JSON."); return; }
      break;
    case "json":
      try { JSON.parse(input); payload.raw = input; }
      catch (e) { showToast("Run JSON input must be valid JSON."); return; }
      break;
    default:
      payload.inputData = input;
  }

  showSpinner(true);
  fetch(`${backendBaseURL}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(response => response.json())
  .then(data => {
    document.getElementById("outputBox").value = data.output;
    renderOutput(data.output);
    pushHistory(input, data.output);
    showToast("Done!");
    showSpinner(false);
  })
  .catch(error => {
    document.getElementById("outputBox").value = "❌ Error: " + error;
    renderOutput("❌ Error: " + error);
    showToast("Failed: " + error, true);
    showSpinner(false);
  });
}

// ---- 7. Render Output (JSON, Markdown, Plain) ----
function renderOutput(output) {
  const el = document.getElementById("outputRender");
  if (!output) { el.innerHTML = ""; return; }
  try {
    let asObj = JSON.parse(output);
    el.innerHTML = "<pre>" + JSON.stringify(asObj, null, 2) + "</pre>";
    return;
  } catch(e){}
  if (/^#{1,6} /.test(output) || /\*\*/.test(output)) {
    // Simple markdown (optional: add 'marked' if desired)
    el.innerHTML = output.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>").replace(/^# (.*)$/gm, "<h1>$1</h1>");
    return;
  }
  el.innerHTML = "<pre>" + output.replace(/</g,"&lt;").replace(/>/g,"&gt;") + "</pre>";
}

// ---- 8. Clear Input/Output ----
function clearInput() { document.getElementById("inputBox").value = ""; }
function clearOutput() { document.getElementById("outputBox").value = ""; document.getElementById("outputRender").innerHTML = ""; }

// ---- 9. History Handling ----
let history = [];
function pushHistory(input, output) {
  history.unshift({ input, output, time: new Date().toLocaleTimeString() });
  if (history.length > 5) history.pop();
  updateHistoryView();
}
function updateHistoryView() {
  let list = document.getElementById("historyList");
  list.innerHTML = "";
  history.forEach((h, i) => {
    let item = document.createElement("li");
    item.innerHTML = `[${h.time}] <code>${h.input.replace(/</g,"&lt;").replace(/>/g,"&gt;").slice(0, 40)}${h.input.length>40?'...':''}</code>`;
    item.onclick = () => {
      document.getElementById("inputBox").value = h.input;
      document.getElementById("outputBox").value = h.output;
      renderOutput(h.output);
    };
    list.appendChild(item);
  });
}

// ---- 10. Spinner and Toast ----
function showSpinner(show) {
  document.getElementById("spinner").style.display = show ? "" : "none";
}
function showToast(msg, error) {
  let el = document.getElementById("toast");
  el.innerText = msg;
  el.className = "toast show" + (error ? " error" : "");
  setTimeout(() => { el.className = "toast"; }, 2600);
}

// ---- 11. Test Buttons (POST-based) ----
function runTest(type, label) {
  showSpinner(true);
  fetch(`${backendBaseURL}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "test_all_integrations", targets: [type.toLowerCase()] })
  })
  .then(response => response.json())
  .then(data => {
    document.getElementById("outputBox").value = data.output;
    renderOutput(data.output);
    pushHistory(`[TEST ${label}]`, data.output);
    showToast(`Integration tested: ${label}`);
    showSpinner(false);
    fetchStatusBar(); // Re-check status after test
  })
  .catch(error => {
    document.getElementById("outputBox").value = "❌ Error: " + error;
    renderOutput("❌ Error: " + error);
    showToast("Failed: " + error, true);
    showSpinner(false);
    fetchStatusBar();
  });
}

// ---- 12. Output Controls ----
function copyOutput() {
  const output = document.getElementById("outputBox").value;
  if (!output) { showToast("No output to copy!"); return; }
  navigator.clipboard.writeText(output).then(
    () => showToast("Output copied to clipboard!"),
    () => showToast("Failed to copy output.", true)
  );
}
function saveOutputToFile() {
  const output = document.getElementById("outputBox").value;
  if (!output) { showToast("No output to save!"); return; }
  let filename = prompt("Enter filename (e.g. output.txt or info.md):", "output.txt");
  if (!filename) return;
  if (!filename.startsWith("file outputs/")) filename = "file outputs/" + filename;
  const payload = {
    action: "write",
    inputData: JSON.stringify({ filename, content: output })
  };
  showSpinner(true);
  fetch(`${backendBaseURL}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(response => response.json())
  .then(data => { showToast(data.output); showSpinner(false); })
  .catch(error => { showToast("❌ Error saving output: " + error, true); showSpinner(false); });
}

// ---- 13. Help Handler: Opens the Operator's Manual ----
function openHelp() {
  window.open('operators-manual.md', '_blank');
}
