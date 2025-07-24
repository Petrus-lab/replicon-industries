const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post("/run", async (req, res) => {
  const { action, targetPath, inputData, raw, targets } = req.body;

  switch (action) {
    case "shell":
      if (!inputData?.trim()) return res.json({ output: "❌ Shell command is empty." });
      exec(inputData, (err, stdout, stderr) => {
        res.json({ output: err ? `❌ Shell Error:\n${stderr}` : stdout });
      });
      break;

    case "python":
      if (!inputData?.trim()) return res.json({ output: "❌ Python code is empty." });
      fs.writeFileSync("temp.py", inputData);
      exec("python temp.py", (err, stdout, stderr) => {
        fs.unlinkSync("temp.py");
        res.json({ output: err ? `❌ Python Error:\n${stderr}` : stdout });
      });
      break;

    case "read":
      if (!targetPath?.trim()) return res.json({ output: "❌ File path is required to read." });
      try {
        const resolvedPath = path.resolve(__dirname, targetPath);
        const content = fs.readFileSync(resolvedPath, "utf-8");
        res.json({ output: content });
      } catch (e) {
        res.json({ output: `❌ File Read Error:\n${e.message}` });
      }
      break;

    case "write":
      try {
        const { filename, content } = JSON.parse(inputData || "{}");
        if (!filename || !content) throw new Error("Missing filename or content");
        const fullPath = path.resolve(__dirname, filename);
        fs.writeFileSync(fullPath, content);
        res.json({ output: `✅ File written successfully to ${filename}` });
      } catch (e) {
        res.json({ output: `❌ File Write Error:\n${e.message}\n${inputData}` });
      }
      break;

    case "json":
      try {
        const block = JSON.parse(raw);
        if (!block.type || !block.command) {
          return res.json({ output: `🧾 Parsed JSON:\n${JSON.stringify(block, null, 2)}\n⚠ Missing type or command.` });
        }

        const { type, command } = block;
        switch (type) {
          case "shell":
            exec(command, (err, stdout, stderr) => {
              res.json({ output: err ? `❌ Shell Error:\n${stderr}` : stdout });
            });
            break;

          case "python":
            fs.writeFileSync("temp.py", command);
            exec("python temp.py", (err, stdout, stderr) => {
              fs.unlinkSync("temp.py");
              res.json({ output: err ? `❌ Python Error:\n${stderr}` : stdout });
            });
            break;

          default:
            res.json({ output: `🧾 Parsed JSON:\n${JSON.stringify(block, null, 2)}\n⚠ Unknown type: ${type}` });
        }
      } catch (e) {
        res.json({ output: `❌ JSON Parse Error:\n${e.message}` });
      }
      break;

    case "test_all_integrations":
      const results = [];

      if (targets.includes("firebase")) {
        try {
          const admin = require("firebase-admin");
          if (!admin.apps.length) {
            admin.initializeApp({ credential: admin.credential.applicationDefault() });
          }
          results.push("✅ Firebase Admin initialized.");
        } catch (e) {
          results.push(`❌ Firebase Admin error:\n${e.message}`);
        }
      }

      if (targets.includes("github")) {
        try {
          await import("@octokit/rest").then(({ Octokit }) => {
            const octokit = new Octokit();
            results.push("✅ GitHub API accessible.");
          }).catch(e => {
            results.push(`❌ GitHub error:\n${e.message}`);
          });
        } catch (e) {
          results.push(`❌ GitHub import error:\n${e.message}`);
        }
      }

      if (targets.includes("vercel")) {
        try {
          const axios = require("axios");
          results.push("✅ Axios (for Vercel) is ready.");
        } catch (e) {
          results.push(`❌ Vercel/Axios error:\n${e.message}`);
        }
      }

      res.json({ output: results.join("\n") });
      break;

    default:
      res.json({ output: `❌ Unknown action: ${action}` });
  }
});


// --- Graceful shutdown endpoint ---
app.post('/shutdown', (req, res) => {
  res.json({ message: 'Backend shutting down now.' });
// --- RESTART ENDPOINT FOR PM2 ---
app.post('/restart', (req, res) => {
  res.json({ message: 'Backend restarting now.' });
// --- RESTART UI SERVER ENDPOINT ---
const { exec } = require('child_process');
app.post('/restart-ui', (req, res) => {
  // PowerShell script to restart lite-server
  const scriptPath = require('path').join(__dirname, 'restart-lite-server.ps1');
  exec(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error('Error restarting lite-server:', error);
      return res.status(500).json({ message: 'Failed to restart UI server.', error: stderr || error.toString() });
    }
    res.json({ message: 'UI server restart triggered.', output: stdout });
  });
});

  console.log('Received restart command from UI. Exiting for restart...');
  setTimeout(() => process.exit(1), 500);
});

  console.log('Received shutdown command from UI. Exiting...');
  setTimeout(() => process.exit(0), 500);
});

app.listen(PORT, () => {
  console.log(`🧠 Replicon Local AI Runner is live on http://localhost:${PORT}`);
});
