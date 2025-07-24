// replicon-local-runner/index.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Confirm runner is online
app.get('/', (req, res) => {
  res.send('✅ Local AI Runner is active on port 3001');
});

// Handle commands from the UI
app.post('/run', (req, res) => {
  const { action, command } = req.body;

  if (!command) {
    return res.status(400).send('No command received.');
  }

  console.log(`🧠 Running command: ${command}`);

  exec(command, { cwd: process.cwd() }, (err, stdout, stderr) => {
    if (err) {
      console.error(`❌ Error: ${stderr}`);
      return res.json({ output: stderr });
    }
    console.log(`✅ Output: ${stdout}`);
    return res.json({ output: stdout });
  });
});

// Start runner
app.listen(PORT, () => {
  console.log(`🧪 Replicon Local AI Runner is running on port ${PORT}`);
});
