import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionsAPI, aiAPI } from '../utils/api';
import { MdShare, MdPsychology, MdFitnessCenter, MdTimer, MdTrendingUp, MdLocalFireDepartment, MdArrowBack } from 'react-icons/md';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function SessionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const [shareContent, setShareContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sessionsAPI.get(id).then((r) => {
      setSession(r.data);
      if (r.data.aiAnalysis) setAnalysis(r.data.aiAnalysis);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await aiAPI.analyzeSession(id);
      setAnalysis(res.data);
      toast.success('AI analysis complete!');
    } catch { toast.error('AI analysis failed — check API key'); }
    finally { setAnalyzing(false); }
  };

  const handleShare = async () => {
    setSharing(true);
    try {
      await sessionsAPI.share(id, { content: shareContent, visibility: 'public' });
      toast.success('Shared to feed! 🎉');
      setShareModal(false);
    } catch { toast.error('Failed to share'); }
    finally { setSharing(false); }
  };

  const formatDuration = (s) => {
    if (!s) return '0m';
    const m = Math.floor(s / 60);
    return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
  };

  if (loading) return (
    <div className="page-container">{[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80, marginBottom: 16 }} />)}</div>
  );
  if (!session) return <div className="page-container"><p>Session not found</p></div>;

  return (
    <div className="page-container animate-fade" style={{ maxWidth: 700 }}>
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
        <MdArrowBack size={16} /> Back
      </button>


      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 38, letterSpacing: 2, lineHeight: 1 }}>
              {session.workoutName}
            </h1>
            <p style={{ color: 'var(--text-3)', marginTop: 6, fontSize: 14 }}>
              {format(new Date(session.startTime), 'EEEE, MMMM d yyyy · h:mm a')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {!session.sharedAsPost && (
              <button className="btn btn-secondary btn-sm" onClick={() => setShareModal(true)}>
                <MdShare size={16} /> Share
              </button>
            )}
            <button className="btn btn-secondary btn-sm" onClick={handleAnalyze} disabled={analyzing}>
              {analyzing ? <span className="spinner" /> : <MdPsychology size={16} />}
              {analyzing ? 'Analyzing...' : 'AI Analysis'}
            </button>
          </div>
        </div>
      </div>


      <div className="grid-4" style={{ marginBottom: 28 }}>
        {[
          { label: 'Duration', value: formatDuration(session.duration), icon: MdTimer, color: 'var(--blue)' },
          { label: 'Volume', value: `${session.stats?.totalVolume || 0}kg`, icon: MdTrendingUp, color: 'var(--accent)' },
          { label: 'Sets', value: session.stats?.totalSets || 0, icon: MdFitnessCenter, color: 'var(--purple)' },
          { label: 'Exercises', value: session.exercises?.length || 0, icon: MdLocalFireDepartment, color: 'var(--orange)' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, color }}>{value}</span>
              <Icon size={18} color={color} style={{ opacity: 0.6 }} />
            </div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>


      {(session.mood || session.energyLevel) && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          {session.mood && <span className="badge badge-blue">Mood: {session.mood}</span>}
          {session.energyLevel && <span className="badge badge-accent">Energy: {session.energyLevel}/10</span>}
        </div>
      )}


      {session.stats?.personalRecords?.length > 0 && (
        <div className="card" style={{ marginBottom: 20, padding: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-condensed)', fontSize: 16, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            🏆 Personal Records
          </h3>
          {session.stats.personalRecords.map((pr, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 600 }}>{pr.exerciseName}</span>
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{pr.value}</span>
            </div>
          ))}
        </div>
      )}


      {analysis && (
        <div className="card" style={{ marginBottom: 20, padding: 24, borderColor: 'rgba(165,94,234,0.3)' }}>
          <h3 style={{ fontFamily: 'var(--font-condensed)', fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--purple)' }}>
            <MdPsychology size={20} /> AI Coach Analysis
          </h3>
          <p style={{ color: 'var(--text-2)', marginBottom: 16, lineHeight: 1.6 }}>{analysis.summary}</p>
          {analysis.strengths?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--green)', marginBottom: 6 }}>✅ Strengths</div>
              {analysis.strengths.map((s, i) => <div key={i} style={{ fontSize: 14, color: 'var(--text-2)', padding: '2px 0' }}>• {s}</div>)}
            </div>
          )}
          {analysis.improvements?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--orange)', marginBottom: 6 }}>📈 Improvements</div>
              {analysis.improvements.map((s, i) => <div key={i} style={{ fontSize: 14, color: 'var(--text-2)', padding: '2px 0' }}>• {s}</div>)}
            </div>
          )}
          {analysis.nextWorkoutSuggestion && (
            <div style={{ background: 'var(--bg-3)', borderRadius: 10, padding: '12px 14px', marginTop: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>💡 Next Session</div>
              <div style={{ fontSize: 14, color: 'var(--text-2)' }}>{analysis.nextWorkoutSuggestion}</div>
            </div>
          )}
        </div>
      )}


      <div className="card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'var(--font-condensed)', fontSize: 16, fontWeight: 700 }}>Exercise Log</h3>
        </div>
        {session.exercises?.map((ex, i) => (
          <div key={i} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
              <span>{ex.exerciseName}</span>
              <span style={{ color: 'var(--text-3)', fontSize: 13 }}>{ex.sets.filter((s) => s.completed).length} sets</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
              {ex.sets.filter((s) => s.completed).map((set, si) => (
                <div key={si} style={{ background: 'var(--bg-3)', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-3)' }}>Set {set.setNumber}: </span>
                  {set.weight ? <><b>{set.weight}kg</b> × {set.reps}</> : set.reps ? <b>{set.reps} reps</b> : set.duration ? <b>{set.duration}s</b> : '—'}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>


      {shareModal && (
        <div className="modal-overlay">
          <div className="modal animate-scale">
            <div className="modal-header">
              <h3 style={{ fontFamily: 'var(--font-condensed)', fontSize: 18, fontWeight: 700 }}>Share Workout</h3>
              <button onClick={() => setShareModal(false)} style={{ color: 'var(--text-2)', display: 'flex' }}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Add a caption</label>
                <textarea className="form-textarea" placeholder="Crushed this workout! 💪" rows={3}
                  value={shareContent} onChange={(e) => setShareContent(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShareModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleShare} disabled={sharing}>
                {sharing ? <span className="spinner" /> : '📤 Share to Feed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
