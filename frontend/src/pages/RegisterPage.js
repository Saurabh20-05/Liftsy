import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdFitnessCenter } from 'react-icons/md';
import toast from 'react-hot-toast';

const GOALS = ['Build Muscle', 'Lose Weight', 'Improve Strength', 'Increase Endurance', 'Stay Active', 'Athletic Performance'];

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '', email: '', password: '', displayName: '',
    fitnessLevel: 'beginner', goals: []
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const toggleGoal = (goal) => {
    setForm((f) => ({
      ...f,
      goals: f.goals.includes(goal) ? f.goals.filter((g) => g !== goal) : [...f.goals, goal]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
      toast.success('Welcome to Liftsy! 💪');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-0)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', top: -200, left: -100, width: 500, height: 500, background: 'radial-gradient(circle, rgba(232,255,60,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 480 }} className="animate-scale">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, background: 'var(--accent)', borderRadius: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, boxShadow: 'var(--glow-accent)' }}>
            <MdFitnessCenter size={28} color="var(--bg-0)" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: 'var(--accent)', letterSpacing: 4 }}>Liftsy</h1>
          <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Start your fitness journey</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <h2 style={{ fontFamily: 'var(--font-condensed)', fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Create Account</h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Username</label>
                <input className="form-input" type="text" placeholder="saurabh" value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })} required minLength={3} />
              </div>
              <div className="form-group">
                <label className="form-label">Display Name</label>
                <input className="form-input" type="text" placeholder="SaurabhLifts" value={form.displayName}
                  onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="Min 6 characters" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
            </div>

            <div className="form-group">
              <label className="form-label">Fitness Level</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['beginner', 'intermediate', 'advanced', 'elite'].map((level) => (
                  <button key={level} type="button"
                    onClick={() => setForm({ ...form, fitnessLevel: level })}
                    style={{
                      flex: 1, padding: '8px 4px', borderRadius: 6, fontSize: 12,
                      fontFamily: 'var(--font-condensed)', fontWeight: 600, letterSpacing: '0.04em',
                      textTransform: 'capitalize',
                      background: form.fitnessLevel === level ? 'var(--accent)' : 'var(--bg-2)',
                      color: form.fitnessLevel === level ? 'var(--bg-0)' : 'var(--text-2)',
                      border: '1px solid',
                      borderColor: form.fitnessLevel === level ? 'var(--accent)' : 'var(--border)',
                      cursor: 'pointer', transition: 'all 0.15s'
                    }}>
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Goals (select all that apply)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {GOALS.map((goal) => (
                  <button key={goal} type="button" onClick={() => toggleGoal(goal)}
                    style={{
                      padding: '6px 14px', borderRadius: 100, fontSize: 13,
                      fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                      background: form.goals.includes(goal) ? 'var(--accent-dim)' : 'var(--bg-2)',
                      color: form.goals.includes(goal) ? 'var(--accent)' : 'var(--text-2)',
                      border: '1px solid',
                      borderColor: form.goals.includes(goal) ? 'var(--accent)' : 'var(--border)',
                    }}>
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? <span className="spinner" /> : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-3)', fontSize: 14 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
