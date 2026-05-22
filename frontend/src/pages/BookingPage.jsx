import dayjs from "dayjs";
import { CalendarDays, Clock, Globe2, Video } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import BookingForm from "../components/BookingForm";
import CalendarSection from "../components/CalendarSection";
import TimeSlots from "../components/TimeSlots";

function firstBookableDate(availableDays = []) {
  for (let index = 0; index < 45; index += 1) {
    const date = dayjs().add(index, "day");
    if (availableDays.includes(date.day())) return date.format("YYYY-MM-DD");
  }
  return dayjs().format("YYYY-MM-DD");
}

function BookingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [eventType, setEventType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [form, setForm] = useState({
    invitee_name: "",
    invitee_email: "",
    invitee_notes: "",
  });

  useEffect(() => {
    setLoadingEvent(true);
    api
      .get(`/public/event/${slug}`)
      .then(({ data }) => {
        setEventType(data);
        setSelectedDate(firstBookableDate(data.available_days || []));
      })
      .catch(() => toast.error("This booking link is not available."))
      .finally(() => setLoadingEvent(false));
  }, [slug]);

  useEffect(() => {
    if (!eventType || !selectedDate) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    api
      .get("/public/slots", { params: { slug, date: selectedDate } })
      .then(({ data }) => setSlots(data.slots || []))
      .catch(() => {
        setSlots([]);
        toast.error("Unable to load available times.");
      })
      .finally(() => setLoadingSlots(false));
  }, [eventType, selectedDate, slug]);

  const dateLabel = useMemo(
    () => dayjs(selectedDate).format("dddd, MMMM D"),
    [selectedDate]
  );

  async function handleBooking(event) {
    event.preventDefault();
    if (!selectedSlot) {
      toast.error("Please select a time slot.");
      return;
    }

    setBooking(true);
    try {
      const { data } = await api.post("/public/book", {
        slug,
        ...form,
        booking_date: selectedDate,
        start_time: selectedSlot.start_time,
        timezone: eventType.host_timezone,
      });
      sessionStorage.setItem("latestBooking", JSON.stringify(data));
      toast.success("Your meeting has been scheduled.");
      navigate("/confirmation", { state: { booking: data } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to schedule this meeting.");
    } finally {
      setBooking(false);
    }
  }

  if (loadingEvent) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4">
        <div className="h-[520px] w-full max-w-5xl animate-pulse rounded-xl bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]" />
      </main>
    );
  }

  if (!eventType) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4">
        <div className="panel max-w-md p-8 text-center">
          <h1 className="text-xl font-bold text-slate-950">Booking link unavailable</h1>
          <p className="mt-2 text-sm text-[#64748b]">The event link may be incorrect or deleted.</p>
          <Link className="btn-primary mt-6" to="/">
            Back home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-6 md:px-8">
      <section className="mx-auto grid max-w-6xl overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)] lg:grid-cols-[330px_1fr]">
        <aside className="border-b border-[#e5e7eb] p-6 lg:border-b-0 lg:border-r">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-blue text-base font-bold text-white">
            {eventType.host_name?.charAt(0) || "A"}
          </div>
          <p className="mt-8 text-sm font-bold text-[#64748b]">{eventType.host_name}</p>
          <h1 className="mt-2 text-[28px] font-bold leading-tight tracking-tight text-slate-950">
            {eventType.name}
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#64748b]">{eventType.description}</p>

          <div className="mt-8 space-y-3 text-sm font-semibold text-[#64748b]">
            <div className="flex items-center gap-3">
              <Clock size={17} />
              {eventType.duration_minutes} min
            </div>
            <div className="flex items-center gap-3">
              <Video size={17} />
              {eventType.meeting_platform || "Google Meet"}
            </div>
            <div className="flex items-center gap-3">
              <CalendarDays size={17} />
              {eventType.availability_summary}
            </div>
            <div className="flex items-center gap-3">
              <Globe2 size={17} />
              {eventType.host_timezone}
            </div>
          </div>
        </aside>

        <div className="grid gap-0 lg:grid-cols-[1fr_300px]">
          <div className="p-5 md:p-7">
            <h2 className="mb-5 text-lg font-bold text-slate-950">Select a Date & Time</h2>
            <CalendarSection
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              availableDays={eventType.available_days}
            />
          </div>

          <div className="border-t border-[#e5e7eb] p-5 md:p-7 lg:border-l lg:border-t-0">
            <TimeSlots
              dateLabel={dateLabel}
              loading={loadingSlots}
              slots={slots}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-5 grid max-w-6xl gap-5 lg:grid-cols-[1fr_360px]">
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-4">
          <h2 className="text-base font-bold text-slate-950">Confirm your meeting</h2>
          <p className="mt-1 text-sm text-[#64748b]">
            Select a slot and enter your details. The server checks the slot again before booking to prevent duplicates.
          </p>
        </div>
        <BookingForm
          selectedSlot={selectedSlot}
          form={form}
          setForm={setForm}
          loading={booking}
          onSubmit={handleBooking}
        />
      </section>
    </main>
  );
}

export default BookingPage;
