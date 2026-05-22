import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/client";
import AdminLayout from "../components/AdminLayout";

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const emptyForm = {
  day_of_week: 1,
  start_time: "09:00",
  end_time: "17:00",
  timezone: "Asia/Kolkata",
};

function normalizeTime(value) {
  return value?.slice(0, 5);
}

function Availability() {
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  async function loadRules() {
    const { data } = await api.get("/availability");
    setRules(data);
  }

  useEffect(() => {
    loadRules();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    try {
      await api.post("/availability", form);
      await loadRules();
      setMessage("Availability added.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to add availability.");
    }
  }

  async function handleDelete(id) {
    await api.delete(`/availability/${id}`);
    await loadRules();
  }

  return (
    <AdminLayout
      title="Availability"
      subtitle="Set the weekly hours that public booking pages can use to generate slots."
    >
      <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <form className="panel h-fit p-5" onSubmit={handleSubmit}>
          <h3 className="text-lg font-semibold text-slate-950">Add available hours</h3>

          <div className="mt-5 space-y-4">
            <div>
              <label className="label" htmlFor="day">
                Day
              </label>
              <select
                className="input mt-1"
                id="day"
                value={form.day_of_week}
                onChange={(event) => setForm({ ...form, day_of_week: Number(event.target.value) })}
              >
                {days.map((day, index) => (
                  <option key={day} value={index}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="start">
                  Start
                </label>
                <input
                  className="input mt-1"
                  id="start"
                  type="time"
                  value={form.start_time}
                  onChange={(event) => setForm({ ...form, start_time: event.target.value })}
                />
              </div>
              <div>
                <label className="label" htmlFor="end">
                  End
                </label>
                <input
                  className="input mt-1"
                  id="end"
                  type="time"
                  value={form.end_time}
                  onChange={(event) => setForm({ ...form, end_time: event.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="timezone">
                Timezone
              </label>
              <input
                className="input mt-1"
                id="timezone"
                value={form.timezone}
                onChange={(event) => setForm({ ...form, timezone: event.target.value })}
              />
            </div>

            {message ? <p className="text-sm text-slate-600">{message}</p> : null}

            <button className="btn-primary" type="submit">
              <Plus size={16} />
              Add hours
            </button>
          </div>
        </form>

        <div className="panel overflow-hidden">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="text-lg font-semibold text-slate-950">Weekly schedule</h3>
          </div>
          <div className="divide-y divide-slate-200">
            {rules.length ? (
              rules.map((rule) => (
                <div key={rule.id} className="flex flex-col justify-between gap-3 px-5 py-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-medium text-slate-950">{days[rule.day_of_week]}</p>
                    <p className="text-sm text-slate-600">
                      {normalizeTime(rule.start_time)} - {normalizeTime(rule.end_time)} {rule.timezone}
                    </p>
                  </div>
                  <button className="btn-danger" type="button" onClick={() => handleDelete(rule.id)}>
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-sm text-slate-600">No availability rules yet.</div>
            )}
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}

export default Availability;
