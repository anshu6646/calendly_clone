const pool = require("../db");

async function listMeetings(req, res, next) {
  try {
    const { type = "upcoming" } = req.query;
    let whereClause = "bookings.status = 'scheduled' AND TIMESTAMP(bookings.booking_date, bookings.start_time) >= NOW()";

    if (type === "past") {
      whereClause = "bookings.status = 'scheduled' AND TIMESTAMP(bookings.booking_date, bookings.start_time) < NOW()";
    }

    if (type === "cancelled") {
      whereClause = "bookings.status = 'cancelled'";
    }

    const [rows] = await pool.query(
      `SELECT bookings.*, event_types.name AS event_name, event_types.slug
       FROM bookings
       JOIN event_types ON event_types.id = bookings.event_type_id
       WHERE ${whereClause}
       ORDER BY bookings.booking_date ASC, bookings.start_time ASC`
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function cancelMeeting(req, res, next) {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      "UPDATE bookings SET status = 'cancelled' WHERE id = ?",
      [id]
    );

    if (!result.affectedRows) return res.status(404).json({ message: "Meeting not found" });

    const [rows] = await pool.query(
      `SELECT bookings.*, event_types.name AS event_name
       FROM bookings
       JOIN event_types ON event_types.id = bookings.event_type_id
       WHERE bookings.id = ?`,
      [id]
    );

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  cancelMeeting,
  listMeetings,
};
