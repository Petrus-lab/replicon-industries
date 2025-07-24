// FILE: interface-server.js   GENERATED: 2025-07-19T19:58:00+02:00
// AI PRIME DIRECTIVES: FULL, PROTOCOL-LOCKED, NO SIDE-CHANGES

const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// STATUS ENDPOINT for frontend polling
app.get('/status', (req, res) => res.json({ ok: true }));

// Core action runner
app.post('/run', async (req, res) => {
    try {
        const { action, inputData, targetPath, filename } = req.body;

        if (!action) return res.json({ output: 'No action provided.' });

        // SHELL
        if (action === 'shell') {
            exec(inputData, { shell: true }, (error, stdout, stderr) => {
                return res.json({
                    output: (error ? stderr || error.message : stdout)
                });
            });
            return;
        }

        // PYTHON
        if (action === 'python') {
            exec(`python -c "${inputData.replace(/"/g, '\\"')}"`, (error, stdout, stderr) => {
                return res.json({
                    output: `[Python] ${error ? stderr || error.message : stdout}`
                });
            });
            return;
        }

        // READ FILE
        if (action === 'read') {
            let file = inputData.trim();
            if (!fs.existsSync(file)) return res.json({ output: "File not found: " + file });
            let stat = fs.statSync(file);
            if (stat.isDirectory()) return res.json({ output: "Error: EISDIR: illegal operation on a directory, read" });
            fs.readFile(file, 'utf8', (err, data) => {
                if (err) return res.json({ output: err.message });
                return res.json({ output: data });
            });
            return;
        }

        // WRITE FILE
        if (action === 'write') {
            let fname = '';
            let content = '';
            try {
                let parsed = typeof inputData === 'string' ? JSON.parse(inputData) : inputData;
                fname = parsed.filename;
                content = parsed.content;
            } catch (e) {
                return res.json({ output: "Input must be JSON: {filename, content}" });
            }
            fs.writeFile(fname, content, err => {
                if (err) return res.json({ output: err.message });
                return res.json({ output: `File written: ${fname}` });
            });
            return;
        }

        // RUN JSON
        if (action === 'json') {
            let parsed;
            try {
                parsed = typeof inputData === 'string' ? JSON.parse(inputData) : inputData;
            } catch (e) {
                return res.json({ output: "JSON parse error: " + e.message });
            }
            // You can extend this logic, but here's the protocol
            if (!parsed || !parsed.type) return res.json({ output: "JSON payload missing or 'type' field missing." });

            // Only handle Python and Shell types for now
            if (parsed.type === 'python') {
                exec(`python -c "${parsed.command.replace(/"/g, '\\"')}"`, (error, stdout, stderr) => {
                    return res.json({ output: `[Python] ${error ? stderr || error.message : stdout}` });
                });
                return;
            }
            if (parsed.type === 'shell') {
                exec(parsed.command, { shell: true }, (error, stdout, stderr) => {
                    return res.json({
                        output: (error ? stderr || error.message : stdout)
                    });
                });
                return;
            }
            return res.json({ output: "Unknown type in JSON input." });
        }

        // UPLOAD FILE: not implemented for demo. (You can add file-upload logic here.)

        // Default fallback
        return res.json({ output: "Unknown action." });
    } catch (e) {
        return res.json({ output: "Server error: " + e.message });
    }
});

// Static: serve files (if you want)
// app.use(express.static(path.join(__dirname, 'ai-interface')));

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Replicon interface-server.js running at http://localhost:${PORT}/`);
});
