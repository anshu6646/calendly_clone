import { Clock3 } from "lucide-react";

function TimeSlots({ dateLabel, loading, slots, selectedSlot, onSelectSlot }) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-950">Available Times</h2>
          <p className="text-sm text-[#64748b]">{dateLabel}</p>
        </div>
        <Clock3 size={18} className="text-brand-blue" />
      </div>

      <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
        {loading ? (
          Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="h-11 animate-pulse rounded-xl bg-slate-100" />
          ))
        ) : slots.length ? (
          slots.map((slot) => (
            <button
              key={slot.start_time}
              className={`w-full rounded-xl border px-4 py-3 text-center text-sm font-bold transition ${
                selectedSlot?.start_time === slot.start_time
                  ? "border-brand-blue bg-brand-blue text-white"
                  : "border-blue-200 bg-white text-brand-blue hover:border-brand-blue hover:bg-[#e8f0fe]"
              }`}
              type="button"
              onClick={() => onSelectSlot(slot)}
            >
              {slot.display_label || slot.label}
            </button>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-[#e5e7eb] p-4 text-center text-sm text-[#64748b]">
            No times are available for this date.
          </div>
        )}
      </div>
    </section>
  );
}

export default TimeSlots;
