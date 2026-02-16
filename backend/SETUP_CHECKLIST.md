# Backend Setup Checklist

## ✅ Completed

- [x] NestJS project initialized
- [x] All source code modules created:
  - [x] PrismaModule (global database service)
  - [x] AuthModule (JWT authentication)
  - [x] FriendsModule (CRUD operations)
  - [x] BirthdaysModule (upcoming events & calendar export)
  - [x] TelegramModule (bot integration)
  - [x] SchedulerModule (daily cron job)
- [x] Prisma schema defined (User & Friend models)
- [x] Environment variables configured (.env)
- [x] Main application configured (CORS, validation)
- [x] .gitignore created
- [x] README documentation created

## 🔧 Required Manual Steps

Due to file system permission issues on OneDrive, please run these commands manually:

### 1. Generate Prisma Client

```bash
cd backend
npx prisma generate
```

### 2. Run Database Migrations

```bash
npx prisma migrate dev --name init
```

This will create the database tables based on the schema.

### 3. Start the Development Server

```bash
npm run start:dev
```

The server should start at `http://localhost:3001`

## 🧪 Testing the Backend

### Test 1: Health Check

The default NestJS controller should be accessible:

```bash
curl http://localhost:3001
```

Expected: Hello World message

### Test 2: Register a User

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

Expected: Success response with JWT token

### Test 3: Login

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Expected: Success response with JWT token

### Test 4: Create an Event (Protected)

Replace `<YOUR_TOKEN>` with the token from login:

```bash
curl -X POST http://localhost:3001/friends \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{
    "name": "John Doe",
    "eventDate": "1990-05-15",
    "eventLabel": "Birthday",
    "notes": "Loves chocolate cake"
  }'
```

Expected: Success response with created event

### Test 5: Get All Events

```bash
curl http://localhost:3001/friends \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

Expected: List of all events

### Test 6: Get Upcoming Events

```bash
curl http://localhost:3001/birthdays/upcoming \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

Expected: Events sorted by next occurrence with countdown

### Test 7: Test Telegram Notification

First, configure your Telegram bot in `.env`, then:

```bash
curl -X POST http://localhost:3001/telegram/test \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

Expected: Success message and notification in Telegram

### Test 8: Export Calendar

```bash
curl http://localhost:3001/birthdays/calendar/export \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -o birthdays.ics
```

Expected: Download .ics file

## 📋 Verification Checklist

- [ ] Prisma client generated successfully
- [ ] Database migrations completed
- [ ] Server starts without errors
- [ ] Can register a new user
- [ ] Can login with credentials
- [ ] Can create events (requires authentication)
- [ ] Can view all events
- [ ] Can view upcoming events
- [ ] Can test Telegram (if configured)
- [ ] Can export calendar
- [ ] Cron job logs appear in console (check at 9 AM)

## 🐛 Troubleshooting

### "Cannot find module '@prisma/client'"

Run: `npx prisma generate`

### "Error: P1001: Can't reach database server"

Check that PostgreSQL is running:
```bash
docker-compose up -d
```

### "Unauthorized" on protected routes

Ensure you're including the JWT token in the Authorization header:
```
Authorization: Bearer <YOUR_TOKEN>
```

### Telegram notifications not working

1. Verify `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in `.env`
2. Check you've sent a message to your bot
3. View server logs for error messages

## 📝 Notes

- The backend is now fully implemented and ready to use
- All endpoints follow the `/resource` pattern (no `/api` prefix)
- Authentication uses JWT with 7-day expiration
- Passwords are hashed with bcrypt (salt rounds: 10)
- CORS is enabled for frontend at `http://localhost:3000`
- Daily cron runs at 9:00 AM Singapore time
- All dates respect the `TZ` environment variable
