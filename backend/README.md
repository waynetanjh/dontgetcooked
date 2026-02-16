# Birthday Reminder App - Backend

NestJS backend for the Birthday Reminder application with PostgreSQL, Prisma ORM, JWT authentication, and Telegram notifications.

## Prerequisites

- Node.js 18+ 
- PostgreSQL 15+
- npm or yarn
- Telegram Bot Token (for notifications)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

The `.env` file is already created. Update it with your actual values:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/birthdays"
JWT_SECRET="your-jwt-secret-change-in-production"
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
TELEGRAM_CHAT_ID="your-telegram-chat-id"
TZ="Asia/Singapore"
CRON_TIME="0 9 * * *"
PORT=3001
```

### 3. Set Up Telegram Bot

1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot` and follow instructions
3. Copy the bot token to `TELEGRAM_BOT_TOKEN`
4. Start a chat with your bot and send a message
5. Visit `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
6. Find your `chat.id` in the response and add to `TELEGRAM_CHAT_ID`

### 4. Set Up Database

Make sure PostgreSQL is running (via Docker):

```bash
# From project root
docker-compose up -d
```

Generate Prisma Client:

```bash
npx prisma generate
```

Run database migrations:

```bash
npx prisma migrate dev --name init
```

### 5. Run the Application

Development mode:

```bash
npm run start:dev
```

Production mode:

```bash
npm run build
npm run start:prod
```

The server will start at `http://localhost:3001`

## API Endpoints

### Authentication (Public)

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT token

### Friends/Events (Protected)

- `GET /friends` - Get all events
- `POST /friends` - Create new event
- `GET /friends/:id` - Get single event
- `PUT /friends/:id` - Update event
- `DELETE /friends/:id` - Delete event

### Birthdays (Protected)

- `GET /birthdays/upcoming` - Get upcoming events sorted by date
- `GET /birthdays/calendar/export` - Download .ics calendar file

### Telegram (Protected)

- `POST /telegram/test` - Send test notification

## Features

- **JWT Authentication**: Secure authentication with JWT tokens
- **Prisma ORM**: Type-safe database queries
- **Automated Reminders**: Daily cron job sends Telegram notifications
- **Calendar Export**: Generate .ics files for calendar apps
- **Input Validation**: Automatic validation with class-validator
- **Error Handling**: Consistent error responses
- **CORS Enabled**: Ready for frontend integration

## Scheduled Tasks

The application runs a daily cron job at 9:00 AM (configurable via `CRON_TIME`) that:
1. Checks all events for today's date
2. Sends Telegram notifications for matching events
3. Includes event name, label, and notes in the message

## Database Schema

**Users**
- id (UUID)
- email (unique)
- password (hashed with bcrypt)
- name
- timestamps

**Friends** (Events)
- id (UUID)
- name
- eventDate (Date)
- eventLabel (optional text)
- notes (optional)
- timestamps

## Development

View database in Prisma Studio:

```bash
npx prisma studio
```

Format code:

```bash
npm run format
```

Run tests:

```bash
npm run test
```

## Troubleshooting

### Prisma Client Not Generated

Run:
```bash
npx prisma generate
```

### Database Connection Issues

- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Ensure database exists

### Telegram Not Working

- Verify bot token is correct
- Ensure you've sent a message to the bot
- Check chat ID is correct
- View logs for error messages
