# Scheduling Platform (Calendly Clone)

A full-stack scheduling and booking web application built for the SDE Intern Fullstack Assignment. It closely replicates Calendly's design and user experience — allowing an admin to create event types, set weekly availability, share public booking links, and manage meetings.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Axios, Day.js, Lucide React, React Hot Toast |
| Backend | Node.js, Express.js |
| Database | MySQL |

## Features

### Core
- Create, edit, list, and delete event types with unique URL slugs
- Weekly availability settings with configurable days, time ranges, and timezone
- Public booking page with month calendar view and dynamic time slot display
- Booking form to collect invitee name, email, and optional notes
- Double-booking prevention across all event types (time-range overlap check)
- Booking confirmation page with full meeting details
- Meetings page with Upcoming, Past, and Cancelled tabs
- Cancel scheduled meetings

### UI/UX
- Calendly-inspired two-column booking layout
- Responsive design for desktop, tablet, and mobile
- Loading skeletons, hover animations, and smooth transitions
- Toast notifications for success and error states
- Admin sidebar with navigation

## Folder Structure

```
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── availabilityController.js
│   │   │   ├── eventController.js
│   │   │   ├── meetingController.js
│   │   │   └── publicController.js
│   │   ├── routes/
│   │   │   ├── availabilityRoutes.js
│   │   │   ├── eventRoutes.js
│   │   │   ├── meetingRoutes.js
│   │   │   └── publicRoutes.js
│   │   ├── utils/
│   │   │   └── time.js
│   │   ├── db.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── database/
│   ├── migrations/
│   │   └── 001_add_booking_notes_timezone.sql
│   └── schema.sql
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js
│   │   ├── components/
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── BookingForm.jsx
│   │   │   ├── CalendarSection.jsx
│   │   │   ├── EventTypeCard.jsx
│   │   │   └── TimeSlots.jsx
│   │   ├── pages/
│   │   │   ├── Availability.jsx
│   │   │   ├── BookingPage.jsx
│   │   │   ├── ConfirmationPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── EventTypes.jsx
│   │   │   └── Meetings.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <project-folder>
```

### 2. Database Setup

Open a MySQL client and run the schema file:

```bash
mysql -u root -p < database/schema.sql
```

This creates the `calendly_clone_assignment` database with all tables, a default admin user, two sample event types, sample bookings, and weekday availability (Mon–Fri, 9 AM – 5 PM).

### 3. Backend Setup

```bash
cd backend
npm install
```

Copy the example env file and update it with your MySQL credentials:

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=calendly_clone_assignment
FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

The API will be available at `http://localhost:5001/api`

### 4. Frontend Setup

```bash
cd frontend
npm install
```

Copy the example env file:

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

The default `VITE_API_URL=http://localhost:5001/api` should work without changes.

Start the frontend:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Application Routes

### Admin Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard with stats and event type overview |
| `/event-types` | Create, edit, and delete event types |
| `/availability` | Manage weekly availability schedule |
| `/meetings` | View upcoming, past, and cancelled meetings |

### Public Pages

| Route | Description |
|-------|-------------|
| `/book/:slug` | Public booking page (e.g., `/book/30-minute-meeting`) |
| `/confirmation` | Booking confirmation with meeting details |

## API Endpoints

### Event Types
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/event-types` | List all event types |
| POST | `/api/event-types` | Create a new event type |
| PUT | `/api/event-types/:id` | Update an event type |
| DELETE | `/api/event-types/:id` | Delete an event type |

### Availability
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/availability` | List availability rules |
| POST | `/api/availability` | Add an availability rule |
| PUT | `/api/availability/:id` | Update an availability rule |
| DELETE | `/api/availability/:id` | Delete an availability rule |

### Public Booking
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/event/:slug` | Get public event details |
| GET | `/api/public/slots?slug=...&date=YYYY-MM-DD` | Get available time slots |
| POST | `/api/public/book` | Create a booking |

### Meetings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/meetings?type=upcoming` | List upcoming meetings |
| GET | `/api/meetings?type=past` | List past meetings |
| GET | `/api/meetings?type=cancelled` | List cancelled meetings |
| PATCH | `/api/meetings/:id/cancel` | Cancel a meeting |

## Database Design

The schema consists of four tables:

- **users** — Stores admin user info (name, email, timezone)
- **event_types** — Scheduling links with name, slug, duration, and description (FK → users)
- **availability_rules** — Weekly recurring time windows per day of week (FK → users)
- **bookings** — Invitee bookings with date, time range, status, and notes (FK → event_types)

Key design decisions:
- Bookings store both `start_time` and `end_time` to support overlap detection across different event durations
- A composite index on `(event_type_id, booking_date, start_time, status)` for fast slot availability queries
- `status` uses an ENUM (`scheduled`, `cancelled`) so cancelled bookings are preserved
- `FOR UPDATE` row locking prevents race conditions during concurrent bookings

## Assumptions

- No authentication is implemented; the assignment specifies assuming a default logged-in admin user
- The public booking page is accessible without login
- Availability is weekly recurring (same schedule every week)
- Double-booking prevention checks across all event types for the same host using time-range overlap, not just exact time match
- Cancelled meetings are soft-deleted (kept in database with `status = 'cancelled'`)
- Event types that have existing bookings cannot be deleted to preserve meeting history

## Deployment

Recommended hosting:

- **Frontend**: Vercel or Netlify
- **Backend**: Render or Railway
- **Database**: Railway MySQL, PlanetScale, or any hosted MySQL provider

Add deployed links here:
GitHub Repository:https://github.com/anshu6646/calendly_clone
Deployed (on Railway):romantic-nature-production-ecf4.up.railway.app
