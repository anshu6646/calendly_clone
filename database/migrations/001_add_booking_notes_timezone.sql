USE calendly_clone_assignment;

ALTER TABLE bookings
  ADD COLUMN invitee_notes TEXT NULL AFTER invitee_email,
  ADD COLUMN timezone VARCHAR(100) NOT NULL DEFAULT 'Asia/Kolkata' AFTER end_time;
