import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { sessionsAPI, exercisesAPI } from '../utils/api';
import { MdAdd, MdCheck, MdClose, MdSearch, MdFitnessCenter, MdExpandMore, MdExpandLess, MdStop, MdPlayArrow } from 'react-icons/md';
import toast from 'react-hot-toast';

function RestTimer({ seconds, onComplete }) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef(null);

  useEffect(() => {
    setRemaining(seconds);
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) { clearInterval(intervalRef.current); onComplete?.(); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [seconds]);

  const pct = ((seconds - remaining) / seconds) * 100;
  return (
    <div style={{ textAlign: 'center', padding: '8px 0' }}>
      <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 6px' }}>
        <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="40" cy="40" r="34" fill="none" stroke="var(--bg-3)" strokeWidth="5" />
          <circle cx="40" cy="40" r="34" fill="none" stroke="var(--accent)" strokeWidth="5"
            strokeDasharray={`${2 * Math.PI * 34}`}
            strokeDashoffset={`${2 * Math.PI * 34 * (1 - pct / 100)}`}
            style={{ transition: 'stroke-dashoffset 1s linear' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--accent)' }}>
          {remaining}
        </div>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase' }}>REST</div>
    </div>
  );
}

function WorkoutTimer({ startTime }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(startTime).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(iv);
  }, [startTime]);
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  return (
    <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--accent)', letterSpacing: 2 }}>
      {h > 0 && `${h}:`}{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </span>
  );
}

function SetRow({ set, onUpdate, onComplete }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 40px', gap: 8, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', opacity: set.completed ? 0.6 : 1 }}>
      <span style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center' }}>{set.setNumber}</span>
      <input className="form-input" style={{ textAlign: 'center', padding: '6px 8px', fontSize: 14 }}
        type="number" placeholder="kg" value={set.weight || ''} min={0}
        onChange={e => onUpdate({ weight: Number(e.target.value) })} disabled={set.completed} />
      <input className="form-input" style={{ textAlign: 'center', padding: '6px 8px', fontSize: 14 }}
        type="number" placeholder="reps" value={set.reps || ''} min={0}
        onChange={e => onUpdate({ reps: Number(e.target.value) })} disabled={set.completed} />
      <button onClick={onComplete}
        style={{ width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: set.completed ? 'var(--green)' : 'var(--bg-3)', border: `1px solid ${set.completed ? 'var(--green)' : 'var(--border)'}`, color: set.completed ? 'white' : 'var(--text-2)', transition: 'all 0.15s', cursor: 'pointer', flexShrink: 0 }}>
        <MdCheck size={18} />
      </button>
    </div>
  );
}

