require('dotenv').config();
const connectDB = require('./config/db');
connectDB();

const express = require("express")
const cors = require("cors")
const multer = require("multer")
const crypto = require("crypto")
const fs = require("fs")
const path = require("path")

const app = express()

app.use(cors())
app.use(express.json())

/* ---------- STATIC FILE SERVING ---------- */
app.use("/uploads", express.static("uploads"))

const auth = require("./middleware/auth");
const authRouter = require("./routes/auth");
const evidenceRouter = require("./routes/evidence");
const caseRouter = require("./routes/caseRoutes");

app.use("/api/auth", authRouter)
app.use("/api/evidence", auth, evidenceRouter)
app.use("/api/cases", auth, caseRouter)

// DEBUG: show evidence router routes
if (evidenceRouter.stack) {
  console.log('Evidence router routes:');
  evidenceRouter.stack.forEach(layer => {
    if (layer.route) {
      const method = Object.keys(layer.route.methods)[0].toUpperCase();
      console.log(' ', method, layer.route.path);
    }
  });
}

// DEBUG: print registered routes
const getRoutes = () => {
  const routes = [];
  if (!app._router || !app._router.stack) {
    return routes;
  }

  app._router.stack.forEach(mw => {
    if (mw.route) {
      const methods = Object.keys(mw.route.methods).join(',').toUpperCase();
      routes.push(`${methods} ${mw.route.path}`);
    } else if (mw.name === 'router' && mw.handle && mw.handle.stack) {
      mw.handle.stack.forEach(handler => {
        if (handler.route) {
          const methods = Object.keys(handler.route.methods).join(',').toUpperCase();
          routes.push(`${methods} ${handler.route.path}`);
        }
      });
    }
  });
  return routes;
};
console.log('Routes:', getRoutes());

/* ---------- UPLOAD DIRECTORY ---------- */

const uploadDir = path.join(__dirname, "uploads")

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir)
}

/* ---------- MULTER STORAGE ---------- */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname)
  },
})

const upload = multer({ storage })

/* ---------- HASH FUNCTION ---------- */

function generateHashes(filePath) {
  const fileBuffer = fs.readFileSync(filePath)

  return {
    md5: crypto.createHash("md5").update(fileBuffer).digest("hex"),
    sha1: crypto.createHash("sha1").update(fileBuffer).digest("hex"),
    sha256: crypto.createHash("sha256").update(fileBuffer).digest("hex"),
  }
}

/* ---------- START SERVER ---------- */

app.listen(5000, () => {
  console.log("🔥 Backend running on http://localhost:5000")
})
