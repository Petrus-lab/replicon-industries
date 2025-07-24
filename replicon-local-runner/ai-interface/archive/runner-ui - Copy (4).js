const backendBaseURL = 'http://localhost:3001';

async function fetchStatus() {
    try {
        const response = await fetch(`${backendBaseURL}/status`);
        const data = await response.json();
        updateStatusBar(data);
    } catch (error) {
        console.error('Error fetching status:', error);
        setStatusBarError();
    }
}

function updateStatusBar(data) {
    const statusBar = document.querySelector('#statusBar');
    let statusHTML = '';
    statusHTML += data.firebase ? "| <span style='color:lime'>Firebase ✅</span> " : "| <span style='color:red'>Firebase ❌</span> ";
    statusHTML += data.github ? "| <span style='color:lime'>GitHub ✅</span> " : "| <span style='color:red'>GitHub ❌</span> ";
    statusHTML += data.vercel ? "| <span style='color:lime'>Vercel ✅</span> " : "| <span style='color:red'>Vercel ❌</span> ";
    statusBar.innerHTML = statusHTML;
}

function setStatusBarError() {
    const statusBar = document.querySelector('#statusBar');
    statusBar.innerHTML = "<span style='color:red'>Error fetching integration status</span>";
}

function getTimestamp(label) {
    return `[${new Date().toLocaleString()}] ${label}`;
}

function prependOutput(text) {
    const outputBox = document.querySelector('#outputBox');
    let currentEntries = outputBox.value.trim().split("\n\n").filter(e => e);
    currentEntries.unshift(text);
    if (currentEntries.length > 10) currentEntries = currentEntries.slice(0, 10); // 🔥 Keep last 10 entries
    outputBox.value = currentEntries.join("\n\n") + "\n\n";
    outputBox.scrollTop = 0; // ✨ Auto-scroll to top for new entry
}

async function testPlatform(api, emoji, label) {
    const startTime = getTimestamp(`⏱ ${label} Test Started`);
    prependOutput(`${startTime}`);
    try {
        const response = await fetch(`${backendBaseURL}/${api}`);
        const text = await response.text();
        const endTime = getTimestamp(`✅ ${label} Test Completed`);
        prependOutput(`${startTime}\n${emoji} ${label} Response:\n${text}\n${endTime}`);
    } catch (err) {
        const endTime = getTimestamp(`❌ ${label} Test Failed`);
        prependOutput(`${startTime}\n❌ ${label} Error: ${err.message}\n${endTime}`);
    }
}

function testFirebase() {
    testPlatform('testFirebase', '🔥', 'Firebase');
}

function testGitHub() {
    testPlatform('testGitHub', '🐱', 'GitHub');
}

function testVercel() {
    testPlatform('testVercel', '⚡', 'Vercel');
}

function saveOutput() {
    const outputBox = document.querySelector('#outputBox');
    const blob = new Blob([outputBox.value], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Replicon-Output-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
}

function copyOutput() {
    const outputBox = document.querySelector('#outputBox');
    navigator.clipboard.writeText(outputBox.value)
        .then(() => alert('📋 Output copied to clipboard'))
        .catch(err => alert('❌ Failed to copy: ' + err));
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#testFirebaseBtn').addEventListener('click', testFirebase);
    document.querySelector('#testGitHubBtn').addEventListener('click', testGitHub);
    document.querySelector('#testVercelBtn').addEventListener('click', testVercel);
    document.querySelector('#saveOutputBtn').addEventListener('click', saveOutput);
    document.querySelector('#copyOutputBtn').addEventListener('click', copyOutput);
    fetchStatus();
    setInterval(fetchStatus, 30000); // Refresh status every 30s
});
