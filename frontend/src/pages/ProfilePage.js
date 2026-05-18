import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usersAPI, socialAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { MdFitnessCenter, MdTrendingUp, MdLocalFireDepartment, MdPersonAdd, MdPerson, MdEmojiEvents } from 'react-icons/md';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const LEVEL_COLORS = { beginner: 'var(--green)', intermediate: 'var(--blue)', advanced: 'var(--orange)', elite: 'var(--red)' };
const MOOD_EMOJI = { terrible: '😫', bad: '😕', ok: '😐', good: '🙂', great: '😄', amazing: '🤩' };

function PostMini({ post, currentUser }) {
  const [liked, setLiked] = useState(post.likes?.includes(currentUser?._id));
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);

  const handleLike = async (e) => {
    e.preventDefault();
    try {
      const { socialAPI } = await import('../utils/api');
      const res = await socialAPI.likePost(post._id);
      setLiked(res.data.liked);
      setLikeCount(res.data.likeCount);
    } catch {}
  };

  return (
    <div className="card" style={{ marginBottom: 14 }}>
      <div style={{ padding: '14px 16px' }}>
        {post.content && (
          <p style={{ fontSize: 15, lineHeight: 1.6, marginBottom: post.sessionSummary ? 12 : 0 }}>{post.content}</p>
        )}
        {post.sessionSummary && (
          <div style={{ background: 'var(--bg-3)', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontFamily: 'var(--font-condensed)', fontSize: 15, fontWeight: 700, marginBottom: 8 }}>
              🏋️ {post.sessionSummary.workoutName}
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13 }}>
              {post.sessionSummary.duration && <span style={{ color: 'var(--text-2)' }}>⏱ {Math.floor(post.sessionSummary.duration / 60)}m</span>}
              {post.sessionSummary.totalVolume > 0 && <span style={{ color: 'var(--text-2)' }}>🏋️ {post.sessionSummary.totalVolume}kg</span>}
              {post.sessionSummary.totalSets > 0 && <span style={{ color: 'var(--text-2)' }}>📊 {post.sessionSummary.totalSets} sets</span>}
              {post.sessionSummary.mood && <span>{MOOD_EMOJI[post.sessionSummary.mood]}</span>}
            </div>
          </div>
        )}
      </div>
      <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: 6, color: liked ? 'var(--red)' : 'var(--text-3)', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', transition: 'color 0.15s' }}>
          {liked ? '❤️' : '🤍'} {likeCount}
        </button>
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  const isOwn = currentUser?.username === username;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      usersAPI.profile(username),
      socialAPI.userPosts(username, { limit: 20 }),
    ]).then(([profileRes, postsRes]) => {
      setProfile(profileRes.data);
      setPosts(Array.isArray(postsRes.data) ? postsRes.data : []);
      setFollowing(profileRes.data.followers?.some(f => f._id === currentUser?._id || f === currentUser?._id));
    }).catch(() => toast.error('Profile not found'))
      .finally(() => setLoading(false));
  }, [username, currentUser]);

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      await usersAPI.follow(profile._id);
      setFollowing(f => !f);
      setProfile(p => ({
        ...p,
        followers: following
          ? p.followers.filter(f => f._id !== currentUser._id && f !== currentUser._id)
          : [...p.followers, { _id: currentUser._id, displayName: currentUser.displayName }]
      }));
      toast.success(following ? 'Unfollowed' : `Following ${profile.displayName}!`);
    } catch { toast.error('Failed'); }
    finally { setFollowLoading(false); }
  };

  if (loading) return (
    <div className="page-container">
      <div className="skeleton" style={{ height: 200, borderRadius: 16, marginBottom: 20 }} />
      <div className="skeleton" style={{ height: 100, borderRadius: 12, marginBottom: 16 }} />
    </div>
  );

  if (!profile) return (
    <div className="page-container" style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>😕</div>
      <h2>User not found</h2>
    </div>
  );

  const levelColor = LEVEL_COLORS[profile.fitnessLevel] || 'var(--text-2)';

  return (
    <div className="page-container animate-fade" style={{ maxWidth: 800 }}>

      <div className="card" style={{ marginBottom: 24, overflow: 'visible' }}>
        {/* Cover */}
        <div style={{ height: 120, background: 'linear-gradient(135deg, var(--bg-3), var(--bg-4))', borderRadius: '18px 18px 0 0', position: 'relative' }}>
          <div style={{ position: 'absolute', bottom: -40, left: 24 }}>
            <div className="avatar" style={{ width: 80, height: 80, fontSize: 32, background: 'var(--accent-dim)', color: 'var(--accent)', border: '4px solid var(--bg-1)' }}>
              {profile.avatar
                ? <img src={profile.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : profile.displayName?.[0]?.toUpperCase()}
            </div>
          </div>
        </div>

        <div style={{ padding: '48px 24px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-condensed)', fontSize: 26, fontWeight: 700 }}>{profile.displayName}</h1>
              <p style={{ color: 'var(--text-3)', fontSize: 14 }}>@{profile.username}</p>
              <span style={{ display: 'inline-block', marginTop: 6, padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', background: `${levelColor}18`, color: levelColor }}>
                {profile.fitnessLevel}
              </span>
            </div>
            {!isOwn && currentUser && (
              <button className={`btn btn-sm ${following ? 'btn-secondary' : 'btn-primary'}`} onClick={handleFollow} disabled={followLoading} style={{ minWidth: 110 }}>
                {followLoading ? <span className="spinner" /> : following ? <><MdPerson size={15} /> Following</> : <><MdPersonAdd size={15} /> Follow</>}
              </button>
            )}
          </div>

          {profile.bio && <p style={{ color: 'var(--text-2)', marginTop: 12, lineHeight: 1.6, fontSize: 15 }}>{profile.bio}</p>}

          {profile.goals?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
              {profile.goals.map(g => <span key={g} style={{ padding: '3px 10px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 100, fontSize: 12, color: 'var(--text-2)' }}>{g}</span>)}
            </div>
          )}


          <div style={{ display: 'flex', gap: 24, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            {[
              { label: 'Followers', value: profile.followers?.length || 0 },
              { label: 'Following', value: profile.following?.length || 0 },
              { label: 'Workouts', value: profile.stats?.totalWorkouts || 0 },
              { label: 'Streak', value: `${profile.stats?.currentStreak || 0}🔥` },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text-1)' }}>{value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>


      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Volume', value: profile.stats?.totalVolume ? `${Math.round((profile.stats.totalVolume || 0) / 1000)}t` : '0', icon: MdTrendingUp, color: 'var(--accent)' },
          { label: 'Sessions', value: profile.stats?.totalSessions || 0, icon: MdFitnessCenter, color: 'var(--blue)' },
          { label: 'Best Streak', value: `${profile.stats?.longestStreak || 0}d`, icon: MdLocalFireDepartment, color: 'var(--orange)' },
          { label: 'Badges', value: profile.badges?.length || 0, icon: MdEmojiEvents, color: 'var(--purple)' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, color }}>{value}</span>
              <Icon size={18} color={color} style={{ opacity: 0.5 }} />
            </div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>


      <div className="tab-bar" style={{ width: 'fit-content', marginBottom: 20 }}>
        <button className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>Posts</button>
        <button className={`tab-btn ${activeTab === 'badges' ? 'active' : ''}`} onClick={() => setActiveTab('badges')}>Badges</button>
      </div>

      {activeTab === 'posts' && (
        posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-3)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <p>{isOwn ? "You haven't shared any workouts yet." : `${profile.displayName} hasn't shared anything yet.`}</p>
          </div>
        ) : (
          posts.map(p => <PostMini key={p._id} post={p} currentUser={currentUser} />)
        )
      )}

      {activeTab === 'badges' && (
        profile.badges?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-3)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏅</div>
            <p>No badges earned yet. Keep training!</p>
          </div>
        ) : (
          <div className="grid-4">
            {(profile.badges || []).map((badge, i) => (
              <div key={i} className="card" style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{badge.icon || '🏅'}</div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{badge.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{badge.description}</div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