function ExerciseSearchModal({ onAdd, onClose }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    exercisesAPI.list({ limit: 30 })
      .then(r => setResults(r.data || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search) return;
    const t = setTimeout(() => {
      setLoading(true);
      exercisesAPI.list({ search, limit: 30 })
        .then(r => setResults(r.data || []))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxHeight: '80vh' }}>
        <div className="modal-header">
          <h3 style={{ fontFamily: 'var(--font-condensed)', fontSize: 18, fontWeight: 700 }}>Add Exercise</h3>
          <button onClick={onClose} style={{ color: 'var(--text-2)', display: 'flex' }}><MdClose size={22} /></button>
        </div>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ position: 'relative' }}>
            <MdSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} size={18} />
            <input className="form-input" style={{ paddingLeft: 40, width: '100%' }}
              placeholder="Search exercises..." value={search} autoFocus
              onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div style={{ overflowY: 'auto', maxHeight: '50vh' }}>
          {loading ? (
            <div style={{ padding: 20, textAlign: 'center' }}><span className="spinner" /></div>
          ) : results.map(ex => (
            <button key={ex._id} onClick={() => { onAdd(ex); onClose(); }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', background: 'none', cursor: 'pointer', borderBottom: '1px solid var(--border)', textAlign: 'left', transition: 'background 0.1s', border: 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <div style={{ width: 36, height: 36, background: 'var(--accent-dim)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MdFitnessCenter size={16} color="var(--accent)" />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-1)' }}>{ex.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{ex.muscleGroup?.primary?.join(', ')} · {ex.difficulty}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ActiveSessionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restDuration, setRestDuration] = useState(90);
  const [collapsed, setCollapsed] = useState({});
  const [workoutName, setWorkoutName] = useState('Quick Workout');
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completingModal, setCompletingModal] = useState(false);
  const [finalData, setFinalData] = useState({ mood: '', energyLevel: 5, notes: '' });
  const [sessionStarted, setSessionStarted] = useState(false);

  useEffect(() => {
    const preloadedWorkout = location.state?.workout;

    sessionsAPI.getActive().then(res => {
      if (res.data) {

        setSession(res.data);
        setExercises(res.data.exercises || []);
        setWorkoutName(res.data.workoutName);
        setSessionStarted(true);
      } else if (preloadedWorkout) {

        setWorkoutName(preloadedWorkout.name || 'Quick Workout');

        const builtExercises = (preloadedWorkout.exercises || []).map((entry, idx) => ({
          exercise: entry.exercise?._id || entry.exercise || null,
          exerciseName: entry.exerciseName || entry.exercise?.name || `Exercise ${idx + 1}`,
          exerciseType: entry.exercise?.type || 'reps_weight',
          sets: (entry.sets || [{ setNumber: 1, reps: 10, weight: 0 }]).map((s, si) => ({
            setNumber: si + 1,
            reps: s.reps || 10,
            weight: s.weight || 0,
            restTime: s.restTime || 90,
            completed: false,
          })),
          order: idx,
        }));
        setExercises(builtExercises);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [location.state]);

  const startSession = async () => {
    try {
      const res = await sessionsAPI.start({
        workoutName,
        exercises,
      });
      setSession(res.data);
      setSessionStarted(true);
      toast.success('Session started! 💪');
    } catch {
      toast.error('Failed to start session');
    }
  };

  const addExercise = ex => {
    const entry = {
      exercise: ex._id,
      exerciseName: ex.name,
      exerciseType: ex.type || 'reps_weight',
      sets: [{ setNumber: 1, reps: 0, weight: 0, completed: false }],
      order: exercises.length,
    };
    setExercises(prev => [...prev, entry]);
  };

  const addSet = exIdx => {
    setExercises(prev => {
      const updated = [...prev];
      const ex = { ...updated[exIdx] };
      ex.sets = [...ex.sets, { setNumber: ex.sets.length + 1, reps: 0, weight: 0, completed: false }];
      updated[exIdx] = ex;
      return updated;
    });
  };

  const updateSet = (exIdx, setIdx, changes) => {
    setExercises(prev => {
      const updated = [...prev];
      const ex = { ...updated[exIdx] };
      ex.sets = ex.sets.map((s, i) => i === setIdx ? { ...s, ...changes } : s);
      updated[exIdx] = ex;
      return updated;
    });
  };

  const completeSet = (exIdx, setIdx) => {
    const set = exercises[exIdx].sets[setIdx];
    updateSet(exIdx, setIdx, { completed: !set.completed, completedAt: new Date() });
    if (!set.completed) {
      setRestDuration(set.restTime || 90);
      setShowRestTimer(true);
      toast(`Set ${set.setNumber} logged! ✅`, { icon: '💪', duration: 1500 });
    }
  };

  const removeExercise = idx => {
    setExercises(prev => prev.filter((_, i) => i !== idx));
  };

  const handleFinish = async () => {
    if (!session) return;
    setCompleting(true);
    try {
      const res = await sessionsAPI.complete(session._id, { ...finalData, exercises });
      toast.success('Workout completed! 🎉');
      navigate(`/sessions/${res.data._id}`);
    } catch {
      toast.error('Failed to save session');
    } finally {
      setCompleting(false);
      setCompletingModal(false);
    }
  };

  const totalVolume = exercises.reduce((sum, ex) =>
    sum + ex.sets.filter(s => s.completed).reduce((s2, set) => s2 + (set.weight || 0) * (set.reps || 0), 0), 0);
  const completedSets = exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0);

  if (loading) return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <span className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );


  if (!sessionStarted) {
    return (
      <div className="page-container animate-fade" style={{ maxWidth: 560 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 42, letterSpacing: 2, marginBottom: 8 }}>START SESSION</h1>
        <p style={{ color: 'var(--text-2)', marginBottom: 28 }}>
          {exercises.length > 0
            ? `${exercises.length} exercises loaded from workout plan.`
            : 'Name your workout and add exercises to begin.'}
        </p>

        <div className="form-group" style={{ marginBottom: 20 }}>
          <label className="form-label">Workout Name</label>
          <input className="form-input" style={{ fontSize: 17 }} value={workoutName}
            onChange={e => setWorkoutName(e.target.value)} placeholder="e.g. Push Day A" />
        </div>


        {exercises.length > 0 && (
          <div className="card" style={{ marginBottom: 24, padding: '12px 16px' }}>
            <div style={{ fontFamily: 'var(--font-condensed)', fontSize: 14, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              Exercises ({exercises.length})
            </div>
            {exercises.map((ex, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < exercises.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 14 }}>
                <span style={{ fontWeight: 600 }}>{ex.exerciseName}</span>
                <span style={{ color: 'var(--text-3)' }}>{ex.sets.length} sets</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={startSession}>
            <MdPlayArrow size={22} /> Start Session
          </button>
          <button className="btn btn-secondary" onClick={() => setShowSearch(true)}>
            <MdAdd size={18} /> Add Exercise
          </button>
        </div>

        {showSearch && <ExerciseSearchModal onAdd={addExercise} onClose={() => setShowSearch(false)} />}
      </div>
    );
  }


  return (
    <div className="page-container animate-fade" style={{ maxWidth: 700 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, letterSpacing: 2 }}>{workoutName}</h1>
          <WorkoutTimer startTime={session.startTime} />
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--accent)' }}>{totalVolume}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase' }}>kg vol</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--accent)' }}>{completedSets}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase' }}>sets</div>
          </div>
          <button className="btn btn-danger btn-sm" onClick={() => setCompletingModal(true)}>
            <MdStop size={16} /> Finish
          </button>
        </div>
      </div>


      {showRestTimer && (
        <div className="card" style={{ marginBottom: 20, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <RestTimer seconds={restDuration} onComplete={() => { setShowRestTimer(false); toast('Rest done! 💥', { icon: '⏱' }); }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 8 }}>Rest duration</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[30, 60, 90, 120, 180].map(s => (
                <button key={s} onClick={() => setRestDuration(s)}
                  style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: restDuration === s ? 'var(--accent)' : 'var(--bg-3)', color: restDuration === s ? 'var(--bg-0)' : 'var(--text-2)', border: '1px solid var(--border)' }}>
                  {s}s
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => setShowRestTimer(false)} style={{ color: 'var(--text-3)', display: 'flex', cursor: 'pointer', background: 'none', border: 'none' }}>
            <MdClose size={20} />
          </button>
        </div>
      )}


      {exercises.map((ex, exIdx) => (
        <div key={exIdx} className="card" style={{ marginBottom: 16 }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-condensed)', fontSize: 17, fontWeight: 700 }}>{ex.exerciseName}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                {ex.sets.filter(s => s.completed).length}/{ex.sets.length} sets completed
              </div>
            </div>
            <button onClick={() => setCollapsed(c => ({ ...c, [exIdx]: !c[exIdx] }))} style={{ color: 'var(--text-2)', display: 'flex', cursor: 'pointer', background: 'none', border: 'none' }}>
              {collapsed[exIdx] ? <MdExpandMore size={22} /> : <MdExpandLess size={22} />}
            </button>
            <button onClick={() => removeExercise(exIdx)} style={{ color: 'var(--text-3)', display: 'flex', cursor: 'pointer', background: 'none', border: 'none' }}>
              <MdClose size={18} />
            </button>
          </div>

          {!collapsed[exIdx] && (
            <div style={{ padding: '8px 16px 12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 40px', gap: 8, padding: '4px 0 8px', borderBottom: '1px solid var(--border)' }}>
                {['#', 'KG', 'REPS', '✓'].map(h => (
                  <span key={h} style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', fontWeight: 700, letterSpacing: '0.05em', fontFamily: 'var(--font-condensed)' }}>{h}</span>
                ))}
              </div>
              {ex.sets.map((set, setIdx) => (
                <SetRow key={setIdx} set={set}
                  onUpdate={changes => updateSet(exIdx, setIdx, changes)}
                  onComplete={() => completeSet(exIdx, setIdx)} />
              ))}
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => addSet(exIdx)}>
                <MdAdd size={16} /> Add Set
              </button>
            </div>
          )}
        </div>
      ))}

      <button className="btn btn-secondary btn-full" style={{ marginBottom: 32 }} onClick={() => setShowSearch(true)}>
        <MdAdd size={18} /> Add Exercise
      </button>

      {showSearch && <ExerciseSearchModal onAdd={addExercise} onClose={() => setShowSearch(false)} />}


      {completingModal && (
        <div className="modal-overlay">
          <div className="modal animate-scale">
            <div className="modal-header">
              <h3 style={{ fontFamily: 'var(--font-condensed)', fontSize: 20, fontWeight: 700 }}>Finish Workout?</h3>
              <button onClick={() => setCompletingModal(false)} style={{ color: 'var(--text-2)', display: 'flex', cursor: 'pointer', background: 'none', border: 'none' }}><MdClose size={22} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {[{ label: 'Sets Done', value: completedSets }, { label: 'Volume', value: `${totalVolume}kg` }, { label: 'Exercises', value: exercises.length }].map(({ label, value }) => (
                  <div key={label} style={{ background: 'var(--bg-3)', borderRadius: 10, padding: 12, textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--accent)' }}>{value}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                  </div>
                ))}
              </div>
              <div className="form-group">
                <label className="form-label">How did it feel?</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['terrible', 'bad', 'ok', 'good', 'great', 'amazing'].map(m => (
                    <button key={m} onClick={() => setFinalData(f => ({ ...f, mood: m }))}
                      style={{ flex: 1, padding: '6px 2px', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontWeight: 600, fontFamily: 'var(--font-condensed)', textTransform: 'capitalize', background: finalData.mood === m ? 'var(--accent)' : 'var(--bg-3)', color: finalData.mood === m ? 'var(--bg-0)' : 'var(--text-2)', border: '1px solid var(--border)' }}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Session Notes</label>
                <textarea className="form-textarea" placeholder="Any notes..." value={finalData.notes}
                  onChange={e => setFinalData(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setCompletingModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleFinish} disabled={completing}>
                {completing ? <span className="spinner" /> : '🎉 Save Workout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
