import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { workoutsAPI, aiAPI, exercisesAPI } from '../utils/api';
import { MdAdd, MdFitnessCenter, MdClose, MdPsychology, MdSearch, MdDelete, MdEdit, MdPlayArrow, MdPublic, MdLock } from 'react-icons/md';
import toast from 'react-hot-toast';

const CATEGORIES = ['strength','cardio','hiit','yoga','pilates','crossfit','powerlifting','bodybuilding','calisthenics','custom'];
const DIFFICULTIES = ['beginner','intermediate','advanced','elite'];


function AIGenerateModal({ onCreated, onClose }) {
  const [form, setForm] = useState({ goal: '', fitnessLevel: 'intermediate', equipment: [], duration: 60, muscleGroups: [], notes: '' });
  const [loading, setLoading] = useState(false);
  const EQUIP = ['barbell','dumbbell','kettlebell','cable','machine','bodyweight','resistance band','pull-up bar'];
  const MUSCLES = ['chest','back','shoulders','biceps','triceps','core','quads','hamstrings','glutes','calves','full body'];

  const toggle = (field, val) => setForm(f => ({
    ...f, [field]: f[field].includes(val) ? f[field].filter(x => x !== val) : [...f[field], val]
  }));

  const handleGenerate = async () => {
    if (!form.goal.trim()) return toast.error('Please enter a goal');
    setLoading(true);
    try {
      const res = await aiAPI.generateWorkout(form);
      toast.success('AI workout generated! 🤖');
      onCreated(res.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed — check OpenAI API key');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <h3 style={{ fontFamily: 'var(--font-condensed)', fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MdPsychology size={22} color="var(--purple)" /> AI Workout Generator
          </h3>
          <button onClick={onClose} style={{ color: 'var(--text-2)', display: 'flex' }}><MdClose size={22} /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">What's your goal?</label>
            <input className="form-input" placeholder="e.g. Build upper body strength, lose fat, improve endurance..."
              value={form.goal} onChange={e => setForm(f => ({ ...f, goal: e.target.value }))} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Fitness Level</label>
              <select className="form-select" value={form.fitnessLevel} onChange={e => setForm(f => ({ ...f, fitnessLevel: e.target.value }))}>
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Duration (minutes)</label>
              <input className="form-input" type="number" min={15} max={120} value={form.duration}
                onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Equipment Available</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {EQUIP.map(e => (
                <button key={e} type="button" onClick={() => toggle('equipment', e)}
                  style={{ padding: '5px 12px', borderRadius: 100, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
                    background: form.equipment.includes(e) ? 'var(--accent-dim)' : 'var(--bg-3)',
                    color: form.equipment.includes(e) ? 'var(--accent)' : 'var(--text-2)',
                    border: `1px solid ${form.equipment.includes(e) ? 'var(--accent)' : 'var(--border)'}` }}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Target Muscles</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {MUSCLES.map(m => (
                <button key={m} type="button" onClick={() => toggle('muscleGroups', m)}
                  style={{ padding: '5px 12px', borderRadius: 100, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
                    background: form.muscleGroups.includes(m) ? 'var(--blue-dim)' : 'var(--bg-3)',
                    color: form.muscleGroups.includes(m) ? 'var(--blue)' : 'var(--text-2)',
                    border: `1px solid ${form.muscleGroups.includes(m) ? 'var(--blue)' : 'var(--border)'}` }}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Additional Notes</label>
            <textarea className="form-textarea" placeholder="Any injuries, preferences, or special requirements..."
              value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
            {loading ? <><span className="spinner" /> Generating...</> : <><MdPsychology size={16} /> Generate Workout</>}
          </button>
        </div>
      </div>
    </div>
  );
}


function WorkoutModal({ workout: initial, onSaved, onClose }) {
  const [form, setForm] = useState(initial || {
    name: '', description: '', category: 'strength', difficulty: 'intermediate',
    isPublic: true, muscleGroups: [], tags: [], exercises: []
  });
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!exerciseSearch) { setSearchResults([]); return; }
    const t = setTimeout(() => {
      exercisesAPI.list({ search: exerciseSearch, limit: 10 }).then(r => setSearchResults(r.data));
    }, 300);
    return () => clearTimeout(t);
  }, [exerciseSearch]);

  const addExercise = ex => {
    setForm(f => ({
      ...f,
      exercises: [...f.exercises, {
        exercise: ex._id, exerciseName: ex.name,
        sets: [{ setNumber: 1, reps: 10, weight: 0, restTime: 90 }]
      }]
    }));
    setExerciseSearch(''); setSearchResults([]);
  };

  const removeExercise = idx => setForm(f => ({ ...f, exercises: f.exercises.filter((_, i) => i !== idx) }));

  const updateExerciseSet = (exIdx, setIdx, field, val) => {
    setForm(f => {
      const exercises = [...f.exercises];
      exercises[exIdx] = { ...exercises[exIdx], sets: exercises[exIdx].sets.map((s, i) => i === setIdx ? { ...s, [field]: val } : s) };
      return { ...f, exercises };
    });
  };

  const addSet = exIdx => {
    setForm(f => {
      const exercises = [...f.exercises];
      const ex = exercises[exIdx];
      exercises[exIdx] = { ...ex, sets: [...ex.sets, { setNumber: ex.sets.length + 1, reps: 10, weight: 0, restTime: 90 }] };
      return { ...f, exercises };
    });
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Workout name required');
    setSaving(true);
    try {
      const res = initial?._id ? await workoutsAPI.update(initial._id, form) : await workoutsAPI.create(form);
      toast.success(initial ? 'Workout updated!' : 'Workout created!');
      onSaved(res.data);
      onClose();
    } catch { toast.error('Failed to save workout'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 680, maxHeight: '90vh' }}>
        <div className="modal-header">
          <h3 style={{ fontFamily: 'var(--font-condensed)', fontSize: 20, fontWeight: 700 }}>
            {initial ? 'Edit Workout' : 'Create Workout'}
          </h3>
          <button onClick={onClose} style={{ color: 'var(--text-2)', display: 'flex' }}><MdClose size={22} /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto', maxHeight: '65vh' }}>
          <div className="form-group">
            <label className="form-label">Workout Name *</label>
            <input className="form-input" placeholder="e.g. Push Day A" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" placeholder="What's this workout about?" value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Difficulty</label>
              <select className="form-select" value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Visibility</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {[{ val: true, icon: MdPublic, label: 'Public' }, { val: false, icon: MdLock, label: 'Private' }].map(({ val, icon: Icon, label }) => (
                <button key={label} type="button" onClick={() => setForm(f => ({ ...f, isPublic: val }))}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px',
                    borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
                    background: form.isPublic === val ? 'var(--accent-dim)' : 'var(--bg-3)',
                    color: form.isPublic === val ? 'var(--accent)' : 'var(--text-2)',
                    border: `1px solid ${form.isPublic === val ? 'var(--accent)' : 'var(--border)'}`,
                    fontFamily: 'var(--font-condensed)', fontWeight: 600 }}>
                  <Icon size={16} /> {label}
                </button>
              ))}
            </div>
          </div>


          <div>
            <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>Exercises</label>
            {form.exercises.map((ex, exIdx) => (
              <div key={exIdx} style={{ background: 'var(--bg-3)', borderRadius: 10, padding: '12px', marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{ex.exerciseName}</span>
                  <button onClick={() => removeExercise(exIdx)} style={{ color: 'var(--text-3)', display: 'flex', cursor: 'pointer', background: 'none', border: 'none' }}>
                    <MdClose size={18} />
                  </button>
                </div>
                {ex.sets.map((set, si) => (
                  <div key={si} style={{ display: 'grid', gridTemplateColumns: '24px 1fr 1fr 1fr', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center' }}>{si + 1}</span>
                    <input className="form-input" style={{ padding: '6px', textAlign: 'center', fontSize: 13 }} type="number" placeholder="kg" value={set.weight}
                      onChange={e => updateExerciseSet(exIdx, si, 'weight', Number(e.target.value))} />
                    <input className="form-input" style={{ padding: '6px', textAlign: 'center', fontSize: 13 }} type="number" placeholder="reps" value={set.reps}
                      onChange={e => updateExerciseSet(exIdx, si, 'reps', Number(e.target.value))} />
                    <input className="form-input" style={{ padding: '6px', textAlign: 'center', fontSize: 13 }} type="number" placeholder="rest(s)" value={set.restTime}
                      onChange={e => updateExerciseSet(exIdx, si, 'restTime', Number(e.target.value))} />
                  </div>
                ))}
                <button className="btn btn-ghost btn-sm" onClick={() => addSet(exIdx)} style={{ fontSize: 12, marginTop: 4 }}>
                  <MdAdd size={14} /> Add Set
                </button>
              </div>
            ))}


            <div style={{ position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <MdSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} size={18} />
                <input className="form-input" style={{ paddingLeft: 40 }} placeholder="Search and add exercises..."
                  value={exerciseSearch} onChange={e => setExerciseSearch(e.target.value)} />
              </div>
              {searchResults.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 8, zIndex: 50, maxHeight: 200, overflowY: 'auto' }}>
                  {searchResults.map(ex => (
                    <button key={ex._id} onClick={() => addExercise(ex)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      <MdFitnessCenter size={16} color="var(--accent)" />
                      <span style={{ fontSize: 14, color: 'var(--text-1)' }}>{ex.name}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 'auto' }}>{ex.muscleGroup?.primary?.[0]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <span className="spinner" /> : initial ? 'Save Changes' : 'Create Workout'}
          </button>
        </div>
      </div>
    </div>
  );
}


function WorkoutCard({ workout, onEdit, onDelete, showActions = true }) {
  const navigate = useNavigate();
  const CATEGORY_COLORS = { strength: 'var(--blue)', cardio: 'var(--red)', hiit: 'var(--orange)', powerlifting: 'var(--purple)', bodybuilding: 'var(--accent)', custom: 'var(--text-2)' };
  const color = CATEGORY_COLORS[workout.category] || 'var(--text-2)';

  return (
    <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-condensed)', fontSize: 17, fontWeight: 700, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {workout.name}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color, background: `${color}18`, padding: '2px 8px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {workout.category}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-3)', background: 'var(--bg-3)', padding: '2px 8px', borderRadius: 100, textTransform: 'capitalize' }}>
                {workout.difficulty}
              </span>
              {workout.aiGenerated && <span style={{ fontSize: 11, color: 'var(--purple)', background: 'rgba(165,94,234,0.15)', padding: '2px 8px', borderRadius: 100 }}>🤖 AI</span>}
            </div>
          </div>
          {!workout.isPublic && <MdLock size={16} color="var(--text-3)" style={{ flexShrink: 0, marginLeft: 8 }} />}
        </div>
        {workout.description && (
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 10, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {workout.description}
          </p>
        )}
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-3)' }}>
          <span>{workout.exercises?.length || 0} exercises</span>
          {workout.estimatedDuration && <span>~{workout.estimatedDuration}min</span>}
          {workout.timesUsed > 0 && <span>{workout.timesUsed}× used</span>}
        </div>
      </div>
      <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
        <button className="btn btn-primary btn-sm" style={{ flex: 1 }}
          onClick={() => navigate('/session/active', { state: { workout } })}>
          <MdPlayArrow size={16} /> Start
        </button>
        <Link to={`/workouts/${workout._id}`} className="btn btn-secondary btn-sm">View</Link>
        {showActions && (
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => onEdit(workout)} style={{ padding: '6px 8px' }}>
              <MdEdit size={16} />
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => onDelete(workout._id)} style={{ padding: '6px 8px', color: 'var(--red)' }}>
              <MdDelete size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}


export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [editWorkout, setEditWorkout] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    workoutsAPI.mine().then(r => setWorkouts(r.data)).finally(() => setLoading(false));
  }, []);

  const handleSaved = (workout) => {
    setWorkouts(prev => {
      const idx = prev.findIndex(w => w._id === workout._id);
      return idx >= 0 ? prev.map(w => w._id === workout._id ? workout : w) : [workout, ...prev];
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this workout?')) return;
    try {
      await workoutsAPI.delete(id);
      setWorkouts(prev => prev.filter(w => w._id !== id));
      toast.success('Workout deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleAICreated = (aiWorkout) => {

    setShowCreate(true);
    setEditWorkout({ ...aiWorkout, _id: null });
  };

  const filtered = workouts.filter(w => w.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-container animate-fade">

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 44, letterSpacing: 2 }}>MY WORKOUTS</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => setShowAI(true)}>
            <MdPsychology size={18} color="var(--purple)" /> AI Generate
          </button>
          <button className="btn btn-primary" onClick={() => { setEditWorkout(null); setShowCreate(true); }}>
            <MdAdd size={18} /> Create
          </button>
        </div>
      </div>


      <div style={{ position: 'relative', marginBottom: 24 }}>
        <MdSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} size={20} />
        <input className="form-input" style={{ paddingLeft: 44, width: '100%', maxWidth: 400 }}
          placeholder="Search your workouts..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="grid-3">{[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 160 }} />)}</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🏋️</div>
          <h3 style={{ fontFamily: 'var(--font-condensed)', fontSize: 22, marginBottom: 8 }}>
            {search ? 'No workouts found' : 'No workouts yet'}
          </h3>
          <p style={{ color: 'var(--text-3)', marginBottom: 24 }}>
            {search ? 'Try a different search term' : 'Create your first workout or use AI to generate one!'}
          </p>
          {!search && (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setShowAI(true)}><MdPsychology size={16} /> AI Generate</button>
              <button className="btn btn-primary" onClick={() => setShowCreate(true)}><MdAdd size={16} /> Create Manually</button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(w => (
            <WorkoutCard key={w._id} workout={w}
              onEdit={w => { setEditWorkout(w); setShowCreate(true); }}
              onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showAI && <AIGenerateModal onCreated={handleAICreated} onClose={() => setShowAI(false)} />}
      {showCreate && <WorkoutModal workout={editWorkout} onSaved={handleSaved} onClose={() => { setShowCreate(false); setEditWorkout(null); }} />}
    </div>
  );
}
