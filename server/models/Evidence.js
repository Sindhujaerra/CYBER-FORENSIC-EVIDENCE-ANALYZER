const mongoose = require("mongoose")

const EvidenceSchema = new mongoose.Schema({
  fileName: String,
  path: String,
  size: Number,
  mimetype: String,
  createdAt: {
    type: Date,
    default: Date.now
  },

  md5: String,
  sha1: String,
  sha256: String,
  status: {
    type: String,
    enum: ["verified", "tampered", "unknown"],
    default: "unknown"
  },
  lastVerified: {
    type: Date,
    default: null
  }
})

module.exports = mongoose.model("Evidence", EvidenceSchema)