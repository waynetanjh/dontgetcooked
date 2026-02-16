# Birthday Reminder App - Cursor AI Instructions

## Project Overview
Build a personal web app to track friends' birthdays and receive automated Telegram reminders. This is a single-user application (personal use only).

## Tech Stack
- **Frontend:** Next.js 14+ (App Router), TypeScript, TailwindCSS
- **Backend:** NestJS, TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT with Passport (NextAuth.js on frontend)
- **Cron Jobs:** @nestjs/schedule
- **Notifications:** Telegram Bot API
- **Deployment:** 
  - Frontend: Vercel
  - Backend + Database: Docker Compose on Railway/EC2/Lightsail

## Code Principles
- **Keep it modular and maintainable**
- **Apply KISS (Keep It Simple, Stupid) principles**
- **Avoid over-engineering** - this is a personal app
- **Clear separation of concerns**
- **Readable, self-documenting code**

## Core Features
1. **Friend Management**
   - Add new friends with name, birthday, optional photo, and notes
   - Edit existing friend details
   - Delete friends
   - View all friends in a list

2. **Birthday Tracking**
   - View upcoming birthdays sorted chronologically
   - Calculate age/days until birthday
   - Configurable reminder preferences per friend (day-of, 3 days before, 7 days before)

3. **Calendar Export**
   - Generate .ics file with all birthdays
   - Import into Google Calendar, Apple Calendar, Outlook

4. **Telegram Notifications**
   - Daily cron job checks for upcoming birthdays (time configurable via timezone)
   - Sends Telegram messages based on reminder preferences
   - Include friend's name, age, and days until birthday in message
   - **Test Telegram button** in UI to send a test notification immediately

5. **Authentication**
   - Simple login (single user)
   - JWT tokens for API authentication
   - Protected routes on frontend and backend

## Database Schema (Prisma)
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // Hashed with bcrypt
  name      String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("users")
}

model Friend {
  id                String   @id @default(uuid())
  name              String
  birthday          DateTime @db.Date
  photoUrl          String?  @map("photo_url")
  notes             String?
  remindDaysBefore  Int[]    @default([0, 3, 7]) @map("remind_days_before")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  @@map("friends")
}
```

## Backend Structure (NestJS)

### Module Architecture
```
src/
├── main.ts
├── app.module.ts
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── dto/
│   │   ├── login.dto.ts
│   │   └── register.dto.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   └── strategies/
│       └── jwt.strategy.ts
├── friends/
│   ├── friends.module.ts
│   ├── friends.controller.ts
│   ├── friends.service.ts
│   └── dto/
│       ├── create-friend.dto.ts
│       └── update-friend.dto.ts
├── birthdays/
│   ├── birthdays.module.ts
│   ├── birthdays.controller.ts
│   └── birthdays.service.ts
├── telegram/
│   ├── telegram.module.ts
│   ├── telegram.controller.ts (for test button)
│   └── telegram.service.ts
└── scheduler/
    ├── scheduler.module.ts
    └── scheduler.service.ts
```

### Key Backend Requirements

#### PrismaModule
- Extend PrismaClient
- Handle connection lifecycle
- Make it a global module

#### AuthModule
- Hash passwords with bcrypt
- Generate JWT tokens on login
- Implement JWT strategy for protected routes
- Use guards to protect all endpoints except auth routes

#### FriendsModule
- CRUD operations using Prisma
- All routes protected with JwtAuthGuard
- DTOs for validation

#### BirthdaysModule
- Calculate upcoming birthdays
- Sort by next occurrence
- Calculate age and days remaining
- Generate .ics file
- Use timezone from environment variable for all date calculations

#### TelegramModule
- Send messages to Telegram Bot API
- Method: `sendMessage(chatId, text)`
- Endpoint: `https://api.telegram.org/bot{token}/sendMessage`
- **Test endpoint** to send a test notification (protected route)
- Format test message: "🎉 Test notification from Birthday Reminder App! Your notifications are working correctly."

