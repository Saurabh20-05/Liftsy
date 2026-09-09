import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sessionsAPI } from '../utils/api';
import {
  Dumbbell,
  Play,
  TrendingUp,
  Timer,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [statsResponse, historyResponse] = await Promise.all([
          sessionsAPI.stats({ period: 30 }),
          sessionsAPI.history({ limit: 5 }),
        ]);

        setStats(statsResponse.data);
        setRecentSessions(historyResponse.data.sessions || []);
      } catch {
        setStats(null);
        setRecentSessions([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const formatDuration = (seconds) => {
    if (!seconds) return '0m';

    const minutes = Math.floor(seconds / 60);

    if (minutes >= 60) {
      return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    }

    return `${minutes}m`;
  };

  const greeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="skeleton dashboard-loading-title" />
        <div className="skeleton dashboard-loading-hero" />

        <div className="dashboard-stat-grid">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="skeleton dashboard-loading-stat"
            />
          ))}
        </div>
      </div>
    );
  }

  const volume = stats?.totalVolume
    ? `${(stats.totalVolume / 1000).toFixed(1)}t`
    : '0kg';

  const totalSessions =
    user?.stats?.totalWorkouts ??
    user?.stats?.totalSessions ??
    0;

  const statCards = [
    {
      label: 'Workouts',
      value: stats?.totalSessions || 0,
      note: 'Last 30 days',
      icon: Dumbbell,
    },
    {
      label: 'Volume',
      value: volume,
      note: 'Last 30 days',
      icon: TrendingUp,
    },
    {
      label: 'Average duration',
      value: formatDuration(stats?.avgDuration),
      note: 'Per session',
      icon: Timer,
    },
    {
      label: 'Total sessions',
      value: totalSessions,
      note: 'All time',
      icon: Dumbbell,
    },
  ];

  return (
    <div className="dashboard-page">
      <section className="dashboard-header">
        <div>
          <p className="dashboard-greeting">{greeting()}</p>

          <h1>
            {user?.displayName || user?.username || 'there'}
          </h1>

          {user?.stats?.currentStreak > 0 && (
            <div className="dashboard-streak">
              <Flame size={17} />
              {user.stats.currentStreak} day streak
            </div>
          )}
        </div>

        <Link
          to="/session/active"
          className="dashboard-start-button"
        >
          <Play size={19} />
          Start workout
        </Link>
      </section>

      <section className="dashboard-callout">
        <div>
          <p>Ready when you are</p>

          <h2>Keep your momentum going.</h2>

          <span>
            Start a session and keep your training history up to date.
          </span>
        </div>

        <Link
          to="/session/active"
          className="dashboard-secondary-button"
        >
          Begin session
          <ArrowRight size={17} />
        </Link>
      </section>

      <section className="dashboard-stat-grid">
        {statCards.map(({ label, value, note, icon: Icon }) => (
          <div className="dashboard-stat" key={label}>
            <div className="dashboard-stat-top">
              <span>{label}</span>
              <Icon size={18} />
            </div>

            <strong>{value}</strong>

            <small>{note}</small>
          </div>
        ))}
      </section>

      <section className="dashboard-content-grid">
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h3>Recent sessions</h3>
              <p>Your latest training</p>
            </div>

            <Link to="/sessions">View all</Link>
          </div>

          {recentSessions.length === 0 ? (
            <div className="dashboard-empty">
              <div className="dashboard-empty-icon">
                <Dumbbell size={20} />
              </div>

              <strong>No sessions yet</strong>

              <span>
                Your completed workouts will appear here.
              </span>

              <Link to="/session/active">
                Start your first workout
              </Link>
            </div>
          ) : (
            <div>
              {recentSessions.map((session) => (
                <Link
                  key={session._id}
                  to={`/sessions/${session._id}`}
                  className="session-row"
                >
                  <div className="session-icon">
                    <Dumbbell size={18} />
                  </div>

                  <div className="session-info">
                    <strong>
                      {session.workoutName || 'Workout session'}
                    </strong>

                    <span>
                      {session.startTime
                        ? formatDistanceToNow(
                            new Date(session.startTime),
                            { addSuffix: true }
                          )
                        : 'Recently'}
                    </span>
                  </div>

                  <div className="session-meta">
                    <strong>
                      {formatDuration(session.duration)}
                    </strong>

                    <span>
                      {session.stats?.totalSets || 0} sets
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="dashboard-section-label">
            Quick access
          </div>

          <div className="dashboard-links">
            <Link to="/workouts">
              <Dumbbell size={19} />

              <div>
                <strong>My workouts</strong>
                <span>Build and manage your plans</span>
              </div>

              <ArrowRight size={17} />
            </Link>

            <Link to="/ai-coach">
              <span className="quick-access-ai">AI</span>

              <div>
                <strong>AI coach</strong>
                <span>Get help with your training</span>
              </div>

              <ArrowRight size={17} />
            </Link>

            <Link to="/progress">
              <TrendingUp size={19} />

              <div>
                <strong>Progress</strong>
                <span>See how your training is moving</span>
              </div>

              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}