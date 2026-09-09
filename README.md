# 🏋️ Liftsy

> **Train smarter. Track everything. Improve consistently.**

Liftsy is a full-stack **AI-powered fitness and social platform** built to make strength training more structured, measurable, and engaging.

It combines workout planning, live session tracking, progress analytics, AI-powered coaching, and a social fitness community into one platform.

---

## ✨ What is Liftsy?

Liftsy lets users:

- Build and manage personalized workout plans
- Browse a pre-seeded exercise library
- Track workouts set by set in real time
- Record weight, reps, RPE, rest, mood, and energy
- Automatically calculate workout statistics and detect PRs
- Analyze completed sessions with AI
- Get progressive-overload recommendations
- Ask an AI fitness coach questions
- Discover and share workouts
- Follow other athletes and interact with their posts
- Track long-term training progress
- Compete through a volume-based leaderboard

The platform is designed around the complete training journey:

**Plan → Train → Track → Analyze → Improve → Share**

---

## 🚀 Live Application

**Frontend:** https://liftsy.vercel.app

**Backend API:** https://liftsy-backend.onrender.com

---

## 🎯 Core Features

### 💪 Workout Management

Create and manage complete workout plans from one place.

- Create custom workouts
- Edit existing workout plans
- Delete workouts
- Add multiple exercises
- Configure sets, reps, weight, and rest
- Public/private workout visibility
- Explore public workouts
- AI-generated workout plans
- Exercise search and filtering
- 30+ pre-seeded exercises

---

### 🔥 Live Workout Tracking

Track an actual training session while you work out.

- Real-time workout timer
- Exercise-by-exercise tracking
- Set-by-set logging
- Weight and rep tracking
- RPE tracking
- Rest timer
- Animated rest countdown
- Personal record detection
- Live workout statistics
- Mood and energy rating after completion

A completed session stores the actual training data rather than only the original workout template.

---

### 📊 Training Analytics

Turn workout history into measurable progress.

- Total training volume
- Workout/session count
- Average session duration
- Volume trends
- Session duration trends
- Exercise frequency
- Mood distribution
- 7 / 30 / 90 day analysis
- Historical session data
- Personal training statistics

Charts are powered by **Chart.js**.

---

## 🤖 AI-Powered Training

Liftsy integrates AI directly into the training workflow.

### AI Workout Generator

Describe your goal and the platform can generate a structured workout plan.

Examples:

- Muscle building
- Strength training
- Fat loss
- Beginner training
- Specific muscle-group training

---

### AI Session Analyzer

After completing a workout, Liftsy can analyze the session and provide:

- Training summary
- Strengths
- Areas for improvement
- Training observations
- Practical recommendations

---

### AI Coach

A dedicated conversational fitness coach that understands the user's training context.

Users can ask questions about:

- Workout planning
- Exercise selection
- Training progression
- Recovery
- Training consistency
- Progressive overload
- General fitness guidance

---

### Progressive Overload Suggestions

Liftsy can provide training progression recommendations based on previous performance.

The goal is to turn historical workout data into actionable next-session suggestions.

---

### Exercise Form Tips

Get exercise-specific technique guidance directly from the platform.

---

## 📱 Social Fitness Platform

Liftsy is not only a workout tracker — it also includes a fitness-focused social layer.

### Social Feed

Users can share completed workout sessions and interact with other athletes.

- Workout posts
- Workout statistics
- Likes
- Reactions
- Comments
- Follow/unfollow
- Public posts
- Following feed
- Explore feed

Available reactions include:

**🔥 💪 ❤️ 😮 👏 🦁**

---

### 👤 Athlete Profiles

Each profile can display:

- Display name
- Username
- Avatar
- Training statistics
- Workout activity
- Badges
- Social posts
- Followers/following information

---

### 🔎 Explore

Discover content across the platform.

#### Workouts

- Public workout plans
- Search
- Category filtering
- Difficulty filtering
- Sorting

#### Athletes

- Search users
- Discover other athletes
- View profiles
- Follow athletes

---

### 🔔 Real-Time Notifications

Liftsy uses **Socket.IO** for real-time application events and notifications.

---

## 🏆 Leaderboard

Compete with other athletes based on total training volume.

Features:

- Global volume ranking
- Top 3 podium
- Personal rank
- Training-volume comparison

---

## 🔐 Authentication & Security

Liftsy uses:

- JWT authentication
- Password hashing with bcrypt
- Protected API routes
- Authenticated frontend routes
- Axios authentication interceptor
- Environment-based secrets
- CORS configuration

Authentication flow:

