import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { MdEmojiEvents, MdTrendingUp, MdLocalFireDepartment, MdFitnessCenter } from 'react-icons/md';

const RANK_STYLES = [
  { bg: 'linear-gradient(135deg,#FFD700,#FFA500)', color: '#5a3e00', label: '🥇' },
  { bg: 'linear-gradient(135deg,#C0C0C0,#808080)', color: '#fff', label: '🥈' },
  { bg: 'linear-gradient(135deg,#CD7F32,#8B4513)', color: '#fff', label: '🥉' },
];

const LEVEL_COLORS = {
  beginner: 'var(--green)',
  intermediate: 'var(--blue)',
  advanced: 'var(--orange)',
  elite: 'var(--red)',
};

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersAPI.leaderboard()
      .then(r => setLeaders(r.data || []))
      .catch(() => setLeaders([]))
      .finally(() => setLoading(false));
  }, []);

  const myRank = leaders.findIndex(u => u._id === user?._id) + 1;
  const getLevelColor = (level) => LEVEL_COLORS[level] || 'var(--text-2)';

  return (
    <div className="page-container animate-fade">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 44, letterSpacing: 2 }}>LEADERBOARD</h1>
        <p style={{ color: 'var(--text-3)', fontSize: 14, marginTop: 4 }}>Top athletes ranked by total training volume</p>
      </div>

      {myRank > 0 && (
        <div style={{ background: 'var(--accent-dim)', border: '1px solid rgba(232,255,60,0.3)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14 }}>
          <MdEmojiEvents size={28} color="var(--accent)" />
          <div>
            <div style={{ fontFamily: 'var(--font-condensed)', fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>Your Rank: #{myRank}</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Keep training to climb the leaderboard!</div>
          </div>
        </div>
      )}

      {!loading && leaders.length >= 3 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 32, alignItems: 'flex-end' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <Link to={`/profile/${leaders[1].username}`} style={{ textDecoration: 'none' }}>
              <div className="avatar" style={{ width: 56, height: 56, fontSize: 22, background: 'var(--bg-3)', color: 'var(--text-1)', margin: '0 auto 8px', border: '2px solid #C0C0C0' }}>
                {leaders[1].displayName?.[0]?.toUpperCase()}
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)', marginBottom: 4 }}>{leaders[1].displayName}</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 8 }}>{Math.round((leaders[1].stats?.totalVolume || 0) / 1000)}t</div>
              <div style={{ background: RANK_STYLES[1].bg, borderRadius: '12px 12px 0 0', padding: '20px 8px 8px', color: RANK_STYLES[1].color, fontFamily: 'var(--font-display)', fontSize: 28 }}>{RANK_STYLES[1].label}</div>
            </Link>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <Link to={`/profile/${leaders[0].username}`} style={{ textDecoration: 'none' }}>
              <div className="avatar" style={{ width: 72, height: 72, fontSize: 28, background: 'var(--bg-3)', color: 'var(--text-1)', margin: '0 auto 8px', border: '3px solid #FFD700', boxShadow: '0 0 20px rgba(255,215,0,0.3)' }}>
                {leaders[0].displayName?.[0]?.toUpperCase()}
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-1)', marginBottom: 4 }}>{leaders[0].displayName}</div>
              <div style={{ fontSize: 14, color: 'var(--accent)', marginBottom: 8, fontWeight: 700 }}>{Math.round((leaders[0].stats?.totalVolume || 0) / 1000)}t</div>
              <div style={{ background: RANK_STYLES[0].bg, borderRadius: '12px 12px 0 0', padding: '24px 8px 8px', color: RANK_STYLES[0].color, fontFamily: 'var(--font-display)', fontSize: 32 }}>{RANK_STYLES[0].label}</div>
            </Link>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <Link to={`/profile/${leaders[2].username}`} style={{ textDecoration: 'none' }}>
              <div className="avatar" style={{ width: 50, height: 50, fontSize: 20, background: 'var(--bg-3)', color: 'var(--text-1)', margin: '0 auto 8px', border: '2px solid #CD7F32' }}>
                {leaders[2].displayName?.[0]?.toUpperCase()}
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)', marginBottom: 4 }}>{leaders[2].displayName}</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 8 }}>{Math.round((leaders[2].stats?.totalVolume || 0) / 1000)}t</div>
              <div style={{ background: RANK_STYLES[2].bg, borderRadius: '12px 12px 0 0', padding: '16px 8px 8px', color: RANK_STYLES[2].color, fontFamily: 'var(--font-display)', fontSize: 24 }}>{RANK_STYLES[2].label}</div>
            </Link>
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'var(--font-condensed)', fontSize: 16, fontWeight: 700 }}>Full Rankings</h3>
        </div>
        {loading ? (
          [...Array(10)].map((_, i) => (
            <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center' }}>
              <div className="skeleton" style={{ width: 32, height: 20 }} />
              <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 12, width: '40%' }} />
              </div>
            </div>
          ))
        ) : leaders.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-3)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
            <p>No athletes yet. Complete workouts to appear here!</p>
          </div>
        ) : leaders.map((leader, i) => {
          const isMe = leader._id === user?._id;
          const levelColor = getLevelColor(leader.fitnessLevel);
          return (
            <Link key={leader._id} to={`/profile/${leader.username}`}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid var(--border)', textDecoration: 'none', background: isMe ? 'var(--accent-dim)' : 'transparent', transition: 'background 0.15s' }}
              onMouseEnter={e => { if (!isMe) e.currentTarget.style.background = 'var(--bg-2)'; }}
              onMouseLeave={e => { if (!isMe) e.currentTarget.style.background = 'transparent'; }}>
              <div style={{ width: 32, textAlign: 'center', flexShrink: 0 }}>
                {i < 3 ? <span style={{ fontSize: 20 }}>{RANK_STYLES[i].label}</span>
                  : <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: i < 10 ? 'var(--accent)' : 'var(--text-3)' }}>#{i + 1}</span>}
              </div>
              <div className="avatar avatar-md" style={{ background: 'var(--bg-3)', flexShrink: 0 }}>
                {leader.displayName?.[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: isMe ? 'var(--accent)' : 'var(--text-1)' }}>
                    {leader.displayName} {isMe && '(You)'}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.06em', background: levelColor + '22', color: levelColor }}>
                    {leader.fitnessLevel}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>@{leader.username} · {leader.followers?.length || 0} followers</div>
              </div>
              <div style={{ display: 'flex', gap: 20, flexShrink: 0 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: 15 }}>
                    <MdTrendingUp size={14} color="var(--accent)" />
                    {Math.round((leader.stats?.totalVolume || 0) / 1000)}t
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>volume</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: 15 }}>
                    <MdFitnessCenter size={14} color="var(--blue)" />
                    {leader.stats?.totalWorkouts || 0}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>workouts</div>
                </div>
                {(leader.stats?.currentStreak || 0) > 0 && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: 15 }}>
                      <MdLocalFireDepartment size={14} color="var(--orange)" />
                      {leader.stats.currentStreak}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>streak</div>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
