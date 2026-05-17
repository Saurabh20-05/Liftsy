import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sessionsAPI } from '../utils/api';
import { MdPlayCircle, MdFitnessCenter, MdTrendingUp, MdLocalFireDepartment, MdTimer, MdEmojiEvents } from 'react-icons/md';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      sessionsAPI.stats({ period: 30 }),
      sessionsAPI.history({ limit: 5 }),
    ]).then(([statsRes, histRes]) => {
      setStats(statsRes.data);
      setRecentSessions(histRes.data.sessions || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const formatDuration = (seconds) => {
    if (!seconds) return '0m';
    const m = Math.floor(seconds / 60);
    const h = Math.floor(m / 60);
    return h > 0 ? `${h}h ${m % 60}m` : `${m}m`;
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) return (
    <div className="page-container">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 80, marginBottom: 16, borderRadius: 12 }} />
      ))}
    </div>
  );

  return (
    <div className="page-container animate-fade">

      <div style={{ marginBottom: 32 }}>
        <p style={{ color: 'var(--text-3)', fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-condensed)' }}>
          {greeting()}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, color: 'var(--text-1)', letterSpacing: 2, lineHeight: 1 }}>
          {user?.displayName || user?.username}
        </h1>
        {user?.stats?.currentStreak > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <MdLocalFireDepartment size={20} color="var(--orange)" />
            <span style={{ color: 'var(--orange)', fontWeight: 700, fontFamily: 'var(--font-condensed)', fontSize: 16 }}>
              {user.stats.currentStreak} Day Streak
            </span>
          </div>
        )}
      </div>



      <div style={{
        background: 'linear-gradient(135deg, var(--accent) 0%, #b8cc00 100%)',
        borderRadius: 'var(--radius-xl)', padding: '28px 32px',
        marginBottom: 28, position: 'relative', overflow: 'hidden',
        cursor: 'pointer'
      }} onClick={() => navigate('/session/active')}>
        <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.1 }}>
          <MdFitnessCenter size={160} color="black" />
        </div>
        <p style={{ fontFamily: 'var(--font-condensed)', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(0,0,0,0.6)', textTransform: 'uppercase', marginBottom: 4 }}>
          Ready to train?
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--bg-0)', letterSpacing: 2, marginBottom: 16 }}>
          START WORKOUT
        </h2>
        <button className="btn" style={{ background: 'var(--bg-0)', color: 'var(--accent)', fontFamily: 'var(--font-condensed)', gap: 8, fontSize: 15 }}>
          <MdPlayCircle size={20} /> Begin Session
        </button>
      </div>


      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { label: 'Workouts (30d)', value: stats?.totalSessions || 0, icon: MdFitnessCenter, color: 'var(--accent)' },
          { label: 'Total Volume', value: stats?.totalVolume ? `${Math.round(stats.totalVolume / 1000)}t` : '0kg', icon: MdTrendingUp, color: 'var(--blue)' },
          { label: 'Avg Duration', value: formatDuration(stats?.avgDuration), icon: MdTimer, color: 'var(--purple)' },
          { label: 'Lifetime Sessions', value: user?.stats?.totalWorkouts || 0, icon: MdEmojiEvents, color: 'var(--orange)' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <span className="stat-value" style={{ color }}>{value}</span>
              <Icon size={20} color={color} style={{ opacity: 0.6 }} />
            </div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>

        <div className="card">
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-condensed)', fontSize: 16, fontWeight: 700, letterSpacing: '0.04em' }}>Recent Sessions</h3>
            <Link to="/sessions" style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 600 }}>View All</Link>
          </div>
          <div style={{ padding: '8px 0' }}>
            {recentSessions.length === 0 ? (
              <div style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--text-3)', fontSize: 14 }}>
                No sessions yet — <Link to="/session/active" style={{ color: 'var(--accent)' }}>start your first workout!</Link>
              </div>
            ) : recentSessions.map((s) => (
              <Link key={s._id} to={`/sessions/${s._id}`}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', textDecoration: 'none', transition: 'background 0.15s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <div style={{ width: 40, height: 40, background: 'var(--accent-dim)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MdFitnessCenter size={18} color="var(--accent)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.workoutName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                    {formatDistanceToNow(new Date(s.startTime), { addSuffix: true })} · {formatDuration(s.duration)}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{s.stats?.totalVolume ? `${s.stats.totalVolume}kg` : ''}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{s.stats?.totalSets}s / {s.stats?.totalReps}r</div>
                </div>
              </Link>
            ))}
          </div>
        </div>


        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { to: '/workouts', icon: MdFitnessCenter, label: 'My Workouts', desc: 'Manage your workout plans', color: 'var(--blue)' },
            { to: '/ai-coach', icon: MdTrendingUp, label: 'AI Coach', desc: 'Get personalized advice', color: 'var(--purple)' },
            { to: '/explore', icon: MdEmojiEvents, label: 'Explore', desc: 'Discover workouts & athletes', color: 'var(--orange)' },
            { to: '/progress', icon: MdTrendingUp, label: 'Progress', desc: 'Track your growth', color: 'var(--green)' },
          ].map(({ to, icon: Icon, label, desc, color }) => (
            <Link key={to} to={to}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', textDecoration: 'none', transition: 'all 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-active)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; }}>
              <div style={{ width: 40, height: 40, background: `${color}20`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} color={color} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 1 }}>{desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
