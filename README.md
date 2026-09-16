# ⚡ FunBuzz — College Fun Event Bonus Round

A real-time MERN stack web application for managing a college fun event bonus-point/tie-breaker round. Features live leaderboard updates via Socket.IO, admin-controlled question selection, and mobile-first participant dashboard.

## 🎯 Features

- **Real-time Leaderboard** — Socket.IO powered, updates instantly across all devices
- **Admin Dashboard** — Question board, score management, participant management, event control
- **Participant Dashboard** — Mobile-first, shows score, rank, and live leaderboard
- **50 Questions** across 5 difficulty tiers: 🌊 Chill → 🔥 Blaze → 💀 Savage → ☠️ Brutal → 👑 Legendary
- **Competition Ranking** — Ties get equal ranks (1, 1, 3, 4)
- **Event Control** — Start, pause, end, reset the event
- **Score History** — Audit trail for all score changes

## 📋 Prerequisites

- **Node.js** 18+
- **MongoDB** (local, Atlas, or auto in-memory fallback)

## 🚀 Quick Start

### 1. Backend

```bash
cd server
npm install
```

Create a `.env` file (or use the auto-generated one):
```env
MONGO_URI=mongodb://localhost:27017/funbuzz
JWT_SECRET=your-secret-key
PORT=5000
CLIENT_URL=http://localhost:5173
```

> **Note:** If MongoDB is not running locally, the server will automatically start an in-memory MongoDB instance and auto-seed the database.

```bash
npm run dev
```

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

### 3. Seed Database (Manual — optional if auto-seed works)

```bash
cd server
npm run seed
```

## 🔑 Login Credentials

### Admin
- **Username:** `admin`
- **Password:** `admin123`
- **URL:** http://localhost:5173/admin/login

### Sample Participant
- **Name:** `Arun Kumar`
- **Roll Number:** `26MCA101`
- **URL:** http://localhost:5173/

(10 sample participants are pre-created: 26MCA101 through 26MCA110)

## 🏗️ Architecture

```
fun-event/
├── client/                 # React + Vite frontend
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── context/        # Auth, Socket, Event contexts
│       ├── hooks/          # Custom hooks (useLeaderboard)
│       ├── layouts/        # Admin & Participant layouts
│       ├── pages/          # All page components
│       ├── services/       # API service layer
│       └── utils/          # Constants & helpers
│
└── server/                 # Express + MongoDB backend
    ├── config/             # DB connection, env
    ├── controllers/        # Route handlers
    ├── middleware/          # Auth, admin guard, error handler
    ├── models/             # 6 Mongoose models
    ├── routes/             # API route definitions
    ├── sockets/            # Socket.IO setup
    └── utils/              # Seed data utility
```

## 📡 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express.js, MongoDB, Mongoose |
| Real-time | Socket.IO |
| Auth | JWT, bcryptjs |
| Icons | Lucide React |
| Notifications | React Hot Toast |

## 🎮 How It Works

1. **Admin** logs in and starts the event
2. **Admin** selects a question from the visual board
3. **Admin** conducts the question with participants
4. **Admin** searches for a participant and enters their score
5. Score is saved → Socket.IO broadcasts → **All participant screens update instantly**

## 🚢 Deployment

This app is deployment-ready for:
- **Render** / **Railway** — Deploy server and client separately
- **Vercel** — Frontend only (set API URL in env)
- **MongoDB Atlas** — Replace MONGO_URI with your Atlas connection string

For production:
```bash
cd client
npm run build
```

## ⚠️ Important

- The `admin/admin123` credentials are for **development only**. Change them for production.
- The in-memory MongoDB fallback is for development. Use a real MongoDB instance in production.
