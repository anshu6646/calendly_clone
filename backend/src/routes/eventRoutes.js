const express = require("express");
const {
  createEventType,
  deleteEventType,
  getEventTypes,
  updateEventType,
} = require("../controllers/eventController");

const router = express.Router();

router.get("/", getEventTypes);
router.post("/", createEventType);
router.put("/:id", updateEventType);
router.delete("/:id", deleteEventType);

module.exports = router;
