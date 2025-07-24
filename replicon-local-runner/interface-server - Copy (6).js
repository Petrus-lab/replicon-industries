// FILE: interface-server.js   GENERATED: 2025-07-17T15:08:00+02:00
/*
  === AI PRIME DIRECTIVES (DO NOT REMOVE) ===

  - Never invent, assume, or reference code/features/files not present or not explicitly requested.
  - Only change what’s specifically requested; no side edits or extras.
  - Never break or remove any existing, working feature.
  - Confirm current project state before making changes.
  - Deliver only full, copy-paste-ready, and instantly reversible code.
  - If unclear or missing info, STOP and ask—never proceed on assumptions.
  - Never assume user actions unless confirmed in chat or docs.

  If any directive would be violated, do NOT proceed—STOP and request clarification.
*/

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
require("dotenv").config();

const app = express();
const upload = multer({ dest: "uploads/" });
const SAFE_ROOT = path.resolve(process.cwd());

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

function safeJoin(base, target) {
  const targetPath = path.resolve(base, target);
  if (!targetPath.startsWith(base)) throw new Error("Unsafe path");
  return targetPath;
}
function logDebug(msg, ...rest) {
  console.log("[DEBUG]", msg, ...(rest || []));
}

// ---- MAIN RUN ENDPOINT ----
app.post("/run", async (req, res) => {
  try {
    const { action, inputData, targetPath, raw, jsonPayload, filename, content } = req.body;
    logDebug("POST /run", { action, inputData, targetPath, raw, jsonPayload, filename });

    // --- PATCH: Run JSON robust dispatch ---
    if (action === "json") {
      let job = jsonPayload;
      if (typeof job === "string") {
        try { job = JSON.parse(job); }
        catch (e) { return res.json({ output: "❌ JSON parse error: " + e.message }); }
      }
      if (!job || typeof job !== "object" || !job.type) {
        return res.json({ output: "❌ JSON payload missing or 'type' field missing." });
      }
      // Sub-dispatch
      if (job.type === "python") {
        fs.writeFileSync('ai-tmp.py', job.command);
        require("child_process").exec('python ai-tmp.py', (err, stdout, stderr) => {
          fs.unlinkSync('ai-tmp.py');
          res.json({ stdout, stderr, status: (err ? "❌" : "✅") });
        });
        return;
      } else if (job.type === "shell") {
        require("child_process").exec(job.command, (err, stdout, stderr) => {
          res.json({ stdout, stderr: stderr || (err ? err.message : ""), status: (err ? "❌" : "✅") });
        });
        return;
      } else if (job.type === "read") {
        let fpath = job.path || job.inputData;
        if (!fs.existsSync(fpath)) return res.json({ output: "❌ File does not exist." });
        let txt = fs.readFileSync(fpath, 'utf8');
        res.json({ output: txt, status: "✅" });
        return;
      } else {
        res.json({ output: "❌ Unknown type in JSON payload: " + job.type });
        return;
      }
    }

    // Legacy actions
    if (action === "shell") {
      const { exec } = require("child_process");
      exec(inputData, { cwd: SAFE_ROOT }, (err, stdout, stderr) => {
        if (err) return res.json({ output: "❌ " + (stderr || err.message) });
        res.json({ output: stdout });
      });
      return;
    }
    if (action === "python") {
      const { exec } = require("child_process");
      fs.writeFileSync('ai-tmp.py', inputData);
      exec('python ai-tmp.py', { cwd: SAFE_ROOT }, (err, stdout, stderr) => {
        fs.unlinkSync('ai-tmp.py');
        if (err) return res.json({ output: "❌ " + (stderr || err.message) });
        res.json({ output: stdout });
      });
      return;
    }
    if (action === "read") {
      if (!targetPath) {
        return res.json({ output: "❌ No file path." });
      }
      try {
        const abs = safeJoin(SAFE_ROOT, targetPath);
        const data = fs.readFileSync(abs, "utf8");
        res.json({ output: data });
      } catch (e) {
        res.json({ output: "❌ Read error: " + e.message });
      }
      return;
    }
    if (action === "write") {
      try {
        let file, writeContent;
        if (typeof inputData === "string" && inputData.trim().startsWith("{")) {
          const parsed = JSON.parse(inputData);
          file = parsed.filename;
          writeContent = parsed.content;
        } else if (filename && content !== undefined) {
          file = filename;
          writeContent = content;
        } else {
          return res.json({ output: "❌ Invalid input for write." });
        }
        const abs = safeJoin(SAFE_ROOT, file);
        fs.writeFileSync(abs, writeContent, "utf8");
        res.json({ output: "✅ File written: " + file });
      } catch (e) {
        res.json({ output: "❌ Write error: " + e.message });
      }
      return;
    }
    if (action === "test_all_integrations") {
      const fb = process.env.FIREBASE_PROJECT_ID ? "Firebase OK" : "No Firebase";
      const gh = process.env.GITHUB_TOKEN ? "GitHub OK" : "No GitHub";
      const verc = process.env.VERCEL_TOKEN ? "Vercel OK" : "No Vercel";
      return res.json({ output: `Status: ${fb}, ${gh}, ${verc}` });
    }

    res.json({ output: "❌ Unknown action." });
  } catch (e) {
    logDebug("Handler error", e);
    res.json({ output: "❌ Handler error: " + e.message });
  }
});

// ---- FILE EXISTS (UI INDICATOR) ----
app.get("/check-file-exists", (req, res) => {
  try {
    let rel = req.query.path || "";
    if (!rel) {
      return res.json({ exists: false });
    }
    const abs = safeJoin(SAFE_ROOT, rel);
    const exists = fs.existsSync(abs);
    res.json({ exists });
  } catch (e) {
    res.json({ exists: false });
  }
});

// ---- UPLOAD FILE ----
app.post("/upload-file", upload.single("file"), (req, res) => {
  try {
    const { destPath } = req.body;
    if (!req.file || !destPath) {
      return res.json({ success: false, error: "Missing file or destination." });
    }
    const abs = safeJoin(SAFE_ROOT, destPath);
    fs.renameSync(req.file.path, abs);
    res.json({ success: true });
  } catch (e) {
    res.json({ success: false, error: e.message });
  }
});

// ---- INTEGRATION STATUS BAR ENDPOINT ----
app.get("/check-integrations", async (req, res) => {
  let status = { firebase: false, github: false, vercel: false };
  if (process.env.FIREBASE_PROJECT_ID) status.firebase = true;
  if (process.env.GITHUB_TOKEN) status.github = true;
  if (process.env.VERCEL_TOKEN) status.vercel = true;
  res.json(status);
});

// ---- CLOUD LLM: ChatGPT ----
app.post("/ask-chatgpt", async (req, res) => {
  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return res.json({ output: "❌ OpenAI API key not inserted. Please insert your API key in the `.env` file to activate cloud LLM features." });
    }
    const prompt = req.body.prompt;
    const model = req.body.model || "gpt-4o";
    const url = "https://api.openai.com/v1/chat/completions";
    const headers = {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json"
    };
    const data = {
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 512
    };
    const gptres = await axios.post(url, data, { headers });
    const output = gptres.data.choices[0].message.content;
    res.json({ output });
  } catch (e) {
    res.json({ output: "❌ GPT error: " + (e.response?.data?.error?.message || e.message) });
  }
});

// ---- STATIC FILES ----
app.use(express.static(path.join(SAFE_ROOT, "ai-interface")));

const PORT_SET = process.env.PORT || 3001;
app.listen(PORT_SET, () => {
  console.log(`Replicon interface-server.js running at http://localhost:${PORT_SET}/`);
});