**Register → Login → JWT → Protected Routes → Authenticated API Requests**

---

# 🏗️ Architecture

```text
                         ┌─────────────────────┐
                         │      Liftsy UI      │
                         │   React Frontend    │
                         └──────────┬──────────┘
                                    │
                              HTTPS / REST
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    Express API      │
                         │   Node.js Backend   │
                         └──────┬──────┬───────┘
                                │      │
                       ┌────────┘      └──────────┐
                       ▼                          ▼
              ┌─────────────────┐        ┌─────────────────┐
              │ MongoDB Atlas   │        │    GROQ AI      │
              │  Application DB │        │ AI capabilities │
              └─────────────────┘        └─────────────────┘

                         ┌─────────────────┐
                         │    Socket.IO    │
                         │ Real-time events│
                         └─────────────────┘
```

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 |
| Routing | React Router 6 |
| Styling | Custom CSS Design System |
| Icons | Lucide React |
| Charts | Chart.js |
| Backend | Node.js |
| API | Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JWT + bcrypt |
| AI | GROQ AI |
| Real-time | Socket.IO |
| HTTP Client | Axios |
| Notifications | React Hot Toast |
| Date Utilities | date-fns |
| Deployment | Vercel + Render + MongoDB Atlas |

## 📁 Project Structure

```text
Liftsy/
│
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Workout.js
│   │   ├── Session.js
│   │   ├── Exercise.js
│   │   └── Post.js
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   ├── workouts.js
│   │   ├── sessions.js
│   │   ├── exercises.js
│   │   ├── social.js
│   │   ├── users.js
│   │   ├── ai.js
│   │   └── feed.js
│   │
│   ├── middleware/
│   │   └── auth.js
│   │
│   ├── utils/
│   │   ├── seed.js
│   │   └── socketHandlers.js
│   │
│   └── server.js
│
├── frontend/
│   └── src/
│       ├── components/
│       │   └── layout/
│       │       ├── Layout.js
│       │       └── Sidebar.js
│       │
│       ├── context/
│       │   ├── AuthContext.js
│       │   └── SocketContext.js
│       │
│       ├── pages/
│       │   ├── LoginPage.js
│       │   ├── RegisterPage.js
│       │   ├── DashboardPage.js
│       │   ├── WorkoutsPage.js
│       │   ├── WorkoutDetailPage.js
│       │   ├── ActiveSessionPage.js
│       │   ├── SessionDetailPage.js
│       │   ├── SessionHistoryPage.js
│       │   ├── FeedPage.js
│       │   ├── ExplorePage.js
│       │   ├── ProfilePage.js
│       │   ├── AiCoachPage.js
│       │   ├── ProgressPage.js
│       │   └── LeaderboardPage.js
│       │
│       ├── utils/
│       │   └── api.js
│       │
│       └── styles/
│           └── global.css
│
├── package.json
└── README.md
```

## 🔌 API Overview

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/auth/register | Register a user |
| POST | /api/auth/login | Authenticate user |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/profile | Update profile |

### Workouts

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/workouts/explore | Explore public workouts |
| GET | /api/workouts/mine | Get user's workouts |
| GET | /api/workouts/:id | Get workout |
| POST | /api/workouts | Create workout |
| PUT | /api/workouts/:id | Update workout |
| DELETE | /api/workouts/:id | Delete workout |
| POST | /api/workouts/:id/save | Save workout |
| POST | /api/workouts/:id/rate | Rate workout |

### Exercises

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/exercises | Exercise library |
| GET | /api/exercises/:id | Exercise details |
| POST | /api/exercises | Create custom exercise |
| GET | /api/exercises/meta/muscles | Muscle filters |
| GET | /api/exercises/meta/equipment | Equipment filters |

### Sessions

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/sessions/start | Start workout session |
| GET | /api/sessions/active | Get active session |
| PUT | /api/sessions/:id | Update session |
| POST | /api/sessions/:id/complete | Complete session |
| POST | /api/sessions/:id/share | Share session |
| GET | /api/sessions/history | Session history |
| GET | /api/sessions/:id | Session details |
| GET | /api/sessions/stats/overview | Training statistics |

### Social

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/social/feed | Following feed |
| GET | /api/social/explore | Explore social posts |
| POST | /api/social/post | Create post |
| POST | /api/social/post/:id/like | Like post |
| POST | /api/social/post/:id/react | React to post |
| POST | /api/social/post/:id/comment | Comment |
| DELETE | /api/social/post/:id/comment/:commentId | Delete comment |

