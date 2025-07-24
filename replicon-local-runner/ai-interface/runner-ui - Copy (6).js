// FILE: runner-ui.js   GENERATED: 2025-07-18T16:09+02:00
// Matches: index - Copy (5).html COSMETICS/CONTROLS. Full protocol compliance.

"use strict";

document.addEventListener("DOMContentLoaded", function () {
  // --- UI Elements ---
  const actionTypeSelect = document.getElementById("actionType");
  const inputBox = document.getElementById("inputBox");
  const fileInput = document.getElementById("fileInput");
  const uploadButton = document.getElementById("uploadButton");
  const outputBox = document.getElementById("outputBox");
  const cloudOutputBox = document.getElementById("cloudOutputBox");
  const historyList = document.getElementById("historyList");
  const clearInputBtn = document.getElementById("clearInputBtn");
  const clearOutputBtn = document.getElementById("clearOutputBtn");
  const statusbar = document.getElementById("statusbar");
  const testShellBtn = document.getElementById("testShellBtn");
  const testPyBtn = document.getElementById("testPyBtn");
  const testJsonBtn = document.getElementById("testJsonBtn");
  const spinner = document.getElementById("spinner");
  const fileExistsIndicator = document.getElementById("fileExistsIndicator");
  const helpBtn = document.getElementById("helpBtn");
  const helpBlock = document.getElementById("helpBlock");
  const darkModeToggle = document.getElementById("darkModeToggle");

  // --- Theme: Dark mode default ---
  let darkMode = true;
  function setTheme(dark) {
    document.body.classList.toggle("dark-mode", dark);
    document.body.classList.toggle("light-mode", !dark);
  }
  setTheme(true);
  darkModeToggle.onclick = () => {
    darkMode = !darkMode;
    setTheme(darkMode);
  };

  // --- Action Type Change Handler ---
  actionTypeSelect.addEventListener("change", function () {
    const v = this.value;
    if (v === "upload") {
      fileInput.classList.remove("hidden");
      uploadButton.classList.remove("hidden");
      inputBox.style.display = "none";
    } else {
      fileInput.classList.add("hidden");
      uploadButton.classList.add("hidden");
      inputBox.style.display = "";
    }
    outputBox.value = "";
    fileExistsIndicator.innerText = "";
  });

  // --- File Existence Check (for read/write) ---
  inputBox.addEventListener("input", function () {
    const val = inputBox.value.trim();
    if (actionTypeSelect.value === "read" || actionTypeSelect.value === "write") {
      if (val.length > 0) {
        fetch(`/status?file=${encodeURIComponent(val)}`)
          .then(r => r.json())
          .then(data => {
            fileExistsIndicator.innerText = data.exists ? "✔️" : "❌";
          })
          .catch(() => { fileExistsIndicator.innerText = "?"; });
      } else {
        fileExistsIndicator.innerText = "";
      }
    } else {
      fileExistsIndicator.innerText = "";
    }
  });

  // --- Main "Submit" button handler (all except upload) ---
  document.getElementById("submitBtn").addEventListener("click", function () {
    const actionType = actionTypeSelect.value;
    const inputValue = inputBox.value;

    let payload = {
      action: actionType,
      inputData: inputValue
    };

    if (actionType === "write") {
      let [filename, ...contentParts] = inputValue.split("\n");
      payload.inputData = JSON.stringify({
        filename: filename.trim(),
        content: contentParts.join("\n")
      });
    }

    spinner.classList.remove("hidden");
    outputBox.value = "Working...";
    fetch("/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then((res) => res.json())
      .then((data) => {
        spinner.classList.add("hidden");
        if (data.output) {
          outputBox.value = typeof data.output === "object" ? JSON.stringify(data.output, null, 2) : data.output;
        } else if (data.error) {
          outputBox.value = data.error;
        } else {
          outputBox.value = "No output.";
        }
        if (historyList) {
          historyList.value += `\n[${actionType}] ${inputValue}\n${outputBox.value}\n`;
        }
      })
      .catch((err) => {
        spinner.classList.add("hidden");
        outputBox.value = err.message || "Unknown error";
      });
  });

  // --- Handle File Upload ---
  uploadButton.addEventListener("click", function () {
    const file = fileInput.files[0];
    if (!file) {
      outputBox.value = "No file selected.";
      return;
    }
    let formData = new FormData();
    formData.append("file", file);
    formData.append("destPath", file.name);

    spinner.classList.remove("hidden");
    outputBox.value = "Uploading...";
    fetch("/upload", {
      method: "POST",
      body: formData
    })
      .then((res) => res.json())
      .then((data) => {
        spinner.classList.add("hidden");
        if (data.output) {
          outputBox.value = data.output;
        } else if (data.error) {
          outputBox.value = data.error;
        } else {
          outputBox.value = "No output.";
        }
        if (historyList) {
          historyList.value += `\n[upload] ${file.name}\n${outputBox.value}\n`;
        }
      })
      .catch((err) => {
        spinner.classList.add("hidden");
        outputBox.value = err.message || "Unknown error";
      });
  });

  // --- Test Buttons ---
  testShellBtn.onclick = () => { inputBox.value = "echo Hello World"; };
  testPyBtn.onclick = () => { inputBox.value = "print('Hello from Python!')"; };
  testJsonBtn.onclick = () => { inputBox.value = JSON.stringify({ type: "python", command: "print('hello')" }, null, 2); };

  // --- Clear Buttons ---
  clearInputBtn.onclick = () => { inputBox.value = ""; };
  clearOutputBtn.onclick = () => { outputBox.value = ""; };

  // --- Help Button ---
  helpBtn.onclick = () => {
    helpBlock.classList.toggle("hidden");
    helpBlock.innerHTML = `
      <b>Replicon Runner Help:</b><br>
      <ul>
        <li>Shell: run OS shell command.</li>
        <li>Python: run Python snippet.</li>
        <li>Read: enter file path to view contents.</li>
        <li>Write: first line = filename, rest = content.</li>
        <li>JSON: enter JSON with {type, command}.</li>
        <li>Upload: choose file and click upload.</li>
      </ul>
      <small>See operators-manual.md for more.</small>
    `;
  };

  // --- Status Bar Polling ---
  function pollStatusBar() {
    fetch("/status")
      .then((res) => res.json())
      .then((data) => {
        statusbar.innerText = [
          data.firebase ? "🟢 Firebase" : "🔴 Firebase",
          data.github ? "🟢 GitHub" : "🔴 GitHub",
          data.vercel ? "🟢 Vercel" : "🔴 Vercel",
          data.backend ? "🟢 Backend" : "🔴 Backend"
        ].join("   ");
      })
      .catch(() => {
        statusbar.innerText = "❌ Unable to reach backend.";
      });
  }
  setInterval(pollStatusBar, 30000);
  pollStatusBar();
});
