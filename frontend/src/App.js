import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import WorkoutsPage from './pages/WorkoutsPage';
import WorkoutDetailPage from './pages/WorkoutDetailPage';
import ActiveSessionPage from './pages/ActiveSessionPage';
import SessionHistoryPage from './pages/SessionHistoryPage';
import SessionDetailPage from './pages/SessionDetailPage';
import FeedPage from './pages/FeedPage';
import ExplorePage from './pages/ExplorePage';
import ProfilePage from './pages/ProfilePage';
import AiCoachPage from './pages/AiCoachPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProgressPage from './pages/ProgressPage';
import './styles/global.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-0)' }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="workouts" element={<WorkoutsPage />} />
        <Route path="workouts/:id" element={<WorkoutDetailPage />} />
        <Route path="session/active" element={<ActiveSessionPage />} />
        <Route path="sessions" element={<SessionHistoryPage />} />
        <Route path="sessions/:id" element={<SessionDetailPage />} />
        <Route path="feed" element={<FeedPage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="profile/:username" element={<ProfilePage />} />
        <Route path="ai-coach" element={<AiCoachPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="progress" element={<ProgressPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: 'var(--bg-3)', color: 'var(--text-1)', border: '1px solid var(--border)', fontFamily: 'var(--font-body)' },
              success: { iconTheme: { primary: 'var(--accent)', secondary: 'var(--bg-0)' } },
            }}
          />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}
