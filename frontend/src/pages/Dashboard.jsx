import { CalendarCheck, CalendarPlus, Clock, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import AdminLayout from "../components/AdminLayout";
import EventTypeCard from "../components/EventTypeCard";

function Dashboard() {
  const [eventTypes, setEventTypes] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [pastMeetings, setPastMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadEventTypes() {
    setLoading(true);
    const [eventsResponse, upcomingResponse, pastResponse] = await Promise.all([
      api.get("/event-types"),
      api.get("/meetings", { params: { type: "upcoming" } }).catch(() => ({ data: [] })),
      api.get("/meetings", { params: { type: "past" } }).catch(() => ({ data: [] })),
    ]);
    setEventTypes(eventsResponse.data);
    setUpcomingMeetings(upcomingResponse.data);
    setPastMeetings(pastResponse.data);
    setLoading(false);
  }

  useEffect(() => {
    loadEventTypes().catch(() => setLoading(false));
  }, []);

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Manage your scheduling links, availability, and booking activity."
    >
      <section className="grid gap-3 md:grid-cols-3">
        {[
          { label: "Active Events", value: eventTypes.length, icon: CalendarCheck, to: "/event-types" },
          { label: "Upcoming Meetings", value: upcomingMeetings.length, icon: Clock, to: "/meetings" },
          { label: "Total Bookings", value: upcomingMeetings.length + pastMeetings.length, icon: TrendingUp, to: "/meetings" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              className="panel p-4 transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_10px_25px_rgba(15,23,42,0.08)]"
              to={stat.to}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#64748b]">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-950">{loading ? "-" : stat.value}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f0fe] text-brand-blue">
                  <Icon size={20} />
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-950">Event Types</h3>
            <p className="text-sm text-[#64748b]">Shareable booking pages for your invitees.</p>
          </div>
          <Link className="btn-primary" to="/event-types">
            <CalendarPlus size={15} />
            New event
          </Link>
        </div>

        <div className="space-y-4">
          {loading ? (
            <p className="text-sm text-slate-500">Loading event types...</p>
          ) : eventTypes.length ? (
            eventTypes.map((eventType) => (
              <EventTypeCard
                key={eventType.id}
                eventType={eventType}
              />
            ))
          ) : (
            <div className="panel p-8 text-center">
              <p className="text-sm text-slate-600">No event types yet.</p>
            </div>
          )}
        </div>
      </section>
    </AdminLayout>
  );
}

export default Dashboard;
