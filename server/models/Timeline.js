const mongoose = require("mongoose");

const TimelineSchema = new mongoose.Schema({
  eventType: String,
  description: String,
  evidenceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Evidence",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Timeline", TimelineSchema);
