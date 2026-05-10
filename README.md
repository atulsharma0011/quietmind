# 🌿 QuietMind — Silent AI Productivity

A full-stack productivity app with mood-aware AI task prioritization, built with React + Express + MongoDB.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ ([nodejs.org](https://nodejs.org))
- **MongoDB** running locally **OR** a free [MongoDB Atlas](https://cloud.mongodb.com) cluster
- npm v9+

---

### 1. Install dependencies

```bash
# From the project root
npm install
cd server && npm install
cd ../client && npm install
```

### 2. Configure the server

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/quietmind   # or your Atlas URI
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Run in development

**Option A — two terminals:**
```bash
# Terminal 1 — API server
cd server && npm run dev

# Terminal 2 — React client
cd client && npm run dev
```

**Option B — from root (uses concurrently):**
```bash
npm run dev
```

Open **http://localhost:5173** → Register an account → Done!

---

## 🏗 Project Structure

```
quietmind/
├── server/
│   ├── index.js              # Express app entry
│   ├── config/database.js    # MongoDB connection
│   ├── models/
│   │   ├── User.js           # Auth + settings
│   │   ├── Task.js           # Tasks with AI virtual fields
│   │   └── Mood.js           # One mood per user per day
│   ├── middleware/
│   │   ├── auth.js           # JWT protect middleware
│   │   └── errorHandler.js   # Centralized error handling
│   └── routes/
│       ├── auth.js           # /api/auth/*
│       ├── tasks.js          # /api/tasks/* + /suggest
│       ├── moods.js          # /api/moods/*
│       └── insights.js       # /api/insights
│
└── client/src/
    ├── App.jsx               # Router + layout shell
    ├── api/client.js         # Fetch wrapper for all API calls
    ├── store/useStore.js     # Zustand global state
    ├── utils.js              # Helpers: formatDate, calcPriority, etc.
    ├── index.css             # Full design system (CSS variables)
    └── components/
        ├── layout/           # Sidebar, MobileNav
        ├── ui/               # TaskModal, Toasts
        └── views/            # Dashboard, Tasks, Mood, Insights, Settings, Login, Register
```

---

## 🔌 API Reference

All routes except `/api/auth/login` and `/api/auth/register` require:
```
Authorization: Bearer <jwt_token>
```

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PATCH | `/api/auth/settings` | Update settings |
| GET | `/api/tasks` | Get all tasks |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/:id` | Update/complete task |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/tasks/suggest` | AI-powered next action |
| GET | `/api/moods` | Get mood history |
| GET | `/api/moods/today` | Today's mood |
| POST | `/api/moods` | Log mood (upsert) |
| GET | `/api/insights` | 7-day analytics |

---

## 🧠 AI Prioritization

Tasks are scored on the fly using this formula:

```
score = importance × 0.4 + urgency × 0.3 + deadlineProximityBonus
```

Deadline bonuses: overdue +3.0, today +2.5, tomorrow +2.0, ≤3 days +1.4, ≤7 days +0.7, later +0.15

Mood adjustments:
- **Stressed**: manageable tasks (low urgency/importance) get +30%, high-urgency tasks get -30%
- **Happy**: all scores get +5%

---

## 🚢 Production Build

```bash
# Build the React client
cd client && npm run build

# Serve client via Express (optional — add to server/index.js)
# Or deploy client to Vercel/Netlify and server to Railway/Render
```

For production, set `NODE_ENV=production` and use a real MongoDB Atlas URI.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router, Zustand, Chart.js |
| Backend | Node.js, Express, JWT, Bcrypt |
| Database | MongoDB with Mongoose |
| Styling | Custom CSS (design system with CSS variables) |
| Build | Vite |

---

## 📝 License

MIT — use freely for personal or commercial projects.
