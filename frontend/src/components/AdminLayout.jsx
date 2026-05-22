import {
  Bell,
  CalendarDays,
  Clock,
  Home,
  ListChecks,
  Menu,
  Plug,
  Plus,
  Search,
  UserCircle,
  Workflow,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/event-types", label: "Event Types", icon: CalendarDays },
  { to: "/availability", label: "Availability", icon: Clock },
  { to: "/meetings", label: "Meetings", icon: ListChecks },
  { to: "/workflows", label: "Workflows", icon: Workflow },
  { to: "/integrations", label: "Integrations", icon: Plug },
];

function AdminLayout({ children, title, subtitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebar = (
    <aside className="flex h-full flex-col border-r border-[#e5e7eb] bg-[#f8fafc] px-4 py-4">
      <div className="flex items-center justify-between px-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-blue">
            Calendly
          </p>
          <h1 className="mt-1 text-lg font-semibold text-slate-950">Scheduling</h1>
        </div>
        <button
          className="rounded-xl p-2 text-slate-500 hover:bg-[#e8f0fe] lg:hidden"
          type="button"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={18} />
        </button>
      </div>

      <nav className="mt-8 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#e8f0fe] text-brand-blue"
                    : "text-slate-700 hover:bg-[#e8f0fe] hover:text-slate-950"
                }`
              }
            >
              <Icon size={17} strokeWidth={2.2} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl border border-[#e5e7eb] bg-white p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue text-sm font-bold text-white">
            A
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950">Anshu</p>
            <p className="truncate text-xs text-slate-500">admin@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="page-shell">
      <div className="fixed inset-y-0 left-0 z-40 hidden w-[260px] lg:block">{sidebar}</div>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-slate-950/30"
            type="button"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative h-full w-[260px]">{sidebar}</div>
        </div>
      ) : null}

      <div className="admin-layout">
        <main className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-[#e5e7eb] bg-white/95 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6 lg:px-8">
              <button
                className="rounded-xl border border-[#e5e7eb] p-2 text-slate-700 lg:hidden"
                type="button"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={18} />
              </button>

              <div className="hidden min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#e5e7eb] bg-[#f8fafc] px-3 py-2 text-sm text-slate-500 sm:flex">
                <Search size={16} />
                <span>Search event types, invitees, meetings</span>
              </div>

              <button className="btn-primary whitespace-nowrap" type="button">
                <Plus size={16} />
                Create
              </button>
              <button className="rounded-xl border border-[#e5e7eb] bg-white p-2 text-slate-600 transition hover:bg-[#e8f0fe]" type="button">
                <Bell size={18} />
              </button>
              <button className="hidden rounded-xl border border-[#e5e7eb] bg-white p-2 text-slate-600 transition hover:bg-[#e8f0fe] sm:inline-flex" type="button">
                <UserCircle size={18} />
              </button>
            </div>
          </header>

          <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-950">{title}</h2>
                {subtitle ? <p className="mt-1 text-sm text-[#64748b]">{subtitle}</p> : null}
              </div>
            </div>
            {children}
          </section>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
