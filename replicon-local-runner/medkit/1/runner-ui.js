// FILE: runner-ui.js   GENERATED: 2025-07-19T19:58:00+02:00
// AI PRIME DIRECTIVES: FULL, PROTOCOL-LOCKED, NO SIDE-CHANGES

let backend = 'http://localhost:3001';

const examples = {
    shell: [
        { label: "echo (Win)", value: "echo Hello, Replicon!" },
        { label: "dir (Win)", value: "dir" },
        { label: "ls (Unix)", value: "ls" }
    ],
    python: [
        { label: "print", value: "print('Hello from Python!')" }
    ],
    read: [
        { label: "Example", value: "file outputs/output.txt" }
    ],
    write: [
        { label: "Example", value: JSON.stringify({ filename: "file outputs/test.md", content: "# Example Markdown\nhello world!" }, null, 2) }
    ],
    json: [
        { label: "Python", value: JSON.stringify({ type: "python", command: "print('Hello from JSON Python!')" }, null, 2) },
        { label: "Shell", value: JSON.stringify({ type: "shell", command: "dir" }, null, 2) }
    ]
};

function fillExamples() {
    let sel = document.getElementById('action-type').value;
    let exRow = document.getElementById('example-row');
    exRow.innerHTML = '';
    if (examples[sel]) {
        examples[sel].forEach(ex => {
            let btn = document.createElement('button');
            btn.innerText = ex.label;
            btn.onclick = () => document.getElementById('input').value = ex.value;
            exRow.appendChild(btn);
        });
    }
}

window.onload = function () {
    // Set up action type dropdown
    let actSel = document.getElementById('action-type');
    actSel.onchange = fillExamples;
    fillExamples();

    document.getElementById('submit').onclick = async function () {
        let action = document.getElementById('action-type').value;
        let input = document.getElementById('input').value;
        document.getElementById('output').value = "⏳ Working...";
        let payload = { action, inputData: input };
        let resp = await fetch(backend + '/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        let data = await resp.json();
        document.getElementById('output').value = data.output || "[No Output]";
        addHistory(action, input);
    };

    document.getElementById('clear-input').onclick = function () {
        document.getElementById('input').value = '';
    };
    document.getElementById('clear-output').onclick = function () {
        document.getElementById('output').value = '';
    };

    // Test backend status
    let offline = false;
    function checkStatus() {
        fetch(backend + '/status').then(r => r.json()).then(() => {
            offline = false;
            document.getElementById('offline').style.display = 'none';
        }).catch(() => {
            offline = true;
            document.getElementById('offline').style.display = '';
        });
    }
    setInterval(checkStatus, 30000);
    checkStatus();

    // History
    function addHistory(action, input) {
        let block = document.getElementById('history');
        let ent = document.createElement('div');
        ent.innerText = `[${(new Date()).toLocaleTimeString()}] ${action}: ${input}`;
        block.prepend(ent);
        while (block.childNodes.length > 5) block.removeChild(block.lastChild);
    }
};
