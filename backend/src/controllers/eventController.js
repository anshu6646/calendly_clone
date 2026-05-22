const pool = require("../db");

const DEFAULT_USER_ID = 1;

async function getEventTypes(req, res, next) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM event_types WHERE user_id = ? ORDER BY created_at DESC",
      [DEFAULT_USER_ID]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function createEventType(req, res, next) {
  try {
    const { name, slug, description, duration_minutes } = req.body;
    if (!name || !slug || !duration_minutes) {
      return res.status(400).json({ message: "Name, slug, and duration are required" });
    }

    const [result] = await pool.query(
      "INSERT INTO event_types (user_id, name, slug, description, duration_minutes) VALUES (?, ?, ?, ?, ?)",
      [DEFAULT_USER_ID, name, slug, description || "", Number(duration_minutes)]
    );

    const [rows] = await pool.query("SELECT * FROM event_types WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Slug already exists. Choose a unique URL slug." });
    }
    next(err);
  }
}

async function updateEventType(req, res, next) {
  try {
    const { id } = req.params;
    const { name, slug, description, duration_minutes } = req.body;

    await pool.query(
      "UPDATE event_types SET name = ?, slug = ?, description = ?, duration_minutes = ? WHERE id = ? AND user_id = ?",
      [name, slug, description || "", Number(duration_minutes), id, DEFAULT_USER_ID]
    );

    const [rows] = await pool.query("SELECT * FROM event_types WHERE id = ?", [id]);
    if (!rows.length) return res.status(404).json({ message: "Event type not found" });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Slug already exists. Choose a unique URL slug." });
    }
    next(err);
  }
}

async function deleteEventType(req, res, next) {
  try {
    const { id } = req.params;
    const [existingBookings] = await pool.query(
      "SELECT id FROM bookings WHERE event_type_id = ? LIMIT 1",
      [id]
    );

    if (existingBookings.length) {
      return res.status(409).json({
        message: "This event type has bookings, so it cannot be deleted.",
      });
    }

    const [result] = await pool.query(
      "DELETE FROM event_types WHERE id = ? AND user_id = ?",
      [id, DEFAULT_USER_ID]
    );

    if (!result.affectedRows) return res.status(404).json({ message: "Event type not found" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createEventType,
  deleteEventType,
  getEventTypes,
  updateEventType,
};
