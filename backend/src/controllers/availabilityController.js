const pool = require("../db");

const DEFAULT_USER_ID = 1;

async function getAvailability(req, res, next) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM availability_rules WHERE user_id = ? ORDER BY day_of_week ASC, start_time ASC",
      [DEFAULT_USER_ID]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function createAvailability(req, res, next) {
  try {
    const { day_of_week, start_time, end_time, timezone } = req.body;
    if (day_of_week === undefined || !start_time || !end_time) {
      return res.status(400).json({ message: "Day, start time, and end time are required" });
    }

    const [result] = await pool.query(
      "INSERT INTO availability_rules (user_id, day_of_week, start_time, end_time, timezone) VALUES (?, ?, ?, ?, ?)",
      [DEFAULT_USER_ID, Number(day_of_week), start_time, end_time, timezone || "Asia/Kolkata"]
    );

    const [rows] = await pool.query("SELECT * FROM availability_rules WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function updateAvailability(req, res, next) {
  try {
    const { id } = req.params;
    const { day_of_week, start_time, end_time, timezone } = req.body;

    await pool.query(
      "UPDATE availability_rules SET day_of_week = ?, start_time = ?, end_time = ?, timezone = ? WHERE id = ? AND user_id = ?",
      [Number(day_of_week), start_time, end_time, timezone || "Asia/Kolkata", id, DEFAULT_USER_ID]
    );

    const [rows] = await pool.query("SELECT * FROM availability_rules WHERE id = ?", [id]);
    if (!rows.length) return res.status(404).json({ message: "Availability rule not found" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function deleteAvailability(req, res, next) {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      "DELETE FROM availability_rules WHERE id = ? AND user_id = ?",
      [id, DEFAULT_USER_ID]
    );

    if (!result.affectedRows) return res.status(404).json({ message: "Availability rule not found" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createAvailability,
  deleteAvailability,
  getAvailability,
  updateAvailability,
};
