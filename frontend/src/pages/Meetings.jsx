import { Ban } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import api from "../api/client";
import AdminLayout from "../components/AdminLayout";

const tabs = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
  { id: "cancelled", label: "Cancelled" },
];

function Meetings() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadMeetings = useCallback(async (type) => {
    setLoading(true);
    const { data } = await api.get("/meetings", { params: { type } });
    setMeetings(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMeetings(activeTab).catch(() => setLoading(false));
  }, [activeTab, loadMeetings]);

  async function cancelMeeting(id) {
    const confirmed = window.confirm("Cancel this meeting?");
    if (!confirmed) return;
    await api.patch(`/meetings/${id}/cancel`);
    await loadMeetings(activeTab);
  }

  return (
    <AdminLayout
      title="Meetings"
      subtitle="View upcoming meetings, past meetings, and cancelled bookings."
    >
      <div className="mb-5 flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.id
                ? "bg-brand-blue text-white"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
            type="button"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section className="panel overflow-hidden">
        <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <div className="col-span-4">Event</div>
          <div className="col-span-3">Invitee</div>
          <div className="col-span-3">Time</div>
          <div className="col-span-2 text-right">Action</div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-600">Loading meetings...</div>
        ) : meetings.length ? (
          <div className="divide-y divide-slate-200">
            {meetings.map((meeting) => (
              <div key={meeting.id} className="grid grid-cols-1 gap-4 px-5 py-4 md:grid-cols-12 md:items-center">
                <div className="md:col-span-4">
                  <p className="font-medium text-slate-950">{meeting.event_name}</p>
                  <p className="text-sm text-slate-500">/{meeting.slug}</p>
                </div>
                <div className="md:col-span-3">
                  <p className="text-sm font-medium text-slate-800">{meeting.invitee_name}</p>
                  <p className="text-sm text-slate-500">{meeting.invitee_email}</p>
                </div>
                <div className="text-sm text-slate-600 md:col-span-3">
                  {meeting.booking_date?.slice(0, 10)} at {meeting.start_time?.slice(0, 5)}
                </div>
                <div className="md:col-span-2 md:text-right">
                  {activeTab === "upcoming" ? (
                    <button className="btn-danger" type="button" onClick={() => cancelMeeting(meeting.id)}>
                      <Ban size={16} />
                      Cancel
                    </button>
                  ) : (
                    <span className="text-sm font-medium capitalize text-slate-500">{meeting.status}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-slate-600">No meetings found.</div>
        )}
      </section>
    </AdminLayout>
  );
}

export default Meetings;
