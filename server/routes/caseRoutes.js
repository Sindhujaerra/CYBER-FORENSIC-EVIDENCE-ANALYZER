const express = require("express");
const Case = require("../models/Case");
const Timeline = require("../models/Timeline");

const router = express.Router();

router.post("/", async (req, res) => {
  const newCase = await Case.create(req.body);
  res.json(newCase);
});

router.put("/status/:id", async (req, res) => {
  try {
    const { status } = req.body;
    if (!['open', 'pending', 'closed'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const caseItem = await Case.findById(req.params.id);
    if (!caseItem) {
      return res.status(404).json({ message: "Case not found" });
    }

    const oldStatus = caseItem.status;
    caseItem.status = status;
    
    if (status === 'closed') {
      caseItem.closedAt = new Date();
    } else if (oldStatus === 'closed') {
      caseItem.closedAt = undefined;
    }

    await caseItem.save();

    await Timeline.create({
      eventType: "CASE_STATUS_CHANGED",
      description: `Case "${caseItem.name}" status changed from ${oldStatus} to ${status}`,
      evidenceId: "",
    });

    res.json(caseItem);
  } catch (err) {
    console.error("Error updating case status:", err);
    res.status(500).json({ message: "Error updating case status" });
  }
});

router.get("/", async (req, res) => {
  const cases = await Case.find().sort({ createdAt: -1 });
  res.json(cases);
});

module.exports = router;
