import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import {
  MdDashboard,
  MdFitnessCenter,
  MdPlayArrow,
  MdHistory,
  MdPeople,
  MdExplore,
  MdPsychology,
  MdLeaderboard,
  MdTrendingUp,
  MdLogout,
  MdMenu,
  MdClose,
} from 'react-icons/md';

const navItems = [
  { to: '/dashboard', icon: MdDashboard, label: 'Dashboard' },
  { to: '/feed', icon: MdPeople, label: 'Feed' },
  { to: '/workouts', icon: MdFitnessCenter, label: 'Workouts' },
  { to: '/session/active', icon: MdPlayArrow, label: 'Start Workout' },
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

  const unread = notifications.filter((item) => !item.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/dashboard" className="brand">
            Liftsy
          </NavLink>

          <nav className="topnav">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={17} />
                <span>{label}</span>

                {label === 'Feed' && unread > 0 && (
                  <span className="notification-count">{unread}</span>
                )}
              </NavLink>
            ))}
          </nav>

          {user && (
            <div className="topbar-user">
              <NavLink
                to={`/profile/${user.username}`}
                className="user-link"
              >
                <div className="user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" />
                  ) : (
                    user.displayName?.[0]?.toUpperCase() ||
                    user.username?.[0]?.toUpperCase()
                  )}
                </div>

                <span>{user.displayName || user.username}</span>
              </NavLink>

              <button
                type="button"
                className="logout-button"
                onClick={handleLogout}
                title="Sign out"
              >
                <MdLogout size={18} />
              </button>
            </div>
          )}

          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setMobileOpen((value) => !value)}
          >
            {mobileOpen ? <MdClose size={21} /> : <MdMenu size={21} />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="mobile-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `mobile-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}

          {user && (
            <button
              type="button"
              className="mobile-logout"
              onClick={handleLogout}
            >
              <MdLogout size={18} />
              Sign out
            </button>
          )}
        </div>
      )}
    </>
  );
}