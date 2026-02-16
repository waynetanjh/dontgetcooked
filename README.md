# Don't Get Cooked

A birthday and event reminder app that sends Telegram notifications so you never forget important dates. Built with Next.js, NestJS, and PostgreSQL.

## Features

- User authentication (register/login)
- Add, edit, and delete events with custom labels and notes
- Daily Telegram reminders for upcoming events via cron job
- Calendar export
- Responsive dashboard UI

## Tech Stack

- **Frontend:** Next.js, NextAuth, Tailwind CSS, shadcn/ui
- **Backend:** NestJS, Prisma, PostgreSQL
- **Infrastructure:** Docker Compose, Caddy (reverse proxy), Vercel (frontend hosting)

## Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/birthdays
JWT_SECRET="your-jwt-secret"
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
TELEGRAM_CHAT_ID="your-telegram-chat-id"
TZ="Asia/Singapore"
CRON_TIME="0 9 * * *"
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## Getting Started

### Local Development

1. Clone the repo and install dependencies:

```bash
cd backend && npm install
cd ../frontend && npm install
```

2. Set up environment variables for both `backend/.env` and `frontend/.env.local` using the examples above.

3. Start the database with Docker Compose:

```bash
cd backend
docker-compose -f docker-compose.local.yml up --build
```

4. Start the frontend:

```bash
cd frontend
npm run dev
```

5. Start prisma studio 
```bash
cd backend
npx prisma studio
```

### Production Deployment (AWS EC2 + Caddy)

#### 1. Install Caddy

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

#### 2. Configure Caddy

Edit the Caddyfile to reverse proxy to your backend:

```bash
sudo nano /etc/caddy/Caddyfile
```

Replace the contents with:

```
your-domain.com {
    reverse_proxy localhost:3001
}
```

#### 3. Start Caddy

```bash
sudo systemctl restart caddy
sudo systemctl enable caddy
sudo systemctl status caddy
```

Caddy automatically provisions SSL certificates via Let's Encrypt.

#### 4. Start the Backend and the database

```bash
cd backend
sudo docker-compose up --build -d
```

#### 5. AWS Security Group

Ensure your EC2 security group allows inbound traffic on:

| Port | Protocol | Purpose |
|------|----------|---------|
| 22   | TCP      | SSH     |
| 80   | TCP      | HTTP (Caddy + Let's Encrypt) |
| 443  | TCP      | HTTPS   |
