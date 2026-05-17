import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import {
  MdDashboard, MdFitnessCenter, MdPlayCircle, MdHistory,
  MdPeople, MdExplore, MdPsychology, MdLeaderboard,
  MdTrendingUp, MdLogout, MdMenu, MdClose
} from 'react-icons/md';

const navItems = [
  { to: '/dashboard', icon: MdDashboard, label: 'Dashboard' },
  { to: '/feed', icon: MdPeople, label: 'Feed' },
  { to: '/workouts', icon: MdFitnessCenter, label: 'Workouts' },
  { to: '/session/active', icon: MdPlayCircle, label: 'Start Workout', accent: true },
  { to: '/sessions', icon: MdHistory, label: 'History' },
  { to: '/progress', icon: MdTrendingUp, label: 'Progress' },
  { to: '/explore', icon: MdExplore, label: 'Explore' },
  { to: '/ai-coach', icon: MdPsychology, label: 'AI Coach' },
  { to: '/leaderboard', icon: MdLeaderboard, label: 'Leaderboard' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { notifications } = useSocket();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const unread = (notifications || []).filter(n => !n.read).length;
  const handleLogout = () => { logout(); navigate('/login'); };
  const close = () => setMobileOpen(false);

  return (
    <>
      <button
        onClick={() => setMobileOpen(o => !o)}
        style={{
          position: 'fixed',
          top: 12,
          left: 12,
          zIndex: 400,
          background: 'var(--bg-2)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '8px',
          color: 'var(--text-1)',
          cursor: 'pointer',
          display: 'none',  
          alignItems: 'center',
          justifyContent: 'center',
        }}
        id="mobile-menu-btn"
      >
        {mobileOpen ? <MdClose size={22} /> : <MdMenu size={22} />}
      </button>

      {mobileOpen && (
        <div
          onClick={close}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 300,
          }}
        />
      )}

      <aside
        style={{
          position: 'fixed',
          left: 0, top: 0, bottom: 0,
          width: 'var(--sidebar-width, 260px)',
          background: 'var(--bg-1)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 350,
          overflowY: 'auto',
          transition: 'transform 0.25s ease',
        }}
        id="sidebar-panel"
      >
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MdFitnessCenter size={20} color="var(--bg-0)" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, letterSpacing: 2, color: 'var(--accent)' }}>
              Liftsy
            </span>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px' }}>
          {navItems.map(({ to, icon: Icon, label, accent }) => (
            <NavLink
              key={to}
              to={to}
              onClick={close}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 8,
                marginBottom: 2,
                fontFamily: 'var(--font-condensed)',
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: '0.04em',
                color: accent ? 'var(--bg-0)' : isActive ? 'var(--accent)' : 'var(--text-2)',
                background: accent ? 'var(--accent)' : isActive ? 'var(--accent-dim)' : 'transparent',
                transition: 'all 0.15s',
                textDecoration: 'none',
              })}
            >
              <Icon size={18} />
              {label}
              {label === 'Feed' && unread > 0 && (
                <span style={{ marginLeft: 'auto', background: 'var(--red)', color: 'white', borderRadius: 100, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
                  {unread}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {user && (
          <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
            <NavLink
              to={`/profile/${user.username}`}
              onClick={close}
              style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, textDecoration: 'none' }}
            >
              <div className="avatar avatar-sm" style={{ background: 'var(--accent-dim)', color: 'var(--accent)', fontSize: 14, flexShrink: 0 }}>
                {user.avatar
                  ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  : user.displayName?.[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.displayName}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>@{user.username}</div>
              </div>
            </NavLink>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
              <MdLogout size={16} /> Sign Out
            </button>
          </div>
        )}
      </aside>

      <style>{`
        /* Desktop: sidebar visible, hamburger hidden */
        @media (min-width: 901px) {
          #mobile-menu-btn { display: none !important; }
          #sidebar-panel { transform: translateX(0) !important; }
        }
        /* Mobile: sidebar hidden by default, hamburger shown */
        @media (max-width: 900px) {
          #mobile-menu-btn { display: flex !important; }
          #sidebar-panel {
            transform: ${mobileOpen ? 'translateX(0)' : 'translateX(-100%)'};
            width: 260px !important;
          }
          .main-content {
            margin-left: 0 !important;
            padding-top: 56px !important;
          }
        }
      `}</style>
    </>
  );
}
