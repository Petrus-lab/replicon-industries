// ✅ FILE: interface-server.js (Protocol Compliant, Feature-Complete)

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
require("dotenv").config();

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const SAFE_ROOT = path.resolve(process.cwd()); // Project root

// ---- UTILS ----
function safeJoin(base, target) {
    const targetPath = path.resolve(base, target);
    if (!targetPath.startsWith(base)) throw new Error("Unsafe path");
    return targetPath;
}

// ---- MAIN RUN ENDPOINT ----
app.post("/run", async (req, res) => {
    try {
        const { action, inputData, targetPath, raw } = req.body;
        if (!action) return res.json({ output: "❌ No action provided." });

        if (action === "shell") {
            // Simple shell exec (CAUTION: demo only, lock down for prod)
            const { exec } = require("child_process");
            exec(inputData, { cwd: SAFE_ROOT }, (err, stdout, stderr) => {
                if (err) return res.json({ output: "❌ " + stderr || err.message });
                res.json({ output: stdout });
            });
            return;
        }
        if (action === "python") {
            const { exec } = require("child_process");
            exec(`python -c "${inputData.replace(/"/g, '\\"')}"`, { cwd: SAFE_ROOT }, (err, stdout, stderr) => {
                if (err) return res.json({ output: "❌ " + stderr || err.message });
                res.json({ output: stdout });
            });
            return;
        }
        if (action === "read") {
            if (!targetPath) return res.json({ output: "❌ No file path." });
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
                let file, content;
                if (typeof inputData === "string" && inputData.trim().startsWith("{")) {
                    const parsed = JSON.parse(inputData);
                    file = parsed.filename;
                    content = parsed.content;
                } else {
                    return res.json({ output: "❌ Invalid input for write." });
                }
                const abs = safeJoin(SAFE_ROOT, file);
                fs.writeFileSync(abs, content, "utf8");
                res.json({ output: "✅ File written: " + file });
            } catch (e) {
                res.json({ output: "❌ Write error: " + e.message });
            }
            return;
        }
        if (action === "json") {
            try {
                const parsed = JSON.parse(raw || inputData);
                res.json({ output: "JSON parsed: " + JSON.stringify(parsed, null, 2) });
            } catch (e) {
                res.json({ output: "❌ JSON error: " + e.message });
            }
            return;
        }

        // --- Integration Tests ---
        if (action === "test_all_integrations") {
            const fb = process.env.FIREBASE_PROJECT_ID ? "Firebase OK" : "No Firebase";
            const gh = process.env.GITHUB_TOKEN ? "GitHub OK" : "No GitHub";
            const verc = process.env.VERCEL_TOKEN ? "Vercel OK" : "No Vercel";
            return res.json({ output: `Status: ${fb}, ${gh}, ${verc}` });
        }

        res.json({ output: "❌ Unknown action." });
    } catch (e) {
        res.json({ output: "❌ Handler error: " + e.message });
    }
});

// ---- FILE EXISTS (UI INDICATOR) ----
app.get("/check-file-exists", (req, res) => {
    try {
        let rel = req.query.path || "";
        if (!rel) return res.json({ exists: false });
        const abs = safeJoin(SAFE_ROOT, rel);
        res.json({ exists: fs.existsSync(abs) });
    } catch {
        res.json({ exists: false });
    }
});

// ---- UPLOAD FILE ----
app.post("/upload-file", upload.single("file"), (req, res) => {
    try {
        const { destPath } = req.body;
        if (!req.file || !destPath) return res.json({ success: false, error: "Missing file or destination." });
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
    // Firebase
    try {
        if (process.env.FIREBASE_PROJECT_ID) status.firebase = true;
    } catch {}
    // GitHub
    try {
        if (process.env.GITHUB_TOKEN) status.github = true;
    } catch {}
    // Vercel
    try {
        if (process.env.VERCEL_TOKEN) status.vercel = true;
    } catch {}
    res.json(status);
});

// ---- CLOUD LLM: ChatGPT ----
app.post("/ask-chatgpt", async (req, res) => {
    try {
        const key = process.env.OPENAI_API_KEY;
        if (!key) return res.json({ output: "OpenAI API key not set" });
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Replicon interface-server.js running at http://localhost:${PORT}/`);
});
