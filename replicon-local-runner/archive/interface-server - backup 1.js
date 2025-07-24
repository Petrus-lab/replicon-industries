const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 3001;

require("dotenv").config();

app.use(cors());
app.use(express.json());

// ==== Helper function for Firebase deep scan ====
async function deepScanFirebase() {
  try {
    const admin = require("firebase-admin");
    if (!admin.apps.length) {
      admin.initializeApp({ credential: admin.credential.applicationDefault() });
    }
    const db = admin.firestore();
    const collections = await db.listCollections();
    let details = [];
    for (const col of collections) {
      const snapshot = await col.limit(5).get();
      const docIds = snapshot.docs.map(doc => doc.id);
      details.push({
        collection: col.id,
        documents: docIds,
      });
    }
    return (
      "✅ Firebase: Collections and sample docs:\n" +
      JSON.stringify(details, null, 2)
    );
  } catch (e) {
    return `❌ Firebase error:\n${e.message}`;
  }
}

// ==== Helper for GitHub deep scan ====
async function deepScanGitHub() {
  try {
    const { Octokit } = await import("@octokit/rest");
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser();
    const repoDetails = repos.map(repo => ({
      name: repo.name,
      private: repo.private,
      stars: repo.stargazers_count,
      default_branch: repo.default_branch,
      url: repo.html_url,
      pushed_at: repo.pushed_at,
    }));
    return (
      "✅ GitHub: Repo details:\n" +
      JSON.stringify(repoDetails, null, 2)
    );
  } catch (e) {
    return `❌ GitHub error:\n${e.message}`;
  }
}

// ==== Helper for Vercel deep scan ====
async function deepScanVercel() {
  try {
    const axios = require("axios");
    const token = process.env.VERCEL_TOKEN;
    if (!token) throw new Error("Missing VERCEL_TOKEN in .env");
    // List all projects
    const projectRes = await axios.get("https://api.vercel.com/v9/projects", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const projects = projectRes.data.projects || [];
    let details = [];
    // For each project, get latest deployment
    for (const proj of projects) {
      let latestDeploy = null;
      try {
        const deployRes = await axios.get(
          `https://api.vercel.com/v6/deployments?projectId=${proj.id}&limit=1`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (
          deployRes.data.deployments &&
          deployRes.data.deployments.length > 0
        ) {
          const d = deployRes.data.deployments[0];
          latestDeploy = {
            state: d.state,
            url: d.url,
            created: d.createdAt,
            meta: d.meta,
          };
        }
      } catch (e) {
        latestDeploy = { error: e.message };
      }
      details.push({
        project: proj.name,
        id: proj.id,
        latestDeployment: latestDeploy,
      });
    }
    return (
      "✅ Vercel: Projects and latest deployments:\n" +
      JSON.stringify(details, null, 2)
    );
  } catch (e) {
    return `❌ Vercel/Axios error:\n${e.message}`;
  }
}

app.post("/run", async (req, res) => {
  const { action, targetPath, inputData, raw, targets } = req.body;

  switch (action) {
    case "shell":
      if (!inputData?.trim())
        return res.json({ output: "❌ Shell command is empty." });
      exec(inputData, (err, stdout, stderr) => {
        res.json({
          output: err ? `❌ Shell Error:\n${stderr}` : stdout,
        });
      });
      break;

    case "python":
      if (!inputData?.trim())
        return res.json({ output: "❌ Python code is empty." });
      fs.writeFileSync("temp.py", inputData);
      exec("python temp.py", (err, stdout, stderr) => {
        fs.unlinkSync("temp.py");
        res.json({
          output: err ? `❌ Python Error:\n${stderr}` : stdout,
        });
      });
      break;

    case "read":
      if (!targetPath?.trim())
        return res.json({ output: "❌ File path is required to read." });
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
        if (!filename || !content)
          throw new Error("Missing filename or content");
        const fullPath = path.resolve(__dirname, filename);
        fs.writeFileSync(fullPath, content);
        res.json({
          output: `✅ File written successfully to ${filename}`,
        });
      } catch (e) {
        res.json({
          output: `❌ File Write Error:\n${e.message}\n${inputData}`,
        });
      }
      break;

    case "json":
      try {
        const block = JSON.parse(raw);
        if (!block.type || !block.command) {
          return res.json({
            output:
              `🧾 Parsed JSON:\n${JSON.stringify(
                block,
                null,
                2
              )}\n⚠ Missing type or command.`,
          });
        }
        const { type, command } = block;
        switch (type) {
          case "shell":
            exec(command, (err, stdout, stderr) => {
              res.json({
                output: err ? `❌ Shell Error:\n${stderr}` : stdout,
              });
            });
            break;
          case "python":
            fs.writeFileSync("temp.py", command);
            exec("python temp.py", (err, stdout, stderr) => {
              fs.unlinkSync("temp.py");
              res.json({
                output: err ? `❌ Python Error:\n${stderr}` : stdout,
              });
            });
            break;
          default:
            res.json({
              output:
                `🧾 Parsed JSON:\n${JSON.stringify(
                  block,
                  null,
                  2
                )}\n⚠ Unknown type: ${type}`,
            });
        }
      } catch (e) {
        res.json({ output: `❌ JSON Parse Error:\n${e.message}` });
      }
      break;

    case "test_all_integrations":
      const resultLines = [];
      if (targets.includes("firebase")) {
        resultLines.push(await deepScanFirebase());
      }
      if (targets.includes("github")) {
        resultLines.push(await deepScanGitHub());
      }
      if (targets.includes("vercel")) {
        resultLines.push(await deepScanVercel());
      }
      res.json({ output: resultLines.join("\n\n") });
      break;

    default:
      res.json({ output: `❌ Unknown action: ${action}` });
  }
});

// === NEW: CONTROL ENDPOINTS ===

// --- SHUTDOWN ENDPOINT FOR SAFE KILL ---
app.post('/shutdown', (req, res) => {
  res.json({ message: 'Backend shutting down now.' });
  console.log('Received shutdown command from UI. Exiting...');
  setTimeout(() => process.exit(0), 500);
});

// --- RESTART ENDPOINT FOR PM2 ---
app.post('/restart', (req, res) => {
  res.json({ message: 'Backend restarting now.' });
  console.log('Received restart command from UI. Exiting for restart...');
  setTimeout(() => process.exit(1), 500); // PM2 will restart
});

// --- RESTART UI SERVER ENDPOINT ---
app.post('/restart-ui', (req, res) => {
  // PowerShell script to restart lite-server
  const scriptPath = path.join(__dirname, '../restart-lite-server.ps1');
  exec(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error('Error restarting lite-server:', error);
      return res.status(500).json({ message: 'Failed to restart UI server.', error: stderr || error.toString() });
    }
    res.json({ message: 'UI server restart triggered.', output: stdout });
  });
});

// === END CONTROL ENDPOINTS ===

app.listen(PORT, () => {
  console.log(
    `🧠 Replicon Local AI Runner (deep scan) is live on http://localhost:${PORT}`
  );
});
