# Don't Get Cooked Reminder App - Cursor AI Instructions

## Project Overview
Web app to track birthdays, anniversaries, and important events with automated Telegram reminders. 

Files should be seperated in terms of 
- backend for all backend files 
- frontend for all frontend files

## Tech Stack
- **Frontend:** Next.js 14+ (App Router), TypeScript, TailwindCSS
- **Backend:** NestJS, TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT with Passport (NextAuth.js on frontend)
- **Notifications:** Telegram Bot API, @nestjs/schedule for cron jobs
- **Deployment:** Vercel (frontend), Docker Compose on AWS EC2 (backend + DB)

## Code Principles
- Keep it modular and maintainable
- Apply KISS principles - avoid over-engineering
- Clear separation of concerns
- Readable, self-documenting code

## Core Features

### 1. Event Management
- Add events with required fields (name, date) and optional fields (event label, notes)
- Event label is freeform text input - users can type anything ("Birthday", "Anniversary", "First Date", "Adoption Day", etc.)
- Edit existing events - update any field
- Delete events with confirmation
- View all events in a list/card format
- All events automatically recur annually

### 2. Smart Reminders
- Upcoming events view - sorted chronologically by next occurrence
- Countdown display - show time until event:
  - "Today!" for same-day events
  - "Tomorrow" for next day
  - "In X days" for future events

### 3. Telegram Notifications (Per-User Auto-Linking)
- **Auto-linking System (two flows):**
  - **Flow A — Telegram first:** User presses `/start` before creating an account. Bot saves their chatId and username to `PendingTelegramLink` table and sends instructions to register. When user creates an account, the system auto-links their chatId and sends a confirmation message via Telegram.
  - **Flow B — Account first:** User registers on the website first, then presses `/start`. Bot finds their account by Telegram username and links the chatId directly (original flow).
  - No manual chatId configuration needed
  - Commands: `/start` (link), `/unlink` (unlink), `/status` (check status)
- **Automated daily cron job:**
  - Runs at configured time (default 9:00 AM)
  - Sends to all users with linked Telegram chats
  - Each user receives notifications for today's events
- **Message format includes:**
  - Event name (e.g., "John's Birthday")
  - Event label if provided (e.g., "Birthday", "Wedding Anniversary")
  - Personal notes if added (optional)
  - Example: "🎂 John's Birthday - Birthday. Note: Loves chocolate cake"
  - Example without notes: "🎉 Sarah's Anniversary - Wedding Anniversary"
- **Test notification button in settings:**
  - Sends test message to logged-in user's linked chat
  - Message: "🎉 Test notification from Birthday Reminder App! Your notifications are working correctly."
  - Shows success/error feedback in UI
- **Error handling:** Log Telegram API failures without crashing app
- **Bot uses long-polling:** Works on localhost and production without public URL

### 4. Calendar Integration
- Export functionality:
  - Generate .ics (iCalendar) file with all events
  - Include recurring annual events properly formatted
  - One-click download from UI
- Import compatibility:
  - Works with Google Calendar
  - Works with Apple Calendar
  - Works with Outlook
- Events sync as recurring yearly reminders in external calendars

### 5. Authentication & Security
- Multi-user system:
  - Open registration for multiple users
  - Each user manages their own events independently
  - Email + password login
  - Designed to serve at least 10+ concurrent users
- JWT-based authentication:
  - Tokens generated on login
  - Stored in NextAuth.js session on frontend
  - Sent with all API requests via Authorization header
- Protected routes:
  - All dashboard pages require authentication
  - All API endpoints (except auth) require valid JWT
  - Automatic redirect to login if unauthorized
- Security measures:
  - Passwords hashed with bcrypt
  - JWT tokens with reasonable expiration
  - CORS restricted to frontend domain
  - Input validation on all endpoints

## Database Schema (Prisma)
```prisma
model User {
  id               String    @id @default(uuid())
  email            String    @unique
  password         String    // bcrypt hashed
  telegramUsername String    @map("telegram_username")
  chatId           BigInt?   @map("chat_id") // Auto-linked via /start command or pending link
  chatLinkedAt     DateTime? @map("chat_linked_at")
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")
  @@map("users")
}

model PendingTelegramLink {
  id               String   @id @default(uuid())
  telegramUsername String   @unique @map("telegram_username")
  chatId           BigInt   @map("chat_id")
  createdAt        DateTime @default(now()) @map("created_at")
  @@map("pending_telegram_links")
}

model Event {
  id         String   @id @default(uuid())
  name       String   // Person's name (e.g., "John", "Mom")
  eventDate  DateTime @db.Date @map("event_date")
  eventLabel String?  @map("event_label") // Custom text: "Birthday", "Anniversary", etc.
  notes      String?
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")
  @@map("events")
}
```

