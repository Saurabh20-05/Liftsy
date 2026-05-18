# 🏋️ Liftsy — AI-Powered Fitness Social Platform

A full-stack MERN + AI/ML fitness platform with social features, real-time workout tracking, and an intelligent coaching system.

---

## ✨ Features

### 💪 Workout Management
- Create, edit, delete custom workout plans
- Exercise library with 30+ exercises pre-seeded
- Set/rep/weight/rest timer tracking per exercise
- AI-generated workout plans via GPT

### 📊 Session Tracking
- Live workout session with real-time timer
- Per-set logging: weight, reps, RPE, rest timer
- Animated rest countdown timer
- Auto-detect personal records (PRs)
- Session completion with mood & energy rating

### 🤖 AI / ML Features
- **AI Workout Generator** — describe a goal, get a full plan
- **AI Session Analyzer** — post-workout analysis with strengths & improvements
- **AI Coach Chat** — GPT-powered personal fitness coach
- **Progressive Overload Suggestions** — smart weight/rep recommendations
- **Form Tips** — exercise-specific cues on demand

### 📱 Social Platform
- Twitter/Instagram-style social feed
- Post workout summaries with stats
- Like, react (🔥💪❤️😮👏🦁), and comment
- Follow / unfollow athletes
- User profiles with stats, badges, posts
- Real-time notifications via Socket.IO
- Explore page: discover workouts & athletes

### 📈 Progress Analytics
- Volume over time chart (Chart.js)
- Session duration trends
- Top exercises frequency
- Mood distribution pie chart
- 7/30/90 day period selector

### 🏆 Leaderboard
- Ranked by total training volume
- Podium display for top 3
- Your personal rank highlighted

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- OpenAI API key (for AI features — optional but recommended)

### 1. Clone & Install

```bash
git clone <your-repo>
cd Liftsy

# Install root dependencies
npm install

# Install all dependencies (backend + frontend)
npm run install:all
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/Liftsy
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRE=7d
GROQ_API_KEY=sk-your-openai-key-here
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### 3. Seed Exercise Library

```bash
npm run seed
```

This seeds 30+ exercises into your database.

### 4. Run Development Servers

```bash
# From root — runs both backend (port 5000) and frontend (port 3000)
npm run dev
```

Or run separately:
```bash
npm run start:backend   # Backend only
npm run start:frontend  # Frontend only
```

### 5. Open App

Visit: **http://localhost:3000**

Register an account and start training! 🎉

---

## 📁 Project Structure

```
Liftsy/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema with stats, badges, social
│   │   ├── Workout.js       # Workout plans with exercises & sets
│   │   ├── Session.js       # Training sessions with real-time data
│   │   ├── Exercise.js      # Exercise library
│   │   └── Post.js          # Social posts with reactions & comments
│   ├── routes/
│   │   ├── auth.js          # Register, login, profile
│   │   ├── workouts.js      # CRUD + save + rate
│   │   ├── sessions.js      # Start, update, complete, share, stats
│   │   ├── exercises.js     # Library with search & filters
│   │   ├── social.js        # Feed, posts, likes, reactions, comments
│   │   ├── users.js         # Profiles, follow, leaderboard
│   │   ├── ai.js            # Generate, analyze, coach, form tips
│   │   └── feed.js          # Public feed
│   ├── middleware/
│   │   └── auth.js          # JWT middleware
│   ├── utils/
│   │   ├── seed.js          # Exercise library seeder
│   │   └── socketHandlers.js # Real-time socket events
│   └── server.js            # Express + Socket.IO entry point
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── LoginPage.js
        │   ├── RegisterPage.js
        │   ├── DashboardPage.js       # Home hub with stats
        │   ├── WorkoutsPage.js        # Manage workouts + AI generate
        │   ├── WorkoutDetailPage.js   # View workout plan
        │   ├── ActiveSessionPage.js   # 🔥 Live workout tracker
        │   ├── SessionDetailPage.js   # Post-session + AI analysis
        │   ├── SessionHistoryPage.js  # Grouped history log
        │   ├── FeedPage.js            # Social feed
        │   ├── ExplorePage.js         # Discover workouts & athletes
        │   ├── ProfilePage.js         # User profile
        │   ├── AiCoachPage.js         # GPT chat coach
        │   ├── ProgressPage.js        # Analytics charts
        │   └── LeaderboardPage.js     # Rankings
        ├── components/
        │   └── layout/
        │       ├── Layout.js
        │       └── Sidebar.js
        ├── context/
        │   ├── AuthContext.js         # Auth state
        │   └── SocketContext.js       # Real-time connection
        ├── utils/
        │   └── api.js                 # Axios + all API calls
        └── styles/
            └── global.css             # Design system
```

---

## 🔑 API Overview

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| GET | `/api/workouts/explore` | Public workouts |
| POST | `/api/workouts` | Create workout |
| POST | `/api/sessions/start` | Start session |
| PUT | `/api/sessions/:id` | Update live session |
| POST | `/api/sessions/:id/complete` | Finish session |
| POST | `/api/sessions/:id/share` | Share to feed |
| GET | `/api/social/feed` | Following feed |
| POST | `/api/social/post/:id/like` | Like post |
| POST | `/api/social/post/:id/react` | React to post |
| POST | `/api/ai/generate-workout` | AI workout plan |
| POST | `/api/ai/analyze-session/:id` | AI session analysis |
| POST | `/api/ai/coach` | AI coach chat |
| GET | `/api/users/leaderboard/volume` | Volume leaderboard |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, Chart.js |
| Styling | Custom CSS design system (dark theme) |
| Real-time | Socket.IO |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Auth | JWT + bcrypt |
| AI | GROQ AI |
| Animations | Framer Motion + CSS |

---

## 🎨 Design System

- **Colors**: Dark athletic theme with electric yellow accent (`#e8ff3c`)
- **Typography**: Bebas Neue (display), Barlow Condensed (UI), Barlow (body)
- **Components**: Cards, modals, badges, stat cards, tab bars, number inputs
- **Responsive**: Mobile-first with collapsible sidebar

---

## ⚙️ Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | JWT signing secret (keep secret!) |
| `GROQ_API_KEY` | ⭐ | For AI features (optional, but AI pages won't work without it) |
| `PORT` | ❌ | Backend port (default: 5000) |
| `CLIENT_URL` | ❌ | Frontend URL for CORS (default: http://localhost:3000) |

---

## 📝 License

MIT — free to use, modify, and distribute.

---

Built with 💪 by Liftsy