### Users

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/users/search | Search athletes |
| GET | /api/users/:username | View profile |
| POST | /api/users/:id/follow | Follow/unfollow |
| GET | /api/users/me/notifications | Get notifications |
| PUT | /api/users/me/notifications/read | Mark notifications read |
| GET | /api/users/leaderboard/volume | Volume leaderboard |

### AI

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/ai/generate-workout | Generate workout |
| POST | /api/ai/analyze-session/:id | Analyze session |
| POST | /api/ai/coach | AI coach conversation |
| POST | /api/ai/form-tips | Exercise form tips |
| POST | /api/ai/suggest-progression | Progressive overload |

## ⚙️ Local Development

### Prerequisites

- Node.js 18+
- npm
- MongoDB local instance or MongoDB Atlas
- GROQ API key for AI functionality

### 1. Clone the Repository
```
git clone https://github.com/Saurabh20-05/Liftsy.git
cd Liftsy
```

### 2. Install Dependencies
```
npm install
npm run install:all
```

### 3. Configure Backend Environment

Create:

backend/.env

Example:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/Liftsy
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
GROQ_API_KEY=your_groq_api_key
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

Never commit .env files or API keys to GitHub.

### 4. Seed the Exercise Library

From the backend directory:
```
cd backend
node utils/seed.js
```

The seed script populates the exercise library with 30+ exercises.

### 5. Start the Application

From the project root:
```
npm run dev
```

Or start the services independently:
```
npm run start:backend
npm run start:frontend
```

### 6. Open the Application

http://localhost:3000

## 🌐 Production Deployment

The current production architecture uses:

- Frontend → Vercel
- Backend → Render
- Database → MongoDB Atlas

### Frontend Environment

For production, the frontend API URL should point to the deployed backend:
```
REACT_APP_API_URL=https://liftsy-backend.onrender.com/api
```

### Backend Environment

Render should contain the production environment variables:
```
PORT=10000
MONGO_URI=<mongodb-atlas-connection-string>
JWT_SECRET=<production-secret>
GROQ_API_KEY=<groq-api-key>
NODE_ENV=production
CLIENT_URL=https://liftsy.vercel.app
```

Production secrets should be configured through the deployment platform's environment-variable system rather than committed to the repository.

## 🧠 Application Flow

### Authentication
```
Register
   ↓
Password hashed with bcrypt
   ↓
User stored in MongoDB
   ↓
JWT generated
   ↓
Frontend stores authentication state
   ↓
Protected API requests
```

### Workout Flow
```
Create / Explore Workout
        ↓
Select Workout
        ↓
Start Session
        ↓
Log Sets
        ↓
Track Timer + Rest
        ↓
Complete Session
        ↓
Calculate Training Statistics
        ↓
Store Session
        ↓
Progress Analytics
        ↓
Optional AI Analysis
        ↓
Optional Share to Feed
```

### Social Flow
```
Complete Workout
      ↓
Share Session
      ↓
Social Post
      ↓
Feed
      ↓
Likes / Reactions / Comments
      ↓
Notifications
```

## 🎨 Current Design

Liftsy uses a custom dark fitness-focused design system with:

- Dark UI
- Clean horizontal navigation
- Responsive layouts
- Lucide icons
- Reusable cards and panels
- Workout-focused controls
- Interactive charts
- Modal-based workflows
- Responsive mobile navigation
- Consistent typography and spacing
- Subtle borders and restrained visual effects

The interface is intentionally designed to prioritize clarity, usability, and training data over unnecessary visual complexity.

## 📈 Data & Training Metrics

Liftsy tracks meaningful training information including:

- Total volume
- Sets
- Reps
- Weight
- RPE
- Session duration
- Workout frequency
- Exercise frequency
- Personal records
- Mood
- Energy
- Training streaks

This data powers the dashboard, history, progress analytics, leaderboard, and AI features.

## 🔮 Future Improvements

Potential future development areas include:

- Advanced recommendation models
- Exercise video demonstrations
- Wearable/device integrations
- More detailed recovery analytics
- Advanced personal-record analytics
- Workout templates
- Training program scheduling
- Richer social discovery
- Push notifications
- More granular privacy controls
- Enhanced AI personalization

## 🔒 Security Notes

Never commit:

- .env
- API keys
- JWT secrets
- Database passwords
- Production credentials

Use environment variables for all secrets.

If a production credential is accidentally exposed, revoke/rotate it immediately.

## 📄 License

MIT License.

## 💪 Built with Liftsy

Liftsy brings workouts, tracking, AI coaching, analytics, and social fitness together in one platform.

Plan your training. Track your work. Understand your progress. Keep getting stronger.
