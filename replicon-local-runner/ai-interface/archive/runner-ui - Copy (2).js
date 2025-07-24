// ✅ FILE: replicon-local-runner/ai-interface/runner-ui.js
// ✅ Backend aligned to http://localhost:3001

document.addEventListener('DOMContentLoaded', () => {
  const backendBaseURL = "http://localhost:3001";

  const actionType = document.getElementById('actionType');
  const templatesContainer = document.getElementById('templates');
  const inputBox = document.getElementById('inputBox');
  const outputBox = document.getElementById('outputBox');
  const outputRender = document.getElementById('outputRender');
  const historyList = document.getElementById('historyList');
  const statusbar = document.getElementById('statusbar');
  const spinner = document.getElementById('spinner');
  const toast = document.getElementById('toast');

  const templates = {
    shell: ["echo Hello, Captain!", "dir", "ping 127.0.0.1"],
    python: ["print('Hello, Captain!')", "import os\nprint(os.listdir())"],
    read: ["C:\\replicon-industries\\platform-manual.md", "/etc/hosts"],
    write: [`{"filePath": "C:\\replicon-industries\\log.txt", "content": "Stardate Log"}`],
    json: [`{"action": "deploy", "target": "vercel", "options": {"project": "replicon-industries"}}`]
  };

  let history = [];

  function checkStatusBar() {
    statusbar.textContent = "Checking integrations...";
    Promise.all([
      fetch(`${backendBaseURL}/testFirebase`).then(r => r.json()).then(d => d.success ? "Firebase ✅" : "Firebase ❌"),
      fetch(`${backendBaseURL}/testGitHub`).then(r => r.json()).then(d => d.success ? "GitHub ✅" : "GitHub ❌"),
      fetch(`${backendBaseURL}/testVercel`).then(r => r.json()).then(d => d.success ? "Vercel ✅" : "Vercel ❌")
    ]).then(results => {
      statusbar.textContent = "Status: " + results.join(" | ");
    }).catch(() => {
      statusbar.textContent = "Status: Error fetching integration status";
    });
  }

  function showTemplates() {
    templatesContainer.innerHTML = "";
    const selected = actionType.value;
    if (templates[selected]) {
      templates[selected].forEach((example, i) => {
        const btn = document.createElement('button');
        btn.textContent = `Insert Example ${i + 1}`;
        btn.onclick = () => {
          inputBox.value = example;
          showToast(`📥 Inserted Example ${i + 1} for ${selected}`);
        };
        templatesContainer.appendChild(btn);
      });
    }
  }

  function submitToRunner() {
    const payload = inputBox.value.trim();
    if (!payload) {
      showToast("⚠️ No input provided.", true);
      return;
    }
    spinner.style.display = 'block';
    fetch(`${backendBaseURL}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: actionType.value, payload })
    })
    .then(res => res.json())
    .then(data => {
      appendOutput(JSON.stringify(data, null, 2));
      pushHistory(payload);
    })
    .catch(err => {
      appendOutput(`❌ Runner Error: ${err}`, true);
    })
    .finally(() => {
      spinner.style.display = 'none';
    });
  }

  function appendOutput(message, isError = false) {
    outputBox.value += (isError ? "❌ " : "✅ ") + message + "\n\n";
    renderOutput(message);
  }

  function renderOutput(content) {
    outputRender.innerHTML = `<pre>${content}</pre>`;
  }

  function pushHistory(entry) {
    history.unshift(entry);
    if (history.length > 5) history.pop();
    updateHistoryView();
  }

  function updateHistoryView() {
    historyList.innerHTML = "";
    history.forEach((item, i) => {
      const li = document.createElement('li');
      li.textContent = item;
      li.onclick = () => {
        inputBox.value = item;
        showToast(`📥 Restored from history item ${i + 1}`);
      };
      historyList.appendChild(li);
    });
  }

  function clearOutput() {
    outputBox.value = "";
    outputRender.innerHTML = "";
  }

  function showToast(msg, isError = false) {
    toast.textContent = msg;
    toast.style.backgroundColor = isError ? '#f44336' : '#4CAF50';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function toggleDarkMode() {
    document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', document.body.classList.contains('dark'));
  }

  // ✅ Expose dark mode toggle globally
  window.toggleDarkMode = toggleDarkMode;

  // Event Listeners
  document.getElementById('submitBtn').addEventListener('click', submitToRunner);
  document.getElementById('clearInputBtn').addEventListener('click', () => { inputBox.value = ""; });
  document.getElementById('clearOutputBtn').addEventListener('click', clearOutput);
  document.getElementById('helpBtn').addEventListener('click', () => {
    showToast("📖 Help is coming soon!");
  });
  document.getElementById('testFirebaseBtn').addEventListener('click', () => fetch(`${backendBaseURL}/testFirebase`));
  document.getElementById('testGitHubBtn').addEventListener('click', () => fetch(`${backendBaseURL}/testGitHub`));
  document.getElementById('testVercelBtn').addEventListener('click', () => fetch(`${backendBaseURL}/testVercel`));
  actionType.addEventListener('change', showTemplates);

  // Init
  if (localStorage.getItem('darkMode') === 'true') document.body.classList.add('dark');
  Object.keys(templates).forEach(k => {
    const option = document.createElement('option');
    option.value = k;
    option.textContent = k.charAt(0).toUpperCase() + k.slice(1);
    actionType.appendChild(option);
  });
  showTemplates();
  checkStatusBar();
  appendOutput("🖖 Gye UI Ready.");
});
