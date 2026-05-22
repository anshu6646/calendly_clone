import { CalendarPlus, Plus, Save } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/client";
import AdminLayout from "../components/AdminLayout";
import EventTypeCard from "../components/EventTypeCard";

const emptyForm = {
  id: null,
  name: "",
  slug: "",
  description: "",
  duration_minutes: 30,
};

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function EventTypes() {
  const [eventTypes, setEventTypes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadEventTypes() {
    setLoading(true);
    const { data } = await api.get("/event-types");
    setEventTypes(data);
    setLoading(false);
  }

  useEffect(() => {
    loadEventTypes().catch(() => setLoading(false));
  }, []);

  function handleNameChange(name) {
    setForm((current) => ({
      ...current,
      name,
      slug: current.id ? current.slug : slugify(name),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    try {
      if (form.id) {
        await api.put(`/event-types/${form.id}`, form);
        setMessage("Event type updated.");
      } else {
        await api.post("/event-types", form);
        setMessage("Event type created.");
      }
      setForm(emptyForm);
      await loadEventTypes();
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to save event type.");
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Delete this event type?");
    if (!confirmed) return;

    try {
      await api.delete(`/event-types/${id}`);
      await loadEventTypes();
      setMessage("Event type deleted.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to delete event type.");
    }
  }

  return (
    <AdminLayout
      title="Event Types"
      subtitle="Create and manage Calendly-style scheduling links."
    >
      <section className="grid gap-5 lg:grid-cols-[340px_1fr]">
        <form className="panel h-fit p-4" onSubmit={handleSubmit}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f0fe] text-brand-blue">
              <CalendarPlus size={19} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-950">
                {form.id ? "Edit event type" : "New event type"}
              </h3>
              <p className="text-xs text-[#64748b]">Set link, length, and description.</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div>
              <label className="label" htmlFor="event-name">
                Event name
              </label>
              <input
                className="input mt-1"
                id="event-name"
                value={form.name}
                onChange={(event) => handleNameChange(event.target.value)}
                placeholder="30 Minute Meeting"
              />
            </div>

            <div>
              <label className="label" htmlFor="event-slug">
                URL slug
              </label>
              <input
                className="input mt-1"
                id="event-slug"
                value={form.slug}
                onChange={(event) => setForm({ ...form, slug: slugify(event.target.value) })}
                placeholder="30-minute-meeting"
              />
            </div>

            <div>
              <label className="label" htmlFor="event-duration">
                Duration
              </label>
              <select
                className="input mt-1"
                id="event-duration"
                value={form.duration_minutes}
                onChange={(event) => setForm({ ...form, duration_minutes: Number(event.target.value) })}
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>

            <div>
              <label className="label" htmlFor="event-description">
                Description
              </label>
              <textarea
                className="input mt-1 min-h-20"
                id="event-description"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="A quick intro or status call."
              />
            </div>

            {message ? <p className="text-sm text-slate-600">{message}</p> : null}

            <div className="flex gap-2">
              <button className="btn-primary" type="submit">
                {form.id ? <Save size={16} /> : <Plus size={16} />}
                {form.id ? "Save changes" : "Create"}
              </button>
              {form.id ? (
                <button className="btn-secondary" type="button" onClick={() => setForm(emptyForm)}>
                  Cancel
                </button>
              ) : null}
            </div>
          </div>
        </form>

        <div>
          <div className="mb-3 flex items-center justify-between rounded-xl border border-[#e5e7eb] bg-white px-4 py-3">
            <div>
              <h3 className="text-sm font-bold text-slate-950">Active event types</h3>
              <p className="text-xs text-[#64748b]">{eventTypes.length} scheduling links</p>
            </div>
            <div className="hidden rounded-full bg-[#e8f0fe] px-3 py-1 text-xs font-bold text-brand-blue sm:block">
              One-on-One
            </div>
          </div>

          <div className="space-y-3">
          {loading ? (
            <p className="text-sm text-slate-500">Loading event types...</p>
          ) : eventTypes.length ? (
            eventTypes.map((eventType) => (
              <EventTypeCard
                key={eventType.id}
                eventType={eventType}
                onEdit={(selected) => setForm(selected)}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="panel p-8 text-center">
              <p className="text-sm text-slate-600">Create your first event type.</p>
            </div>
          )}
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}

export default EventTypes;
