const mongoose = require("mongoose");

const CaseSchema = new mongoose.Schema({
  name: String,
  description: String,
  investigator: String,
  status: {
    type: String,
    default: "open", // open | pending | closed
  },
  closedAt: Date,
  evidenceFiles: {
    type: Array,
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Case", CaseSchema);
