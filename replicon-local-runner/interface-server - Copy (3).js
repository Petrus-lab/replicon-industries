// ✅ FILE: interface-server.js

const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

require('dotenv').config({ path: path.join(__dirname, '.env') });

async function getOctokit() {
    const { Octokit } = await import('@octokit/rest');
    return new Octokit({ auth: process.env.GITHUB_TOKEN });
}

function testFirebaseLive() {
    try {
        const admin = require('firebase-admin');
        if (!admin.apps.length) {
            const serviceAccount = require('./firebase-service-account.json');
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
            });
        }
        return admin.firestore().collection('__diagnostic').doc('status').get()
            .then(() => '✅ Firebase connected.')
            .catch(e => '❌ Firebase error: ' + e.message);
    } catch (e) {
        return Promise.resolve('❌ Firebase not available: ' + e.message);
    }
}

async function testGitHubLive() {
    try {
        const octokit = await getOctokit();
        const res = await octokit.repos.listForAuthenticatedUser({ per_page: 1 });
        if (res && Array.isArray(res.data)) {
            return '✅ GitHub connected.';
        } else {
            return '❌ GitHub API error.';
        }
    } catch (e) {
        return '❌ GitHub error: ' + (e.message || e.toString());
    }
}

async function testVercelLive() {
    const token = process.env.VERCEL_TOKEN;
    const orgId = process.env.VERCEL_ORG_ID;
    let results = [];

    // 1. Try official (modern) endpoint with teamId
    try {
        const url2 = `https://api.vercel.com/v2/projects?limit=1${orgId ? `&teamId=${orgId}` : ''}`;
        const headers = { Authorization: `Bearer ${token}` };
        const res2 = await axios.get(url2, { headers });
        if (res2.status === 200 && res2.data.projects) {
            results.push('✅ Vercel connected via /v2/projects.');
        } else {
            results.push('❌ Vercel /v2 API error.');
        }
    } catch (e) {
        results.push('❌ Vercel /v2 error: ' + (e.response?.data?.error?.message || e.message));
    }

    // 2. Try legacy (old) endpoint with just Bearer token
    try {
        const url9 = `https://api.vercel.com/v9/projects`;
        const headers = { Authorization: `Bearer ${token}` };
        const res9 = await axios.get(url9, { headers });
        if (res9.status === 200 && Array.isArray(res9.data.projects)) {
            results.push('✅ Vercel connected via /v9/projects.');
        } else {
            results.push('❌ Vercel /v9 API error.');
        }
    } catch (e) {
        results.push('❌ Vercel /v9 error: ' + (e.response?.data?.error?.message || e.message));
    }

    return results.join('\n');
}

// ---- MAIN: UI /run endpoint ----
app.post('/run', async (req, res) => {
    const { action, inputData, targetPath, raw, targets } = req.body;
    try {
        // TEST INTEGRATIONS
        if (action === 'test_all_integrations' && Array.isArray(targets)) {
            let results = await Promise.all(targets.map(async t => {
                t = t.toLowerCase();
                if (t === 'firebase') return await testFirebaseLive();
                if (t === 'github') return await testGitHubLive();
                if (t === 'vercel') return await testVercelLive();
                return `❌ Unknown integration: ${t}`;
            }));
            return res.json({ output: results.join('\n') });
        }

        // 1. SHELL COMMAND
        if (action === 'shell' && inputData) {
            exec(inputData, { cwd: process.cwd() }, (err, stdout, stderr) => {
                if (err) return res.json({ output: stderr });
                return res.json({ output: stdout });
            });
            return;
        }

        // 2. PYTHON
        if (action === 'python' && inputData) {
            exec(`python -c "${inputData.replace(/"/g, '\\"')}"`, { cwd: process.cwd() }, (err, stdout, stderr) => {
                if (err) return res.json({ output: stderr });
                return res.json({ output: stdout });
            });
            return;
        }

        // 3. READ FILE
        if (action === 'read' && targetPath) {
            fs.readFile(targetPath, 'utf8', (err, data) => {
                if (err) return res.json({ output: `❌ Error: ${err.message}` });
                return res.json({ output: data });
            });
            return;
        }

        // 4. WRITE FILE
        if (action === 'write' && inputData) {
            let parsed;
            try { parsed = JSON.parse(inputData); }
            catch (e) { return res.json({ output: '❌ Error: Invalid JSON for write.' }); }
            if (!parsed.filename || !parsed.content) return res.json({ output: '❌ Error: filename and content required.' });
            fs.writeFile(parsed.filename, parsed.content, err => {
                if (err) return res.json({ output: `❌ Error writing file: ${err.message}` });
                return res.json({ output: `✅ Saved to ${parsed.filename}` });
            });
            return;
        }

        // 5. JSON (Chained action)
        if (action === 'json' && raw) {
            let parsed;
            try { parsed = JSON.parse(raw); }
            catch (e) { return res.json({ output: '❌ Error: Invalid JSON.' }); }
            if (parsed.type === 'shell' && parsed.command) {
                exec(parsed.command, { cwd: process.cwd() }, (err, stdout, stderr) => {
                    if (err) return res.json({ output: stderr });
                    return res.json({ output: stdout });
                });
                return;
            }
            if (parsed.type === 'python' && parsed.command) {
                exec(`python -c "${parsed.command.replace(/"/g, '\\"')}"`, { cwd: process.cwd() }, (err, stdout, stderr) => {
                    if (err) return res.json({ output: stderr });
                    return res.json({ output: stdout });
                });
                return;
            }
            return res.json({ output: '❌ Unknown type in JSON action.' });
        }

        // 7. Unknown action
        return res.json({ output: `❌ Unknown action "${action}".` });
    } catch (err) {
        return res.json({ output: `❌ Exception: ${err.message}` });
    }
});

// --- New: Ask ChatGPT Route ---
app.post('/ask-chatgpt', async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const prompt = (req.body.prompt || "").toString().trim();
  if (!apiKey) {
    return res.json({ output: "❌ OpenAI API key not inserted. Please insert key to activate this feature." });
  }
  if (!prompt) {
    return res.json({ output: "❌ No prompt supplied." });
  }
  // Basic abuse/safety check
  if (prompt.length > 2000) return res.json({ output: "❌ Prompt too long (max 2000 chars)." });

  try {
    // Call OpenAI API (gpt-4o default; you can adjust model)
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800,
        temperature: 0.3
      },
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      }
    );
    const reply = response.data.choices?.[0]?.message?.content?.trim() || "(No answer)";
    res.json({ output: reply });
  } catch (err) {
    res.json({ output: "❌ Error: " + (err.response?.data?.error?.message || err.message) });
  }
});

// Listen
app.listen(port, () => {
    console.log(`✋ Replicon Local AI Runner backend active: http://localhost:${port}`);
});
