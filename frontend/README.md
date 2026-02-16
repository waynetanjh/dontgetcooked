# Don't Get Cooked - Frontend

A Next.js 14+ application for tracking birthdays, anniversaries, and important events with automated Telegram reminders.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Authentication**: NextAuth.js v5
- **Forms**: React Hook Form + Zod
- **API Client**: Axios
- **Icons**: Lucide React
- **Notifications**: Sonner

## Features

- ✅ User authentication (login/register)
- ✅ Protected routes with middleware
- ✅ Event management (CRUD operations)
- ✅ Upcoming events dashboard with countdown display
- ✅ Telegram test notifications
- ✅ Calendar export (.ics file)
- ✅ Responsive design (mobile-first)
- ✅ Modern UI with shadcn/ui components

## Prerequisites

- Node.js 20+ 
- npm or yarn
- Backend API running on port 3001 (or configure via environment variables)

## Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
# Edit .env.local with your configuration
```

## Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000
```

## Development

```bash
# Run development server
npm run dev

# The app will be available at http://localhost:3000
```

## Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Project Structure

```
frontend/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Login page
│   ├── register/                 # Registration page
│   ├── dashboard/                # Protected dashboard routes
│   │   ├── page.tsx              # Upcoming events
│   │   ├── people/               # People/events management
│   │   └── settings/             # Settings
│   ├── api/auth/[...nextauth]/   # NextAuth API route
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── auth/                     # Authentication forms
│   ├── events/                   # Event-related components
│   ├── settings/                 # Settings components
│   └── ui/                       # shadcn/ui components
├── lib/                          # Utility libraries
│   ├── api.ts                    # Axios API client
│   ├── auth.ts                   # NextAuth configuration
│   ├── utils.ts                  # Helper functions
│   └── validations.ts            # Zod schemas
└── types/                        # TypeScript type definitions
```

## Key Pages

- `/` - Login page
- `/register` - User registration
- `/dashboard` - Upcoming events homepage
- `/dashboard/people` - View all people and events
- `/dashboard/people/new` - Add new person/event
- `/dashboard/people/[id]/edit` - Edit person/event
- `/dashboard/settings` - App settings

## API Integration

The frontend expects the following backend endpoints:

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /friends` - Get all events
- `POST /friends` - Create event
- `GET /friends/:id` - Get event by ID
- `PUT /friends/:id` - Update event
- `DELETE /friends/:id` - Delete event
- `GET /birthdays/upcoming` - Get upcoming events
- `GET /birthdays/calendar/export` - Export calendar
- `POST /telegram/test` - Send test notification

## Authentication Flow

1. User logs in via the login page
2. NextAuth verifies credentials with backend `/auth/login`
3. JWT token stored in session
4. Middleware protects `/dashboard/*` routes
5. API client automatically adds JWT to requests

## Terminology

- **In UI**: "People", "Events", "Add Person"
- **In Backend**: `/friends`, `/birthdays` endpoints
- **Event Types**: Generic - supports Birthday, Anniversary, Wedding, etc.

## Styling

- Uses shadcn/ui components for consistent, accessible UI
- TailwindCSS for utility-first styling
- Responsive design with mobile, tablet, and desktop breakpoints
- Modern gradient backgrounds on auth and dashboard pages

## License

Private project - All rights reserved