**Design Philosophy:** Single flat Event table stores all information. Multiple events for the same person are just separate records with the same name. 

## Backend Structure (NestJS)
```
src/
├── main.ts
├── app.module.ts
├── prisma/ (module + service, global)
├── auth/ (JWT strategy, guards, login/register)
├── friends/ (CRUD for events, returns distinct names for autocomplete)
├── birthdays/ (upcoming events, .ics export, year calculation)
├── telegram/ (send per-user messages, bot commands, test endpoint)
└── scheduler/ (daily cron job, sends reminders to all users)
```

### Key Requirements
- **Auth:** bcrypt passwords, JWT tokens, guards on all routes except auth
- **Friends/Events:** CRUD operations on Event model, `GET /friends/names/distinct` for autocomplete
- **Birthdays:** Calculate upcoming events sorted by next occurrence, respect TZ env var
- **Telegram:** 
  - Uses long-polling to receive `/start`, `/unlink`, `/status` commands
  - Auto-links chatId to user account based on Telegram username
  - If `/start` is pressed before account creation, saves pending link and auto-links on registration
  - Sends Telegram confirmation message when pending link is resolved on registration
  - Test endpoint sends to authenticated user's linked chat
  - Per-user notifications (each user receives their own Telegram alerts)
- **Scheduler:** 
  - Daily cron at configured time (default 9 AM)
  - Sends to all users with linked chats
  - Messages include person name, event label, and notes (optional) - no year count

### API Endpoints
- **Auth:** `POST /auth/register`, `POST /auth/login`
- **Friends/Events (protected):** `GET /friends`, `GET /friends/names/distinct`, `POST /friends`, `GET /friends/:id`, `PUT /friends/:id`, `DELETE /friends/:id`
- **Birthdays (protected):** `GET /birthdays/upcoming`, `GET /birthdays/calendar/export`
- **Telegram (protected):** `POST /telegram/test`

### Environment Variables
```env
DATABASE_URL="postgresql://user:password@localhost:5432/birthdays"
JWT_SECRET="your-secret"
TELEGRAM_BOT_TOKEN="bot-token"
# TELEGRAM_CHAT_ID is deprecated - now auto-linked per user via /start command
TZ="Asia/Singapore"
CRON_TIME="0 9 * * *"
PORT=3001
```

## Frontend Structure (Next.js)
```
app/
├── page.tsx (login)
├── dashboard/
│   ├── page.tsx (upcoming events)
│   ├── people/ (event list table, new, [id]/edit)
│   └── settings/ (telegram test, timezone display)
components/
├── auth/ (LoginForm, ProtectedRoute)
├── people/ (columns for data table)
├── events/ (EventForm with name autocomplete, EventList, EventListItem, UpcomingEvents)
├── birthdays/ (BirthdayCard, UpcomingBirthdays)
└── settings/ (TelegramTest)
lib/
├── api.ts (axios with JWT interceptor, peopleApi for events)
├── validations.ts (Zod schemas)
└── utils.ts
types/
└── index.ts (Event, UpcomingEvent interfaces)
```

### Key Requirements
- **Auth:** NextAuth.js with Credentials provider, JWT in session, middleware protects dashboard
- **Forms:** react-hook-form + zod validation
- **Name Autocomplete:** HTML5 datalist for simple autocomplete from existing names (prevents typos, no complex UI)
- **Simple Table View:** Standard data table with sortable columns, search by name
- **UI:** TailwindCSS, shadcn/ui components, responsive, loading states, toast notifications
- **Display:** Events sorted chronologically, countdown ("in 5 days", "today!"), year count ("25th birthday")

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_SECRET="nextauth-secret"
NEXTAUTH_URL=http://localhost:3000
```

## Docker Setup
- **docker-compose.yml:** PostgreSQL 15-alpine + NestJS backend, runs prisma migrate deploy on start
- **Backend Dockerfile:** Multi-stage build (node:20-alpine), generates Prisma client, exposes 3001

## Telegram Bot Setup
1. Message @BotFather → /newbot → get token
2. Start chat with bot, send message
3. Visit `https://api.telegram.org/bot<TOKEN>/getUpdates` → get chat.id
4. Add to .env, test via settings page

## Development Notes
- All date calculations respect TZ environment variable (IANA format: "Asia/Singapore")
- Cron runs daily at configured time, sends reminders only for events happening today
- Telegram failures logged but don't crash app
- Event labels are freeform custom text input
- Telegram notifications sent via bot include: event name, label, and notes (optional) - no year count needed