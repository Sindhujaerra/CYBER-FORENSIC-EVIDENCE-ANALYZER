const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");

const Evidence = require("../models/Evidence");
const Timeline = require("../models/Timeline");

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });


router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path
    const fileBuffer = fs.readFileSync(filePath)

    const md5 = crypto.createHash("md5").update(fileBuffer).digest("hex")
    const sha1 = crypto.createHash("sha1").update(fileBuffer).digest("hex")
    const sha256 = crypto.createHash("sha256").update(fileBuffer).digest("hex")

    const evidence = await Evidence.create({
      filename: req.file.originalname,
      filepath: filePath,
      filesize: req.file.size,
      mimetype: req.file.mimetype,
      md5,
      sha1,
      sha256,
    })

    await Timeline.create({
      eventType: "UPLOADED",
      description: `File ${req.file.originalname} uploaded`,
      evidenceId: evidence._id,
    })

    res.json(evidence)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Upload failed" })
  }
})


// get all evidence
router.get("/", async (req, res) => {
  const data = await Evidence.find().sort({ uploadedAt: -1 });
  res.json(data);
});

module.exports = router;
