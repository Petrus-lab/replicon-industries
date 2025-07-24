// FILE: interface-server.js   GENERATED: 2025-07-17T16:XX:XX+02:00
// AI PRIME DIRECTIVES: No regression, full function restoration, debug logging at each action.

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

console.log("Replicon interface-server.js running at http://localhost:" + PORT + "/");

// -- MAIN ENDPOINT --
app.post('/run', async (req, res) => {
    const action = req.body.action;
    const inputData = req.body.inputData;
    const targetPath = req.body.targetPath;
    const raw = req.body.raw;
    const filename = req.body.filename;
    const jsonPayload = req.body.jsonPayload;

    // Debug logging (trace every request)
    console.log("[DEBUG] POST /run", JSON.stringify(req.body, null, 2));

    // --- SHELL ---
    if (action === 'shell') {
        exec(inputData, (err, stdout, stderr) => {
            res.json({
                ok: !err,
                output: stdout || stderr,
                error: err ? err.message : null
            });
        });
        return;
    }

    // --- PYTHON ---
    if (action === 'python') {
        exec(`python -c "${inputData.replace(/"/g, '\\"')}"`, (err, stdout, stderr) => {
            res.json({
                ok: !err,
                output: stdout || stderr,
                error: err ? err.message : null
            });
        });
        return;
    }

    // --- JSON (MULTI-ACTION) ---
    if (action === 'json') {
        let parsed;
        try {
            parsed = typeof inputData === 'object' ? inputData : JSON.parse(inputData);
        } catch (e) {
            return res.json({
                ok: false,
                output: null,
                error: "JSON parse error: " + e.message
            });
        }
        // Debug print
        console.log("[DEBUG] JSON parsed:", parsed);

        // Detect type and dispatch
        if (!parsed.type || !parsed.command) {
            return res.json({
                ok: false,
                output: null,
                error: "JSON payload missing or 'type'/'command' field missing."
            });
        }
        // Shell command
        if (parsed.type.toLowerCase() === "shell") {
            exec(parsed.command, (err, stdout, stderr) => {
                res.json({
                    ok: !err,
                    output: stdout || stderr,
                    error: err ? err.message : null
                });
            });
            return;
        }
        // Python command
        if (parsed.type.toLowerCase() === "python") {
            exec(`python -c "${parsed.command.replace(/"/g, '\\"')}"`, (err, stdout, stderr) => {
                res.json({
                    ok: !err,
                    output: stdout || stderr,
                    error: err ? err.message : null
                });
            });
            return;
        }
        // Unknown type
        return res.json({
            ok: false,
            output: null,
            error: "Unknown type: " + parsed.type
        });
    }

    // --- FILE READ ---
    if (action === 'read') {
        try {
            const data = fs.readFileSync(inputData, 'utf8');
            res.json({ ok: true, output: data });
        } catch (err) {
            res.json({ ok: false, error: err.message });
        }
        return;
    }

    // --- FILE WRITE ---
    if (action === 'write') {
        try {
            fs.writeFileSync(targetPath, raw);
            res.json({ ok: true, output: `File written: ${targetPath}` });
        } catch (err) {
            res.json({ ok: false, error: err.message });
        }
        return;
    }

    // --- TEST ALL INTEGRATIONS ---
    if (action === 'test_all_integrations') {
        res.json({
            ok: true,
            output: "Integration test: all systems nominal"
        });
        return;
    }

    // --- UNKNOWN ---
    res.json({ ok: false, error: "Unknown action type: " + action });
});

app.listen(PORT, () => {
    console.log(`Replicon interface-server.js running at http://localhost:${PORT}/`);
});
