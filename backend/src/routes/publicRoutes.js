const express = require("express");
const {
  createBooking,
  getPublicEvent,
  getSlots,
} = require("../controllers/publicController");

const router = express.Router();

router.get("/event/:slug", getPublicEvent);
router.get("/slots", getSlots);
router.post("/book", createBooking);

router.get("/:slug", getPublicEvent);
router.get("/:slug/slots", getSlots);
router.post("/:slug/book", createBooking);

module.exports = router;
