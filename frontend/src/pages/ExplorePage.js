import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { workoutsAPI, usersAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { MdSearch, MdPlayArrow, MdPersonAdd, MdPerson } from 'react-icons/md';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'strength', 'cardio', 'hiit', 'powerlifting', 'bodybuilding', 'calisthenics', 'yoga'];
const DIFFICULTIES = ['All', 'beginner', 'intermediate', 'advanced'];

function WorkoutCard({ workout }) {
  const navigate = useNavigate();
  const COLORS = { strength: 'var(--blue)', cardio: 'var(--red)', hiit: 'var(--orange)', powerlifting: 'var(--purple)', bodybuilding: 'var(--accent)' };
  const color = COLORS[workout.category] || 'var(--text-2)';

  return (
    <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px', flex: 1 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color, background: `${color}18`, padding: '2px 8px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {workout.category}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-3)', background: 'var(--bg-3)', padding: '2px 8px', borderRadius: 100, textTransform: 'capitalize' }}>
            {workout.difficulty}
          </span>
        </div>
        <h3 style={{ fontFamily: 'var(--font-condensed)', fontSize: 17, fontWeight: 700, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {workout.name}
        </h3>
        {workout.description && (
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 10, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {workout.description}
          </p>
        )}
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10 }}>
          {workout.exercises?.length || 0} exercises · {workout.timesUsed || 0} uses
          {workout.rating > 0 && ` · ⭐ ${workout.rating.toFixed(1)}`}
        </div>
        {workout.creator && (
          <Link to={`/profile/${workout.creator.username}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-3)', fontSize: 12 }}
            onClick={e => e.stopPropagation()}>
            <div className="avatar" style={{ width: 20, height: 20, fontSize: 10, background: 'var(--accent-dim)', color: 'var(--accent)' }}>
              {workout.creator.displayName?.[0]?.toUpperCase()}
            </div>
            {workout.creator.displayName}
          </Link>
        )}
      </div>
      <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
        <button className="btn btn-primary btn-sm" style={{ flex: 1 }}
          onClick={() => navigate('/session/active', { state: { workout } })}>
          <MdPlayArrow size={16} /> Start
        </button>
        <Link to={`/workouts/${workout._id}`} className="btn btn-secondary btn-sm">Details</Link>
      </div>
    </div>
  );
}

function UserCard({ user: u, currentUser }) {
  const [following, setFollowing] = useState(currentUser?.following?.some(f => f === u._id || f?._id === u._id));
  const [loading, setLoading] = useState(false);

  const handleFollow = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await usersAPI.follow(u._id);
      setFollowing(f => !f);
      toast.success(following ? 'Unfollowed' : `Following ${u.displayName}!`);
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  return (
    <Link to={`/profile/${u.username}`}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', textDecoration: 'none', transition: 'all 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-active)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
      <div className="avatar avatar-md" style={{ background: 'var(--accent-dim)', color: 'var(--accent)', fontSize: 18, flexShrink: 0 }}>
        {u.avatar ? <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : u.displayName?.[0]?.toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.displayName}</div>
        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>@{u.username} · {u.fitnessLevel}</div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
          {u.followers?.length || 0} followers · {u.stats?.totalWorkouts || 0} workouts
        </div>
      </div>
      {currentUser && currentUser._id !== u._id && (
        <button onClick={handleFollow} disabled={loading}
          className={`btn btn-sm ${following ? 'btn-secondary' : 'btn-primary'}`}
          style={{ flexShrink: 0, minWidth: 88 }}>
          {loading ? <span className="spinner" /> : following ? <><MdPerson size={14} /> Following</> : <><MdPersonAdd size={14} /> Follow</>}
        </button>
      )}
    </Link>
  );
}

export default function ExplorePage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('workouts');
  const [workouts, setWorkouts] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [sort, setSort] = useState('popular');
  const [loading, setLoading] = useState(false);

  const loadWorkouts = async () => {
    setLoading(true);
    try {
      const params = { sort, limit: 24 };
      if (category !== 'All') params.category = category;
      if (difficulty !== 'All') params.difficulty = difficulty;
      if (search) params.search = search;
      const res = await workoutsAPI.explore(params);
      setWorkouts(res.data.workouts || []);
    } finally { setLoading(false); }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await usersAPI.search(search || '');
      setUsers(res.data);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (tab === 'workouts') loadWorkouts();
    else loadUsers();
  }, [tab, category, difficulty, sort, loadUsers, loadWorkouts]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (tab === 'workouts') loadWorkouts();
    else loadUsers();
  };

  return (
    <div className="page-container animate-fade">
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 44, letterSpacing: 2, marginBottom: 24 }}>EXPLORE</h1>

      <div className="tab-bar" style={{ width: 'fit-content', marginBottom: 24 }}>
        <button className={`tab-btn ${tab === 'workouts' ? 'active' : ''}`} onClick={() => setTab('workouts')}>Workouts</button>
        <button className={`tab-btn ${tab === 'athletes' ? 'active' : ''}`} onClick={() => setTab('athletes')}>Athletes</button>
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <MdSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} size={18} />
          <input className="form-input" style={{ paddingLeft: 40, width: '100%' }}
            placeholder={tab === 'workouts' ? 'Search workouts...' : 'Search athletes...'}
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {tab === 'workouts' && (
          <>
            <select className="form-select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="rating">Top Rated</option>
            </select>
            <select className="form-select" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d === 'All' ? 'All Levels' : d}</option>)}
            </select>
          </>
        )}
        <button type="submit" className="btn btn-primary"><MdSearch size={16} /> Search</button>
      </form>

      {tab === 'workouts' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              style={{ padding: '6px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0, fontFamily: 'var(--font-condensed)', letterSpacing: '0.04em', textTransform: 'capitalize',
                background: category === c ? 'var(--accent)' : 'var(--bg-2)',
                color: category === c ? 'var(--bg-0)' : 'var(--text-2)',
                border: `1px solid ${category === c ? 'var(--accent)' : 'var(--border)'}` }}>
              {c}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid-3">{[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 180 }} />)}</div>
      ) : tab === 'workouts' ? (
        workouts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-3)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <p>No workouts found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid-3">{workouts.map(w => <WorkoutCard key={w._id} workout={w} />)}</div>
        )
      ) : (
        users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-3)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
            <p>No athletes found.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {users.map(u => <UserCard key={u._id} user={u} currentUser={user} />)}
          </div>
        )
      )}
    </div>
  );
}
