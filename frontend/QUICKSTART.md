# Quick Start Guide

## Prerequisites

- Node.js 20+
- Backend API running on `http://localhost:3001`

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   - The `.env.local` file is already created
   - Update `NEXTAUTH_SECRET` for production use

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Open the app:**
   - Navigate to `http://localhost:3000`
   - You'll see the login page

## First Time Setup

1. **Create an account:**
   - Click "Sign up" on the login page
   - Fill in your name, email, and password
   - You'll be automatically logged in

2. **Add your first event:**
   - Click "Add Event" on the dashboard
   - Enter person's name (e.g., "Mom")
   - Select event date
   - Optionally add event label (e.g., "Birthday")
   - Optionally add notes

3. **View upcoming events:**
   - The dashboard shows all upcoming events
   - Events are sorted by next occurrence
   - Countdown displays "Today!", "Tomorrow", or "In X days"

4. **Configure notifications:**
   - Go to Settings
   - Test Telegram notifications
   - Export calendar to sync with other apps

## Features

### Dashboard (Home)
- View all upcoming events sorted chronologically
- See countdown for each event
- Quick links to add events and settings

### People
- View all people and their events
- Edit or delete events
- Add new people with their special dates

### Settings
- Test Telegram notifications
- Export calendar as .ics file
- View system information

## Keyboard Shortcuts

- **Forms:** Press Enter to submit
- **Navigation:** Use Tab to navigate between fields

## Common Tasks

### Add a Person
1. Navigate to People → Add Person
2. Fill in the form
3. Click "Create Event"

### Edit an Event
1. Go to People
2. Click "Edit" on the event card
3. Update the information
4. Click "Update Event"

### Delete an Event
1. Go to People
2. Click "Delete" on the event card
3. Confirm deletion

### Export Calendar
1. Go to Settings
2. Click "Export Calendar"
3. Import the downloaded .ics file into your calendar app

## Troubleshooting

### "Unable to connect to server"
- Ensure the backend API is running on port 3001
- Check the `NEXT_PUBLIC_API_URL` in `.env.local`

### Login Issues
- Verify your credentials
- Make sure the backend database is running
- Check the browser console for errors

### Telegram Notifications Not Working
- Verify backend Telegram configuration
- Check the backend logs
- Test the notification from Settings

## Development

### Build for production:
```bash
npm run build
```

### Run production build:
```bash
npm start
```

### Lint code:
```bash
npm run lint
```

## Support

For issues or questions:
1. Check the main README.md
2. Review the backend logs
3. Check browser console for errors
