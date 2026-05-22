import dayjs from "dayjs";
import { CalendarCheck, Clock, Mail, User, Video } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

function ConfirmationPage() {
  const { state } = useLocation();
  const storedBooking = sessionStorage.getItem("latestBooking");
  const booking = state?.booking || (storedBooking ? JSON.parse(storedBooking) : null);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 py-10">
      <section className="w-full max-w-2xl overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <div className="border-b border-[#e5e7eb] p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
            <CalendarCheck size={30} />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-slate-950">Your meeting has been scheduled successfully.</h1>
          <p className="mt-2 text-sm text-[#64748b]">A calendar invite would be sent to the invitee in a production app.</p>
        </div>

        {booking ? (
          <div className="p-6">
            <h2 className="text-lg font-bold text-slate-950">{booking.event_name}</h2>
            <div className="mt-5 grid gap-3 text-sm text-[#64748b] sm:grid-cols-2">
              <p className="flex items-center gap-3 rounded-xl bg-[#f8fafc] p-3">
                <Clock size={16} />
                {dayjs(booking.booking_date).format("MMMM D, YYYY")} at {booking.start_time?.slice(0, 5)}
              </p>
              <p className="flex items-center gap-3 rounded-xl bg-[#f8fafc] p-3">
                <Video size={16} />
                Google Meet
              </p>
              <p className="flex items-center gap-3 rounded-xl bg-[#f8fafc] p-3">
                <User size={16} />
                Host: {booking.host_name || "Default User"}
              </p>
              <p className="flex items-center gap-3 rounded-xl bg-[#f8fafc] p-3">
                <Mail size={16} />
                {booking.invitee_name} - {booking.invitee_email}
              </p>
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-700">
              Timezone: {booking.timezone || "Asia/Kolkata"}
            </p>
          </div>
        ) : (
          <div className="p-6 text-center text-sm text-[#64748b]">No recent booking details found.</div>
        )}

        <div className="flex flex-wrap justify-center gap-3 border-t border-[#e5e7eb] p-5">
          <Link className="btn-primary" to="/">
            Dashboard
          </Link>
          {booking?.slug ? (
            <Link className="btn-secondary" to={`/book/${booking.slug}`}>
              Book another time
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  );
}

export default ConfirmationPage;
