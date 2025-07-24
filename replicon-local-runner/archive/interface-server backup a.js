// interface-server.js (CJS + dynamic import fix for Octokit)
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const { exec } = require('child_process');
require('dotenv').config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

let firebaseAdmin;
try {
    firebaseAdmin = require('firebase-admin');
    firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.applicationDefault()
    });
} catch (error) {
    console.error('⚠️ Firebase Admin SDK initialization failed:', error.message);
}

// Dynamic Octokit loader
async function getOctokit() {
    const { Octokit } = await import('@octokit/rest');
    return new Octokit({ auth: process.env.GITHUB_TOKEN });
}

// 🔹 /testFirebase → List collections + sample docs
app.get('/testFirebase', async (req, res) => {
    try {
        const db = firebaseAdmin.firestore();
        const collections = await db.listCollections();
        const output = [];

        for (const col of collections) {
            const docs = await col.limit(3).get();
            output.push({
                collection: col.id,
                documents: docs.docs.map(doc => doc.id)
            });
        }

        res.json({ success: true, data: output });
    } catch (error) {
        console.error('🔥 Firebase test failed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 🔹 /testGitHub → List authenticated user repos
app.get('/testGitHub', async (req, res) => {
    try {
        const octokit = await getOctokit();
        const result = await octokit.rest.repos.listForAuthenticatedUser();
        const repos = result.data.map(repo => ({
            name: repo.name,
            private: repo.private,
            url: repo.html_url
        }));

        res.json({ success: true, data: repos });
    } catch (error) {
        console.error('🔥 GitHub test failed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 🔹 /testVercel → List Vercel projects
app.get('/testVercel', async (req, res) => {
    try {
        const response = await axios.get('https://api.vercel.com/v9/projects', {
            headers: {
                Authorization: `Bearer ${process.env.VERCEL_TOKEN}`
            }
        });

        const projects = response.data.projects.map(project => ({
            name: project.name,
            id: project.id,
            latestDeployment: project.latestDeployment?.state || 'N/A'
        }));

        res.json({ success: true, data: projects });
    } catch (error) {
        console.error('🔥 Vercel test failed:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 🔹 /run → Accept shell command payloads
app.post('/run', (req, res) => {
    const { action, payload } = req.body;
    console.log(`📦 Received run request: ${action}`, payload);

    exec(payload, (error, stdout, stderr) => {
        if (error) {
            console.error('⛔ Command failed:', error.message);
            return res.status(500).json({ success: false, error: stderr || error.message });
        }
        res.json({ success: true, output: stdout });
    });
});

// 🧠 Boot message
app.listen(PORT, () => {
    console.log(`🖖 Replicon Local AI Runner backend active: http://localhost:${PORT}`);
});