#### SchedulerModule
- Cron job runs daily at configured time (default 9:00 AM in user's timezone)
- Use timezone from TZ environment variable
- Check all friends' birthdays
- For each friend, check if today matches any `remindDaysBefore` value
- Send Telegram message if match found
- Log cron execution (timestamp, number of reminders sent)

### API Endpoints

#### Auth
- `POST /auth/register` - Register user
- `POST /auth/login` - Login, returns JWT token

#### Friends (all protected)
- `GET /friends` - Get all friends
- `GET /friends/:id` - Get single friend
- `POST /friends` - Create friend
- `PUT /friends/:id` - Update friend
- `DELETE /friends/:id` - Delete friend

#### Birthdays (all protected)
- `GET /birthdays/upcoming` - Get upcoming birthdays (sorted)
- `GET /birthdays/calendar/export` - Download .ics file

#### Telegram (all protected)
- `POST /telegram/test` - Send test notification to verify Telegram integration

### Environment Variables (.env)
```
DATABASE_URL="postgresql://user:password@localhost:5432/birthdays"
JWT_SECRET="your-super-secret-jwt-key"
TELEGRAM_BOT_TOKEN="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
TELEGRAM_CHAT_ID="your-telegram-chat-id"
TZ="Asia/Singapore"
CRON_TIME="0 9 * * *"
PORT=3001
```

**Timezone Notes:**
- Use IANA timezone format (e.g., "Asia/Singapore", "America/New_York", "Europe/London")
- This affects when the cron job runs and how dates are calculated
- Default to "Asia/Singapore" based on user location

## Frontend Structure (Next.js)

### Directory Structure
```
app/
├── layout.tsx
├── page.tsx (landing/login)
├── dashboard/
│   ├── page.tsx (upcoming birthdays)
│   ├── friends/
│   │   ├── page.tsx (list all friends)
│   │   ├── new/
│   │   │   └── page.tsx (add friend form)
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx (edit friend)
│   ├── settings/
│   │   └── page.tsx (test telegram, view settings)
│   └── layout.tsx (protected layout)
├── api/
│   └── auth/
│       └── [...nextauth]/
│           └── route.ts
components/
├── auth/
│   ├── LoginForm.tsx
│   └── ProtectedRoute.tsx
├── friends/
│   ├── FriendCard.tsx
│   ├── FriendForm.tsx
│   └── FriendList.tsx
├── birthdays/
│   ├── BirthdayCard.tsx
│   └── UpcomingBirthdays.tsx
├── settings/
│   └── TelegramTest.tsx (test button component)
└── ui/ (component library if needed)
lib/
├── api.ts (axios instance with JWT interceptor)
└── utils.ts
```

### Key Frontend Requirements

#### Authentication
- Use NextAuth.js with Credentials provider
- Store JWT in session
- Protect dashboard routes with middleware
- Axios interceptor to add JWT to all API requests

#### API Integration
- Create axios instance with base URL pointing to NestJS backend
- Add Authorization header with JWT token
- Handle 401 errors (redirect to login)

#### Friend Management
- Form with fields: name, birthday (date picker), photo URL, notes, reminder preferences (multi-select)
- Validation using react-hook-form + zod
- Display friends in cards with edit/delete actions

#### Birthday Dashboard
- Fetch upcoming birthdays from API
- Display in chronological order
- Show countdown (e.g., "in 5 days", "today!", "tomorrow")
- Calculate and display age
- Export to calendar button (downloads .ics file)

#### Settings/Test Page
- **Test Telegram Button**: Calls `POST /telegram/test` endpoint
- Shows success/error message after testing
- Display current timezone configuration
- Simple, clean UI with clear feedback

#### UI/UX
- Use TailwindCSS for styling
- Responsive design (mobile-friendly)
- Loading states for API calls
- Success/error toast notifications

### Environment Variables (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL=http://localhost:3000
```

## Docker Setup

### docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: birthday-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: birthdays
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: birthday-backend
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/birthdays
      JWT_SECRET: ${JWT_SECRET}
      TELEGRAM_BOT_TOKEN: ${TELEGRAM_BOT_TOKEN}
      TELEGRAM_CHAT_ID: ${TELEGRAM_CHAT_ID}
      TZ: ${TZ:-Asia/Singapore}
      CRON_TIME: ${CRON_TIME:-0 9 * * *}
      PORT: 3001
    depends_on:
      - postgres
    command: sh -c "npx prisma migrate deploy && npm run start:prod"

volumes:
  postgres_data:
```

### Backend Dockerfile
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./
EXPOSE 3001
CMD ["npm", "run", "start:prod"]
```

## Telegram Bot Setup Instructions

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow prompts to name your bot
4. Copy the bot token (format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
5. Start a chat with your new bot
6. To get your Chat ID:
   - Send a message to your bot
   - Visit: `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
   - Find your `chat.id` in the JSON response
7. Add both values to your `.env` file
8. **Test the integration** using the Test Telegram button in the settings page

## Security Considerations
- All passwords hashed with bcrypt
- JWT tokens with reasonable expiration
- CORS restricted to frontend domain only
- HTTPS enforced in production
- Environment variables never committed to git
- Input validation on all endpoints
- Test telegram endpoint is protected (requires authentication)

## Development Notes
- **Timezone handling:** All date comparisons should respect the TZ environment variable
- **Test button:** Should provide immediate feedback to verify Telegram integration works
- **Cron logging:** Log each cron execution with timestamp and number of reminders sent for debugging
- **Error handling:** Telegram API failures should be logged but not crash the application