# Don't Get Cooked Reminder App - Cursor AI Instructions

## Project Overview
Personal web app to track birthdays, anniversaries, and important events with automated Telegram reminders. Single-user application.

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

### 3. Telegram Notifications
- Automated daily cron job:
  - Runs at configured time (default 9:00 AM)
  - Checks all events for today's date
  - Sends notification for matching events via bot
- Message format includes:
  - Event name (e.g., "John's Birthday")
  - Event label if provided (e.g., "Birthday", "Wedding Anniversary")
  - Personal notes if added (optional)
  - Example: "🎂 John's Birthday - Birthday. Note: Loves chocolate cake"
  - Example without notes: "🎉 Sarah's Anniversary - Wedding Anniversary"
- Test notification button in settings:
  - Immediately sends test message to verify integration
  - Message: "🎉 Test notification from Birthday Reminder App! Your notifications are working correctly."
  - Shows success/error feedback in UI
- Error handling: Log Telegram API failures without crashing app

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
- Single-user system:
  - Simple registration (one-time setup)
  - Email + password login
  - No multi-user complexity needed
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
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // bcrypt hashed
  name      String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  @@map("users")
}

model Friend {
  id          String   @id @default(uuid())
  name        String
  eventDate   DateTime @db.Date @map("event_date")
  eventLabel  String?  @map("event_label") // Custom text: "Birthday", "Anniversary", etc.
  notes       String?
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  @@map("friends")
}
```

## Backend Structure (NestJS)
```
src/
├── main.ts
├── app.module.ts
├── prisma/ (module + service, global)
├── auth/ (JWT strategy, guards, login/register)
├── friends/ (CRUD with DTOs, all routes protected)
├── birthdays/ (upcoming events, .ics export, year calculation)
├── telegram/ (send messages, test endpoint)
└── scheduler/ (daily cron job, sends reminders for today's events)
```

### Key Requirements
- **Auth:** bcrypt passwords, JWT tokens, guards on all routes except auth
- **Birthdays:** Calculate upcoming events sorted by next occurrence, respect TZ env var
- **Telegram:** Test endpoint sends: "🎉 Test notification from Birthday Reminder App! Your notifications are working correctly."
- **Scheduler:** Daily cron at configured time (default 9 AM), sends messages via bot for events happening today with event name, label, and notes (optional) - no year count

### API Endpoints
- **Auth:** `POST /auth/register`, `POST /auth/login`
- **Friends (protected):** `GET|POST /friends`, `GET|PUT|DELETE /friends/:id`
- **Birthdays (protected):** `GET /birthdays/upcoming`, `GET /birthdays/calendar/export`
- **Telegram (protected):** `POST /telegram/test`

### Environment Variables
```env
DATABASE_URL="postgresql://user:password@localhost:5432/birthdays"
JWT_SECRET="your-secret"
TELEGRAM_BOT_TOKEN="bot-token"
TELEGRAM_CHAT_ID="chat-id"
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
│   ├── friends/ (list, new, [id]/edit)
│   └── settings/ (telegram test, timezone display)
components/
├── auth/ (LoginForm, ProtectedRoute)
├── friends/ (FriendCard, FriendForm, FriendList)
├── birthdays/ (BirthdayCard, UpcomingBirthdays)
└── settings/ (TelegramTest)
lib/
├── api.ts (axios with JWT interceptor)
└── utils.ts
```

### Key Requirements
- **Auth:** NextAuth.js with Credentials provider, JWT in session, middleware protects dashboard
- **Forms:** react-hook-form + zod validation
- **UI:** TailwindCSS, responsive, loading states, toast notifications
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