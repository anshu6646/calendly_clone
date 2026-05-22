import { Loader2, MessageSquare, User } from "lucide-react";

function BookingForm({ selectedSlot, form, setForm, loading, onSubmit }) {
  return (
    <form className="rounded-xl border border-[#e5e7eb] bg-white p-4" onSubmit={onSubmit}>
      <div className="flex items-center gap-2">
        <User size={17} className="text-brand-blue" />
        <h2 className="text-base font-bold text-slate-950">Enter Details</h2>
      </div>
      <p className="mt-1 text-sm text-[#64748b]">
        {selectedSlot ? `Selected time: ${selectedSlot.display_label || selectedSlot.label}` : "Choose a time to continue."}
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <label className="label" htmlFor="invitee-name">
            Full name
          </label>
          <input
            className="input mt-1"
            id="invitee-name"
            value={form.invitee_name}
            onChange={(event) => setForm({ ...form, invitee_name: event.target.value })}
            placeholder="Your full name"
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="invitee-email">
            Email
          </label>
          <input
            className="input mt-1"
            id="invitee-email"
            type="email"
            value={form.invitee_email}
            onChange={(event) => setForm({ ...form, invitee_email: event.target.value })}
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label className="label flex items-center gap-2" htmlFor="invitee-notes">
            <MessageSquare size={14} />
            Notes
          </label>
          <textarea
            className="input mt-1 min-h-20"
            id="invitee-notes"
            value={form.invitee_notes}
            onChange={(event) => setForm({ ...form, invitee_notes: event.target.value })}
            placeholder="Please share anything that will help prepare for the meeting."
          />
        </div>

        <button className="btn-primary w-full" disabled={!selectedSlot || loading} type="submit">
          {loading ? <Loader2 className="animate-spin" size={16} /> : null}
          {loading ? "Scheduling..." : "Schedule Event"}
        </button>
      </div>
    </form>
  );
}

export default BookingForm;
