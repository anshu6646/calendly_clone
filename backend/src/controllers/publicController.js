const pool = require("../db");
const { generateSlots, getDayOfWeek, isPastDateTime } = require("../utils/time");

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeStartTime(time) {
  return time.length === 5 ? `${time}:00` : time;
}

function formatTime12(time) {
  const [hourString, minuteString] = time.split(":");
  const hour = Number(hourString);
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minuteString} ${suffix}`;
}

function buildAvailabilitySummary(rules) {
  if (!rules.length) return "No availability configured";

  const dayNumbers = [...new Set(rules.map((r) => r.day_of_week))].sort((a, b) => a - b);
  const allWeekdays = dayNumbers.length === 5 && [1, 2, 3, 4, 5].every((d) => dayNumbers.includes(d));
  const dayLabel = allWeekdays
    ? "Weekdays"
    : dayNumbers.map((d) => DAY_NAMES[d].slice(0, 3)).join(", ");

  const earliest = rules.reduce((min, r) => (r.start_time < min ? r.start_time : min), rules[0].start_time);
  const latest = rules.reduce((max, r) => (r.end_time > max ? r.end_time : max), rules[0].end_time);

  return `${dayLabel}, ${formatTime12(earliest)} - ${formatTime12(latest)}`;
}

async function getPublicEvent(req, res, next) {
  try {
    const { slug } = req.params;
    const [eventRows] = await pool.query(
      `SELECT event_types.*, users.name AS host_name, users.email AS host_email, users.timezone AS host_timezone
       FROM event_types
       JOIN users ON users.id = event_types.user_id
       WHERE event_types.slug = ?`,
      [slug]
    );

    if (!eventRows.length) return res.status(404).json({ message: "Event type not found" });

    const event = eventRows[0];
    const [availabilityRows] = await pool.query(
      "SELECT day_of_week, start_time, end_time, timezone FROM availability_rules WHERE user_id = ? ORDER BY day_of_week ASC, start_time ASC",
      [event.user_id]
    );

    res.json({
      ...event,
      meeting_type: "One-on-One",
      meeting_platform: "Google Meet",
      available_days: [...new Set(availabilityRows.map((rule) => rule.day_of_week))],
      availability: availabilityRows,
      availability_summary: buildAvailabilitySummary(availabilityRows),
    });
  } catch (err) {
    next(err);
  }
}

async function getSlots(req, res, next) {
  try {
    const slug = req.params.slug || req.query.slug;
    const { date } = req.query;
    if (!slug) return res.status(400).json({ message: "Event slug is required" });
    if (!date) return res.status(400).json({ message: "Date is required" });

    const [eventRows] = await pool.query("SELECT * FROM event_types WHERE slug = ?", [slug]);
    if (!eventRows.length) return res.status(404).json({ message: "Event type not found" });

    const eventType = eventRows[0];
    const dayOfWeek = getDayOfWeek(date);

    const [availabilityRows] = await pool.query(
      "SELECT * FROM availability_rules WHERE user_id = ? AND day_of_week = ? ORDER BY start_time ASC",
      [eventType.user_id, dayOfWeek]
    );

    // Fetch ALL bookings for this host on this date (across all event types)
    const [bookingRows] = await pool.query(
      `SELECT b.start_time, b.end_time FROM bookings b
       JOIN event_types et ON et.id = b.event_type_id
       WHERE et.user_id = ? AND b.booking_date = ? AND b.status = 'scheduled'`,
      [eventType.user_id, date]
    );

    const allSlots = availabilityRows.flatMap((rule) =>
      generateSlots(rule.start_time, rule.end_time, eventType.duration_minutes)
    );

    // Filter out slots that overlap with ANY existing booking for this host
    const availableSlots = allSlots
      .filter((slot) => !bookingRows.some((b) => slot.start_time < b.end_time && slot.end_time > b.start_time))
      .filter((slot) => !isPastDateTime(date, slot.start_time));

    res.json({
      date,
      timezone: availabilityRows[0]?.timezone || "Asia/Kolkata",
      slots: availableSlots,
    });
  } catch (err) {
    next(err);
  }
}

async function createBooking(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const slug = req.params.slug || req.body.slug;
    const {
      invitee_name,
      invitee_email,
      invitee_notes,
      booking_date,
      start_time,
      timezone,
    } = req.body;

    if (!slug) return res.status(400).json({ message: "Event slug is required" });
    if (!invitee_name || !invitee_email || !booking_date || !start_time) {
      return res.status(400).json({ message: "Name, email, date, and time are required" });
    }
    if (!isValidEmail(invitee_email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    await connection.beginTransaction();

    const [eventRows] = await connection.query("SELECT * FROM event_types WHERE slug = ?", [slug]);
    if (!eventRows.length) {
      await connection.rollback();
      return res.status(404).json({ message: "Event type not found" });
    }

    const eventType = eventRows[0];
    const dayOfWeek = getDayOfWeek(booking_date);
    const [availabilityRows] = await connection.query(
      "SELECT * FROM availability_rules WHERE user_id = ? AND day_of_week = ?",
      [eventType.user_id, dayOfWeek]
    );

    const validSlots = availabilityRows.flatMap((rule) =>
      generateSlots(rule.start_time, rule.end_time, eventType.duration_minutes)
    );
    const normalizedStartTime = normalizeStartTime(start_time);
    const selectedSlot = validSlots.find((slot) => slot.start_time === normalizedStartTime);

    if (!selectedSlot || isPastDateTime(booking_date, selectedSlot.start_time)) {
      await connection.rollback();
      return res.status(400).json({ message: "Selected time is not available" });
    }

    // Check for overlapping bookings across ALL event types for this host
    const [existingRows] = await connection.query(
      `SELECT b.id FROM bookings b
       JOIN event_types et ON et.id = b.event_type_id
       WHERE et.user_id = ? AND b.booking_date = ? AND b.status = 'scheduled'
       AND b.start_time < ? AND b.end_time > ?
       FOR UPDATE`,
      [eventType.user_id, booking_date, selectedSlot.end_time, selectedSlot.start_time]
    );

    if (existingRows.length) {
      await connection.rollback();
      return res.status(409).json({ message: "This time slot overlaps with an existing booking." });
    }

    const [result] = await connection.query(
      `INSERT INTO bookings
       (event_type_id, invitee_name, invitee_email, invitee_notes, booking_date, start_time, end_time, timezone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        eventType.id,
        invitee_name,
        invitee_email,
        invitee_notes || null,
        booking_date,
        selectedSlot.start_time,
        selectedSlot.end_time,
        timezone || availabilityRows[0]?.timezone || "Asia/Kolkata",
      ]
    );

    const [bookingRows] = await connection.query(
      `SELECT bookings.*, event_types.name AS event_name, event_types.slug,
              event_types.duration_minutes, users.name AS host_name,
              users.email AS host_email
       FROM bookings
       JOIN event_types ON event_types.id = bookings.event_type_id
       JOIN users ON users.id = event_types.user_id
       WHERE bookings.id = ?`,
      [result.insertId]
    );

    await connection.commit();
    res.status(201).json(bookingRows[0]);
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
}

module.exports = {
  createBooking,
  getPublicEvent,
  getSlots,
};
