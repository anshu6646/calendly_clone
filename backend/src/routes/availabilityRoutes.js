const express = require("express");
const {
  createAvailability,
  deleteAvailability,
  getAvailability,
  updateAvailability,
} = require("../controllers/availabilityController");

const router = express.Router();

router.get("/", getAvailability);
router.post("/", createAvailability);
router.put("/:id", updateAvailability);
router.delete("/:id", deleteAvailability);

module.exports = router;
