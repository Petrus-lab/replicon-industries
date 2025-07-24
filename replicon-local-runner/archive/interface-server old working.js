const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const app = express();
const PORT = 3001;

app.use(express.json());

// 🔧 Main POST handler
app.post("/run", async (req, res) => {
  const { action, data } = req.body;

  try {
    switch (action) {
      case "run-shell":
        exec(data, (error, stdout, stderr) => {
          if (error) return res.send(`❌ Error: ${error.message}`);
          if (stderr) return res.send(`⚠️ Stderr: ${stderr}`);
          return res.send(`✅ Output:\n${stdout}`);
        });
        break;

      case "run-python":
        exec(`python -c "${data}"`, (error, stdout, stderr) => {
          if (error) return res.send(`❌ Python Error: ${error.message}`);
          if (stderr) return res.send(`⚠️ Python Stderr: ${stderr}`);
          return res.send(`🐍 Python Output:\n${stdout}`);
        });
        break;

      case "read-file":
        const readPath = path.resolve(data);
        fs.readFile(readPath, "utf8", (err, contents) => {
          if (err) return res.send(`❌ Failed to read file:\n${err.message}`);
          return res.send(`📄 File Contents:\n\n${contents}`);
        });
        break;

      case "write-file":
        const { filename, contents } = data;
        const writePath = path.resolve(filename);
        fs.writeFile(writePath, contents, "utf8", (err) => {
          if (err) return res.send(`❌ Failed to write file:\n${err.message}`);
          return res.send(`✅ File written successfully: ${writePath}`);
        });
        break;

      case "run-json":
        return res.json({
          status: "success",
          message: "Received JSON",
          echo: data,
        });

      default:
        return res.send(`❌ Unknown action type: ${action}`);
    }
  } catch (err) {
    res.status(500).send(`🔥 Server error:\n${err.message}`);
  }
});

app.listen(PORT, () => {
  console.log(`🧠 Replicon Local AI Runner is live on http://localhost:${PORT}`);
});
