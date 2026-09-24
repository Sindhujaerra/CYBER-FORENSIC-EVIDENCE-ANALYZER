const express = require("express")
const multer = require("multer")
const crypto = require("crypto")
const fs = require("fs")
const path = require("path")

const Evidence = require("../models/Evidence")
const Timeline = require("../models/Timeline")

const router = express.Router()

/* ---------- STORAGE ---------- */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname)
  }
})

const upload = multer({ storage })

/* ---------- HASH FUNCTION ---------- */
function generateHashes(filePath) {
  const buffer = fs.readFileSync(filePath)

  return {
    md5: crypto.createHash("md5").update(buffer).digest("hex"),
    sha1: crypto.createHash("sha1").update(buffer).digest("hex"),
    sha256: crypto.createHash("sha256").update(buffer).digest("hex")
  }
}

/* ---------- UPLOAD ---------- */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);
    const md5 = crypto.createHash("md5").update(fileBuffer).digest("hex");
    const sha1 = crypto.createHash("sha1").update(fileBuffer).digest("hex");
    const sha256 = crypto.createHash("sha256").update(fileBuffer).digest("hex");

    console.log("Uploading file:", req.file.originalname);
    console.log("File path:", filePath);
    console.log("Calculated SHA256:", sha256);

    const evidence = await Evidence.create({
      fileName: req.file.originalname,
      path: filePath, // Store absolute path
      size: req.file.size,
      mimetype: req.file.mimetype,
      md5,
      sha1,
      sha256
    });

    await Timeline.create({
      eventType: "UPLOADED",
      description: `Uploaded: ${req.file.originalname}`,
      evidenceId: evidence._id.toString(),
    });

    res.json({
      id: evidence._id,
      name: evidence.fileName,
      size: evidence.size,
      type: evidence.mimetype,
      uploadDate: evidence.createdAt,
      fileUrl: `http://localhost:5000/uploads/${req.file.filename}`,
      hashes: { md5, sha1, sha256 },
      metadata: {
        mimeType: evidence.mimetype,
        extension: evidence.fileName.split(".").pop(),
        lastModified: new Date()
      },
      status: evidence.status || "unknown"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
})

/* ---------- GET ALL ---------- */
router.get("/", async (req, res) => {
  try {
    const files = await Evidence.find().sort({ createdAt: -1 });
    const mapped = files.map(file => {
      const fileName = file.filename || file.fileName || "unknown";
      const filePath = file.filepath || file.path || "";
      // For fileUrl, extract filename from path
      const pathParts = filePath.split(/[/\\]/);
      const filename = pathParts[pathParts.length - 1];
      return {
        id: file._id,
        name: fileName,
        size: file.filesize || file.size || 0,
        type: file.mimetype || "unknown",
        uploadDate: file.createdAt || new Date(),
        fileUrl: filename ? `http://localhost:5000/uploads/${filename}` : "",
        hashes: {
          md5: file.md5 || "N/A",
          sha1: file.sha1 || "N/A",
          sha256: file.sha256 || "N/A",
        },
        metadata: {
          mimeType: file.mimetype || "unknown",
          extension: fileName.includes(".") ? fileName.split(".").pop() : "unknown",
          lastModified: file.createdAt || new Date(),
        },
        status: file.status || "unknown",
        lastVerified: file.lastVerified,
      };
    });
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
})

/* ---------- TIMELINE ---------- */
router.get("/timeline", async (req, res) => {
  try {
    const events = await Timeline.find().sort({ createdAt: -1 });
    const mapped = events.map((e) => ({
      id: e._id,
      type: e.eventType.toLowerCase(),
      description: e.description,
      fileId: e.evidenceId,
      timestamp: e.createdAt,
    }));
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
})

/* ---------- VIEW FILE ---------- */
router.get("/file/:id", async (req, res) => {
  try {
    const file = await Evidence.findById(req.params.id)

    if (!file) return res.status(404).send("File not found")

    res.sendFile(file.path)
  } catch (err) {
    res.status(500).send("Error")
  }
})

/* ---------- VERIFY ---------- */
router.get("/verify/:id", async (req, res) => {
  try {
    const file = await Evidence.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ status: "not_found" });
    }
    console.log("Verifying file:", file.fileName);
    console.log("Stored path:", file.path);
    console.log("Stored SHA256:", file.sha256);
    console.log("Current working directory:", process.cwd());

    const resolvedPath = file.path; // Already absolute path
    console.log("Resolved path:", resolvedPath);
    console.log("File exists:", fs.existsSync(resolvedPath));

    if (!fs.existsSync(resolvedPath)) {
      console.log("File not found at path!");
      return res.status(500).json({ status: "file_not_found", message: "File not found on disk" });
    }

    const fileBuffer = fs.readFileSync(resolvedPath);
    const newHash = crypto
      .createHash("sha256")
      .update(fileBuffer)
      .digest("hex");

    console.log("Current SHA256:", newHash);
    console.log("Hashes match:", newHash === file.sha256);

    let status = "modified";
    if (newHash === file.sha256) {
      status = "not tampered";
    }

    console.log("Setting status to:", status);

    // Only update if status changed
    if (file.status !== status) {
      file.status = status;
      file.lastVerified = new Date();
      await file.save();

      await Timeline.create({
        eventType: status === "modified" ? "MODIFIED" : "VERIFIED",
        description: status === "modified" ? `File modified - hashes don't match` : `File verified - not tampered`,
        evidenceId: file._id.toString(),
      });
    }

    res.json({ 
      status,
      storedHash: file.sha256,
      currentHash: newHash,
      fileName: file.fileName
    });
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
})

/* ---------- SIMULATE TAMPERING ---------- */
router.post("/tamper/:id", async (req, res) => {
  try {
    const file = await Evidence.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    const resolvedPath = file.path; // Already absolute path
    console.log("Attempting to tamper file at:", resolvedPath);
    
    if (!fs.existsSync(resolvedPath)) {
      console.log("File does not exist at path");
      return res.status(404).json({ error: "File not found on disk" });
    }

    // Read the file, modify one byte, and write back to simulate tampering
    const buffer = fs.readFileSync(resolvedPath);
    if (buffer.length > 0) {
      // Flip one bit in the first byte to simulate tampering
      buffer[0] = buffer[0] ^ 0x01;
      fs.writeFileSync(resolvedPath, buffer);
    } else {
      // For empty files, add some content
      fs.writeFileSync(resolvedPath, Buffer.from("TAMPERED"));
    }

    console.log("Successfully tampered file:", file.fileName);

    await Timeline.create({
      eventType: "MODIFIED",
      description: `File modified for testing`,
      evidenceId: file._id.toString(),
    });

    res.json({ message: "File tampered for testing" });
  } catch (err) {
    console.error("Tamper simulation error:", err);
    res.status(500).json({ error: "Failed to tamper file: " + err.message });
  }
})

module.exports = router