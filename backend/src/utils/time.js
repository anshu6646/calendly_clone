function toMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function toTime(minutes) {
  const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mins = String(minutes % 60).padStart(2, "0");
  return `${hours}:${mins}:00`;
}

function displayTime(time) {
  return time.slice(0, 5);
}

function displayTime12(time) {
  const [hourString, minuteString] = time.split(":");
  const hour = Number(hourString);
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minuteString} ${suffix}`;
}

function getDayOfWeek(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return date.getDay();
}

function isPastDateTime(dateString, timeString) {
  const now = new Date();
  const slotDate = new Date(`${dateString}T${timeString}`);
  return slotDate <= now;
}

function generateSlots(startTime, endTime, durationMinutes) {
  const slots = [];
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);

  for (let current = start; current + durationMinutes <= end; current += durationMinutes) {
    slots.push({
      start_time: toTime(current),
      end_time: toTime(current + durationMinutes),
      label: displayTime(toTime(current)),
      display_label: displayTime12(toTime(current)),
    });
  }

  return slots;
}

module.exports = {
  displayTime,
  displayTime12,
  generateSlots,
  getDayOfWeek,
  isPastDateTime,
};
