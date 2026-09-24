const express = require("express");
const router = express.Router();
const Evidence = require("../models/Evidence");

router.get("/dashboard", async (req, res) => {
  try {
    const files = await Evidence.find();

    let totalFiles = files.length;
    let totalSize = 0;

    let images = 0;
    let videos = 0;
    let audio = 0;
    let documents = 0;

    files.forEach((file) => {
      totalSize += file.size;

      if (file.mimeType?.startsWith("image")) images++;
      else if (file.mimeType?.startsWith("video")) videos++;
      else if (file.mimeType?.startsWith("audio")) audio++;
      else documents++;
    });

    res.json({
      totalFiles,
      totalSize,
      images,
      videos,
      audio,
      documents,
    });
  } catch (err) {
    res.status(500).json({ error: "Analyzer failed" });
  }
});

module.exports = router;