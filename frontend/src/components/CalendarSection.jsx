import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function CalendarSection({ selectedDate, onSelectDate, availableDays = [] }) {
  const [visibleMonth, setVisibleMonth] = useState(dayjs(selectedDate || undefined).startOf("month"));
  const today = dayjs().startOf("day");
  const availableDaySet = useMemo(() => new Set(availableDays), [availableDays]);

  const cells = useMemo(() => {
    const startOffset = visibleMonth.day();
    const daysInMonth = visibleMonth.daysInMonth();
    return Array.from({ length: startOffset + daysInMonth }, (_, index) => {
      if (index < startOffset) return null;
      return visibleMonth.date(index - startOffset + 1);
    });
  }, [visibleMonth]);

  function isAvailable(date) {
    return !date.isBefore(today) && availableDaySet.has(date.day());
  }

  return (
    <section className="rounded-xl bg-white">
      <div className="mb-5 flex items-center justify-between">
        <button
          className="rounded-xl p-2 text-slate-600 transition hover:bg-[#e8f0fe]"
          type="button"
          onClick={() => setVisibleMonth(visibleMonth.subtract(1, "month"))}
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-base font-bold text-slate-950">{visibleMonth.format("MMMM YYYY")}</h2>
        <button
          className="rounded-xl p-2 text-slate-600 transition hover:bg-[#e8f0fe]"
          type="button"
          onClick={() => setVisibleMonth(visibleMonth.add(1, "month"))}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-[#64748b]">
        {weekdays.map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} className="aspect-square" />;

          const value = date.format("YYYY-MM-DD");
          const selected = value === selectedDate;
          const available = isAvailable(date);

          return (
            <button
              key={value}
              className={`aspect-square rounded-full text-sm font-bold transition ${
                selected
                  ? "bg-brand-blue text-white shadow-sm"
                  : available
                    ? "text-slate-800 hover:bg-[#e8f0fe] hover:text-brand-blue"
                    : "cursor-not-allowed text-slate-300"
              }`}
              disabled={!available}
              type="button"
              onClick={() => onSelectDate(value)}
            >
              {date.date()}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default CalendarSection;
