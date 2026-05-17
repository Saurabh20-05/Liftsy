import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { workoutsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { MdPlayArrow, MdBookmark, MdBookmarkBorder, MdArrowBack, MdStar, MdFitnessCenter, MdTimer } from 'react-icons/md';
import toast from 'react-hot-toast';

export default function WorkoutDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    workoutsAPI.get(id).then(r => {
      setWorkout(r.data);
      setSaved(r.data.savedBy?.includes(user?._id));
    }).finally(() => setLoading(false));
  }, [id, user]);

  const handleSave = async () => {
    try {
      const res = await workoutsAPI.save(id);
      setSaved(res.data.saved);
      toast.success(res.data.saved ? 'Workout saved!' : 'Removed from saved');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="page-container">{[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80, marginBottom: 16 }} />)}</div>;
  if (!workout) return <div className="page-container"><p>Workout not found</p></div>;

  const CATEGORY_COLORS = { strength: 'var(--blue)', cardio: 'var(--red)', hiit: 'var(--orange)', powerlifting: 'var(--purple)', bodybuilding: 'var(--accent)' };
  const color = CATEGORY_COLORS[workout.category] || 'var(--accent)';

  return (
    <div className="page-container animate-fade" style={{ maxWidth: 750 }}>
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
        <MdArrowBack size={16} /> Back
      </button>


      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color, background: `${color}18`, padding: '3px 10px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {workout.category}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-3)', background: 'var(--bg-3)', padding: '3px 10px', borderRadius: 100, textTransform: 'capitalize' }}>
            {workout.difficulty}
          </span>
          {workout.aiGenerated && <span style={{ fontSize: 12, color: 'var(--purple)', background: 'rgba(165,94,234,0.15)', padding: '3px 10px', borderRadius: 100 }}>🤖 AI Generated</span>}
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 44, letterSpacing: 2, lineHeight: 1.1, marginBottom: 12 }}>
          {workout.name}
        </h1>
        {workout.creator && (
          <Link to={`/profile/${workout.creator.username}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-2)', fontSize: 14 }}>
            <div className="avatar avatar-sm" style={{ background: 'var(--accent-dim)', color: 'var(--accent)', fontSize: 12 }}>
              {workout.creator.displayName?.[0]?.toUpperCase()}
            </div>
            {workout.creator.displayName}
          </Link>
        )}
        {workout.description && (
          <p style={{ color: 'var(--text-2)', marginTop: 12, lineHeight: 1.7, fontSize: 15 }}>{workout.description}</p>
        )}
      </div>


      <div style={{ display: 'flex', gap: 24, marginBottom: 28, padding: '16px 20px', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
        {[
          { icon: MdFitnessCenter, label: 'Exercises', value: workout.exercises?.length || 0 },
          { icon: MdTimer, label: 'Est. Duration', value: workout.estimatedDuration ? `${workout.estimatedDuration}min` : 'N/A' },
          { icon: MdStar, label: 'Rating', value: workout.rating ? workout.rating.toFixed(1) : 'N/A' },
          { icon: MdPlayArrow, label: 'Times Used', value: workout.timesUsed || 0 },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon size={18} color="var(--accent)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>


      <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
        <button className="btn btn-primary btn-lg" style={{ flex: 1 }}
          onClick={() => navigate('/session/active', { state: { workout } })}>
          <MdPlayArrow size={22} /> Start Workout
        </button>
        <button className="btn btn-secondary" onClick={handleSave} style={{ minWidth: 120 }}>
          {saved ? <MdBookmark size={20} color="var(--accent)" /> : <MdBookmarkBorder size={20} />}
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>


      {workout.muscleGroups?.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-condensed)', fontSize: 14, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
            Target Muscles
          </h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {workout.muscleGroups.map(m => (
              <span key={m} style={{ padding: '4px 12px', background: 'var(--accent-dim)', color: 'var(--accent)', borderRadius: 100, fontSize: 13, fontWeight: 600 }}>{m}</span>
            ))}
          </div>
        </div>
      )}


      <h3 style={{ fontFamily: 'var(--font-condensed)', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Exercise Plan</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {workout.exercises?.map((entry, i) => (
          <div key={i} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, background: 'var(--accent-dim)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--accent)', flexShrink: 0 }}>
                {i + 1}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{entry.exerciseName || entry.exercise?.name}</div>
                {entry.notes && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{entry.notes}</div>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {entry.sets?.map((set, si) => (
                <div key={si} style={{ background: 'var(--bg-3)', borderRadius: 8, padding: '6px 12px', fontSize: 13, color: 'var(--text-2)' }}>
                  Set {si + 1}: {set.reps && `${set.reps} reps`}{set.weight ? ` @ ${set.weight}kg` : ''}{set.restTime ? ` | ${set.restTime}s rest` : ''}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>


      {workout.aiGenerated && workout.exercises && (
        <div style={{ marginTop: 24, padding: 20, background: 'rgba(165,94,234,0.08)', border: '1px solid rgba(165,94,234,0.2)', borderRadius: 'var(--radius-lg)' }}>
          <h4 style={{ fontFamily: 'var(--font-condensed)', fontSize: 15, fontWeight: 700, color: 'var(--purple)', marginBottom: 8 }}>
            🤖 AI Workout Notes
          </h4>
          <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>
            This workout was generated by AI based on your goals. Adjust weights and reps to match your current fitness level. Focus on proper form over heavy weight.
          </p>
        </div>
      )}
    </div>
  );
}
