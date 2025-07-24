// Replicon AI Runner Backend – Full Triple Patch
const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const cors = require('cors');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- Run Action Handler ----
app.post('/run', async (req, res) => {
    const { action, inputData, filename, content } = req.body;
    if (action === 'shell') {
        exec(inputData, (err, stdout, stderr) => {
            res.json({ stdout, stderr: stderr || (err ? err.message : ""), status: (err ? "❌" : "✅") });
        });
    } else if (action === 'python') {
        // Basic: Use Python on path (for demo, improve for prod)
        const code = inputData;
        fs.writeFileSync('ai-tmp.py', code);
        exec('python ai-tmp.py', (err, stdout, stderr) => {
            fs.unlinkSync('ai-tmp.py');
            res.json({ stdout, stderr, status: (err ? "❌" : "✅") });
        });
    } else if (action === 'read') {
        let fpath = inputData;
        try {
            if (!fs.existsSync(fpath)) return res.json({ error: "File does not exist." });
            let txt = fs.readFileSync(fpath, 'utf8');
            res.json({ stdout: txt, status: "✅" });
        } catch (e) { res.json({ error: e.message, status: "❌" }); }
    } else if (action === 'write') {
        try {
            let outPath = filename;
            fs.writeFileSync(outPath, content, "utf8");
            res.json({ stdout: `File written: ${outPath}`, status: "✅" });
        } catch (e) { res.json({ error: e.message, status: "❌" }); }
    } else if (action === 'json') {
        try {
            const obj = JSON.parse(inputData);
            // Dispatch to sub-handler
            if (obj.type === 'shell' || obj.action === 'shell') {
                exec(obj.command || obj.inputData, (err, stdout, stderr) => {
                    res.json({ stdout, stderr: stderr || (err ? err.message : ""), status: (err ? "❌" : "✅") });
                });
            } else if (obj.type === 'python' || obj.action === 'python') {
                fs.writeFileSync('ai-tmp.py', obj.command);
                exec('python ai-tmp.py', (err, stdout, stderr) => {
                    fs.unlinkSync('ai-tmp.py');
                    res.json({ stdout, stderr, status: (err ? "❌" : "✅") });
                });
            } else if (obj.type === 'read' || obj.action === 'read') {
                let fpath = obj.path || obj.inputData;
                if (!fs.existsSync(fpath)) return res.json({ error: "File does not exist." });
                let txt = fs.readFileSync(fpath, 'utf8');
                res.json({ stdout: txt, status: "✅" });
            } else {
                res.json({ stdout: "JSON parsed (no known action): " + JSON.stringify(obj), status: "⚠️" });
            }
        } catch (e) {
            res.json({ error: "JSON error: " + e.message, status: "❌" });
        }
    } else {
        res.json({ error: "Unknown action.", status: "❌" });
    }
});

// ---- File Upload Handler ----
app.post('/upload', express.json(), (req, res) => {
    try {
        const { filename, content, targetDir } = req.body;
        let saveDir = targetDir || "file outputs";
        if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true });
        const fpath = path.join(saveDir, filename);
        fs.writeFileSync(fpath, content, "utf8");
        res.json({ status: `Uploaded to ${fpath}` });
    } catch (e) {
        res.json({ error: e.message });
    }
});

// ---- Static + Start ----
app.listen(PORT, () => {
    console.log(`Replicon interface-server.js running at http://localhost:${PORT}/`);
});
