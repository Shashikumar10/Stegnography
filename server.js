const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const steg = require("./steg.js");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.static(__dirname)); 

// ================= EMBED =================
app.post("/embed", upload.single("masterFile"), (req, res) => {
  const masterFile = req.file;
  const { message, password } = req.body;

  if (!masterFile || !message || !password)
    return res.status(400).json({ error: "Missing file, message, or password" });

  try {
    const buffer = fs.readFileSync(masterFile.path);
    const stegoBuffer = steg.embedMessage(buffer, message, password);

    const stegoName = `stego_${Date.now()}_${masterFile.originalname}`;
    const stegoPath = path.join(__dirname, "uploads", stegoName);
    fs.writeFileSync(stegoPath, stegoBuffer);

    res.download(stegoPath, stegoName, () => {
      fs.unlinkSync(masterFile.path);
      fs.unlinkSync(stegoPath);
    });
  } catch (err) {
    if (masterFile?.path && fs.existsSync(masterFile.path)) fs.unlinkSync(masterFile.path);
    console.error(err);
    res.status(500).json({ error: "Embedding failed", details: err.message });
  }
});

// ================= EXTRACT =================
app.post("/extract", upload.single("stegoFile"), (req, res) => {
  const stegoFile = req.file;
  const { password } = req.body;

  if (!stegoFile || !password)
    return res.status(400).json({ error: "Missing stego file or password" });

  try {
    const buffer = fs.readFileSync(stegoFile.path);
    const message = steg.extractMessage(buffer, password);

    res.send(message); // plain text
    fs.unlinkSync(stegoFile.path);
  } catch (err) {
    if (stegoFile?.path && fs.existsSync(stegoFile.path)) fs.unlinkSync(stegoFile.path);
    console.error(err);
    res.status(500).json({ error: "Extraction failed", details: err.message });
  }
});

// ================= START SERVER =================
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
