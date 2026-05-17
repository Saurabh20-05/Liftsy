import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sessionsAPI } from '../utils/api';
import { MdFitnessCenter, MdTimer, MdTrendingUp, MdCalendarToday, MdSentimentSatisfied } from 'react-icons/md';
import { format, formatDistanceToNow } from 'date-fns';

const MOOD_EMOJI = { terrible: '😫', bad: '😕', ok: '😐', good: '🙂', great: '😄', amazing: '🤩' };

export default function SessionHistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await sessionsAPI.history({ page: p, limit: 20 });
      setSessions(prev => p === 1 ? res.data.sessions : [...prev, ...res.data.sessions]);
      setTotal(res.data.total);
      setHasMore(p * 20 < res.data.total);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(1); }, []);

  const formatDur = (s) => {
    if (!s) return '--';
    const m = Math.floor(s / 60);
    return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
  };


  const grouped = sessions.reduce((acc, s) => {
    const key = format(new Date(s.startTime), 'MMMM yyyy');
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  return (
    <div className="page-container animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 44, letterSpacing: 2 }}>HISTORY</h1>
          <p style={{ color: 'var(--text-3)', fontSize: 14 }}>{total} sessions logged</p>
        </div>
        <Link to="/session/active" className="btn btn-primary">
          <MdFitnessCenter size={18} /> New Session
        </Link>
      </div>

      {loading && sessions.length === 0 ? (
        [...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80, marginBottom: 12 }} />)
      ) : sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📋</div>
          <h3 style={{ fontFamily: 'var(--font-condensed)', fontSize: 22, marginBottom: 8 }}>No sessions yet</h3>
          <p style={{ color: 'var(--text-3)', marginBottom: 24 }}>Complete your first workout to see it here.</p>
          <Link to="/session/active" className="btn btn-primary"><MdFitnessCenter size={16} /> Start Workout</Link>
        </div>
      ) : (
        Object.entries(grouped).map(([month, monthSessions]) => (
          <div key={month} style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <MdCalendarToday size={16} color="var(--text-3)" />
              <h2 style={{ fontFamily: 'var(--font-condensed)', fontSize: 16, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {month}
              </h2>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{monthSessions.length} sessions</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {monthSessions.map(s => (
                <Link key={s._id} to={`/sessions/${s._id}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', textDecoration: 'none', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-active)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; }}>


                  <div style={{ textAlign: 'center', width: 44, flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--accent)', lineHeight: 1 }}>
                      {format(new Date(s.startTime), 'd')}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase' }}>
                      {format(new Date(s.startTime), 'EEE')}
                    </div>
                  </div>

                  <div style={{ width: 1, height: 40, background: 'var(--border)', flexShrink: 0 }} />


                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.workoutName}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                      {formatDistanceToNow(new Date(s.startTime), { addSuffix: true })}
                    </div>
                  </div>


                  <div style={{ display: 'flex', gap: 20, flexShrink: 0 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-2)', fontSize: 13, fontWeight: 600 }}>
                        <MdTimer size={14} color="var(--blue)" /> {formatDur(s.duration)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-2)', fontSize: 13, fontWeight: 600 }}>
                        <MdTrendingUp size={14} color="var(--accent)" /> {s.stats?.totalVolume ? `${s.stats.totalVolume}kg` : `${s.stats?.totalSets || 0} sets`}
                      </div>
                    </div>
                    {s.mood && (
                      <div style={{ fontSize: 18 }} title={s.mood}>{MOOD_EMOJI[s.mood]}</div>
                    )}
                    {s.stats?.personalRecords?.length > 0 && (
                      <span style={{ fontSize: 12, color: 'var(--green)', background: 'var(--green-dim)', padding: '2px 8px', borderRadius: 100, fontWeight: 700 }}>
                        🏆 {s.stats.personalRecords.length} PR{s.stats.personalRecords.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))
      )}

      {hasMore && (
        <button className="btn btn-secondary btn-full" onClick={() => { const np = page + 1; setPage(np); load(np); }} disabled={loading}>
          {loading ? <span className="spinner" /> : 'Load More'}
        </button>
      )}
    </div>
  );
}
