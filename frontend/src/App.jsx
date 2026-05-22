import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Availability from "./pages/Availability";
import AdminLayout from "./components/AdminLayout";
import BookingPage from "./pages/BookingPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import Dashboard from "./pages/Dashboard";
import EventTypes from "./pages/EventTypes";
import Meetings from "./pages/Meetings";

function ComingSoon({ title }) {
  return (
    <AdminLayout title={title} subtitle="A placeholder navigation area for the assignment UI.">
      <div className="panel p-8">
        <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
        <p className="mt-2 text-sm text-slate-500">
          This area is included to match Calendly navigation and can be expanded later.
        </p>
      </div>
    </AdminLayout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            color: "#0f172a",
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/event-types" element={<EventTypes />} />
        <Route path="/availability" element={<Availability />} />
        <Route path="/meetings" element={<Meetings />} />
        <Route path="/workflows" element={<ComingSoon title="Workflows" />} />
        <Route path="/integrations" element={<ComingSoon title="Integrations" />} />
        <Route path="/book/:slug" element={<BookingPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
