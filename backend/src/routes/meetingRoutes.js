const express = require("express");
const {
  cancelMeeting,
  listMeetings,
} = require("../controllers/meetingController");

const router = express.Router();

router.get("/", listMeetings);
router.patch("/:id/cancel", cancelMeeting);

module.exports = router;
