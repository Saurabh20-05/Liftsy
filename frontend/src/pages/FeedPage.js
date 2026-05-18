import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { socialAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { MdFavorite, MdFavoriteBorder, MdComment, MdSend } from 'react-icons/md';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const REACTIONS = [
  { type: 'fire', emoji: '🔥' }, { type: 'strong', emoji: '💪' },
  { type: 'heart', emoji: '❤️' }, { type: 'wow', emoji: '😮' },
  { type: 'clap', emoji: '👏' }, { type: 'beast', emoji: '🦁' },
];

function PostCard({ post: initialPost, currentUser }) {
  const [post, setPost] = useState(initialPost);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [showReactions, setShowReactions] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const liked = post.likes?.some(id => String(id) === String(currentUser?._id));

  const handleLike = async () => {
    try {
      const res = await socialAPI.likePost(post._id);
      setPost(p => ({
        ...p,
        likes: res.data.liked
          ? [...(p.likes || []), currentUser._id]
          : (p.likes || []).filter(id => String(id) !== String(currentUser._id))
      }));
    } catch { toast.error('Failed'); }
  };

  const handleReact = async (type) => {
    try {
      const res = await socialAPI.reactPost(post._id, type);
      setPost(p => ({ ...p, reactions: res.data.reactions }));
      setShowReactions(false);
    } catch { toast.error('Failed'); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await socialAPI.commentPost(post._id, comment);
      setPost(p => ({ ...p, comments: [...(p.comments || []), res.data] }));
      setComment('');
    } catch { toast.error('Failed'); }
    finally { setSubmitting(false); }
  };

  const reactionCounts = {};
  (post.reactions || []).forEach(r => { reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1; });

  return (
    <div className="card" style={{ marginBottom: 16 }}>

      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link to={`/profile/${post.author?.username}`}>
          <div className="avatar avatar-md" style={{ background: 'var(--accent-dim)', color: 'var(--accent)', fontSize: 18 }}>
            {post.author?.avatar
              ? <img src={post.author.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              : post.author?.displayName?.[0]?.toUpperCase()}
          </div>
        </Link>
        <div style={{ flex: 1 }}>
          <Link to={`/profile/${post.author?.username}`} style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)' }}>
            {post.author?.displayName}
          </Link>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
            @{post.author?.username} · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </div>
        </div>
        {post.type === 'workout_log' && <span className="badge badge-accent">Workout</span>}
        {post.type === 'pr' && <span className="badge badge-green">PR 🏆</span>}
      </div>

      {post.content && (
        <div style={{ padding: '0 16px 12px', fontSize: 15, color: 'var(--text-1)', lineHeight: 1.6 }}>
          {post.content}
        </div>
      )}

      {post.sessionSummary && (
        <div style={{ margin: '0 16px 12px', background: 'var(--bg-3)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontFamily: 'var(--font-condensed)', fontSize: 17, fontWeight: 700, marginBottom: 10 }}>
            🏋️ {post.sessionSummary.workoutName}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 10 }}>
            {[
              { label: 'Duration', value: post.sessionSummary.duration ? `${Math.floor(post.sessionSummary.duration / 60)}m` : '-' },
              { label: 'Volume', value: post.sessionSummary.totalVolume ? `${post.sessionSummary.totalVolume}kg` : '-' },
              { label: 'Sets', value: post.sessionSummary.totalSets || '-' },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'var(--bg-2)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--accent)' }}>{value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase' }}>{label}</div>
              </div>
            ))}
          </div>
          {post.sessionSummary.exercises?.slice(0, 4).map((ex, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-2)' }}>{ex.name}</span>
              <span style={{ color: 'var(--text-3)' }}>{ex.sets} sets</span>
            </div>
          ))}
          {post.sessionSummary.prs?.length > 0 && (
            <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {post.sessionSummary.prs.map((pr, i) => (
                <span key={i} className="badge badge-green">🏆 {pr.exercise}: {pr.value}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {Object.keys(reactionCounts).length > 0 && (
        <div style={{ padding: '0 16px 10px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {Object.entries(reactionCounts).map(([type, count]) => {
            const r = REACTIONS.find(r => r.type === type);
            return r ? (
              <button key={type} onClick={() => handleReact(type)}
                style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 100, cursor: 'pointer', fontSize: 13 }}>
                {r.emoji} <span style={{ color: 'var(--text-3)' }}>{count}</span>
              </button>
            ) : null;
          })}
        </div>
      )}

      <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 4, alignItems: 'center' }}>
        <button onClick={handleLike}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: liked ? 'var(--red-dim)' : 'none', color: liked ? 'var(--red)' : 'var(--text-3)', fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.15s' }}>
          {liked ? <MdFavorite size={18} /> : <MdFavoriteBorder size={18} />} {post.likes?.length || 0}
        </button>
        <button onClick={() => setShowComments(!showComments)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'none', color: 'var(--text-3)', fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}>
          <MdComment size={18} /> {post.comments?.length || 0}
        </button>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowReactions(!showReactions)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'none', color: 'var(--text-3)', fontSize: 14, cursor: 'pointer', border: 'none' }}>
            🔥
          </button>
          {showReactions && (
            <div style={{ position: 'absolute', bottom: '100%', left: 0, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12, padding: 8, display: 'flex', gap: 4, zIndex: 10, boxShadow: 'var(--shadow-lg)' }}>
              {REACTIONS.map(r => (
                <button key={r.type} onClick={() => handleReact(r.type)}
                  style={{ fontSize: 22, padding: '4px 6px', borderRadius: 8, cursor: 'pointer', background: 'none', border: 'none', transition: 'transform 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.3)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showComments && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px' }}>
          {post.comments?.slice(-5).map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <div className="avatar avatar-sm" style={{ background: 'var(--accent-dim)', color: 'var(--accent)', fontSize: 12, flexShrink: 0 }}>
                {c.author?.displayName?.[0]?.toUpperCase() || '?'}
              </div>
              <div style={{ background: 'var(--bg-3)', borderRadius: 10, padding: '8px 12px', flex: 1 }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{c.author?.displayName} </span>
                <span style={{ fontSize: 14, color: 'var(--text-2)' }}>{c.content}</span>
              </div>
            </div>
          ))}
          <form onSubmit={handleComment} style={{ display: 'flex', gap: 8 }}>
            <input className="form-input" style={{ flex: 1 }} placeholder="Add a comment..."
              value={comment} onChange={e => setComment(e.target.value)} />
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting || !comment.trim()}>
              <MdSend size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState('feed');

  const load = useCallback(async (p = 1, tab = activeTab) => {
    setLoading(true);
    try {
      let res;
      if (tab === 'feed') {
        res = await socialAPI.feed({ page: p, limit: 15 });
      } else {
        res = await socialAPI.explore({ page: p, limit: 15 });
      }
      const data = Array.isArray(res.data) ? res.data : [];
      setPosts(prev => p === 1 ? data : [...prev, ...data]);
      setHasMore(data.length === 15);
    } catch (err) {
      toast.error('Failed to load feed');
    } finally {
      setLoading(false);
    }
  }, [activeTab, load]);

  useEffect(() => {
  setPosts([]);
  setPage(1);

  const fetchData = async () => {
    await load(1, activeTab);
  };

  fetchData();
}, [activeTab]);

  return (
    <div className="page-container animate-fade" style={{ maxWidth: 680 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 38, letterSpacing: 2 }}>FEED</h1>
        <div className="tab-bar" style={{ width: 'auto' }}>
          <button className={`tab-btn ${activeTab === 'feed' ? 'active' : ''}`} onClick={() => setActiveTab('feed')}>Following</button>
          <button className={`tab-btn ${activeTab === 'explore' ? 'active' : ''}`} onClick={() => setActiveTab('explore')}>Explore</button>
        </div>
      </div>

      {activeTab === 'feed' && posts.length === 0 && !loading && (
        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-condensed)', fontSize: 18, fontWeight: 700, marginBottom: 10 }}>📖 How the Feed works</h3>
          <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.7, marginBottom: 8 }}>
            Your feed shows workout posts from athletes you <strong>follow</strong>.
          </p>
          <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            To see posts here: <br />
            1. Go to <strong>Explore → Athletes</strong> and follow some athletes<br />
            2. Complete a workout and click <strong>Share to Feed</strong> from the session page<br />
            3. Posts from followed athletes appear here automatically
          </p>
          <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('explore')}>
            Find Athletes to Follow →
          </button>
        </div>
      )}

      {loading && page === 1 ? (
        [...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 200, marginBottom: 16, borderRadius: 12 }} />)
      ) : posts.length === 0 && !loading ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏋️</div>
          <h3 style={{ fontFamily: 'var(--font-condensed)', fontSize: 20, marginBottom: 8 }}>No posts yet</h3>
          <p style={{ color: 'var(--text-3)' }}>
            {activeTab === 'feed' ? 'Follow athletes to see their workouts here!' : 'No public posts yet. Be the first!'}
          </p>
        </div>
      ) : (
        <>
          {posts.map(post => <PostCard key={post._id} post={post} currentUser={user} />)}
          {hasMore && (
            <button className="btn btn-secondary btn-full" onClick={() => { const np = page + 1; setPage(np); load(np); }} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Load More'}
            </button>
          )}
        </>
      )}
    </div>
  );
}
