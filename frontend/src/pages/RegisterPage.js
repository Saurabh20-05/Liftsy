import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const GOALS = [
  'Build Muscle',
  'Lose Weight',
  'Improve Strength',
  'Increase Endurance',
  'Stay Active',
  'Athletic Performance',
];

const LEVELS = ['beginner', 'intermediate', 'advanced', 'elite'];

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    displayName: '',
    fitnessLevel: 'beginner',
    goals: [],
  });
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const toggleGoal = (goal) => {
    setForm((current) => ({
      ...current,
      goals: current.goals.includes(goal)
        ? current.goals.filter((item) => item !== goal)
        : [...current.goals, goal],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(form);
      toast.success('Account created. Welcome to Liftsy!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Registration failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0b0e13',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 500,
          animation: 'fadeIn 0.3s ease',
        }}
      >
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 30,
              letterSpacing: 2,
              color: '#6ea8fe',
              marginBottom: 10,
            }}
          >
            LIFTSY
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-condensed)',
              fontSize: 30,
              fontWeight: 700,
              margin: 0,
              color: '#f1f3f6',
            }}
          >
            Create your account
          </h1>

          <p
            style={{
              marginTop: 7,
              color: '#7f8998',
              fontSize: 14,
            }}
          >
            A few details and you're ready to train.
          </p>
        </div>

        <div
          style={{
            background: '#151a22',
            border: '1px solid #252c37',
            borderRadius: 14,
            padding: 28,
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  className="form-input"
                  type="text"
                  placeholder="yourusername"
                  value={form.username}
                  onChange={(e) => updateField('username', e.target.value)}
                  autoComplete="username"
                  required
                  minLength={3}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="displayName">
                  Display Name
                </label>
                <input
                  id="displayName"
                  className="form-input"
                  type="text"
                  placeholder="Your name"
                  value={form.displayName}
                  onChange={(e) => updateField('displayName', e.target.value)}
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className="form-input"
                type="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                autoComplete="new-password"
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Fitness level
              </label>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 8,
                }}
              >
                {LEVELS.map((level) => {
                  const selected = form.fitnessLevel === level;

                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => updateField('fitnessLevel', level)}
                      style={{
                        height: 40,
                        borderRadius: 8,
                        border: `1px solid ${selected ? '#6ea8fe' : '#252c37'}`,
                        background: selected ? '#6ea8fe' : '#10151c',
                        color: selected ? '#0b0e13' : '#8993a2',
                        fontFamily: 'var(--font-condensed)',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                What are you working towards?
              </label>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                {GOALS.map((goal) => {
                  const selected = form.goals.includes(goal);

                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => toggleGoal(goal)}
                      style={{
                        padding: '8px 13px',
                        borderRadius: 8,
                        border: `1px solid ${selected ? '#6ea8fe' : '#252c37'}`,
                        background: selected ? 'rgba(110,168,254,0.12)' : '#10151c',
                        color: selected ? '#8dbaff' : '#8993a2',
                        fontFamily: 'var(--font-body)',
                        fontSize: 13,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {goal}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: 48,
                marginTop: 4,
                border: 'none',
                borderRadius: 8,
                background: '#6ea8fe',
                color: '#0b0e13',
                fontFamily: 'var(--font-condensed)',
                fontSize: 16,
                fontWeight: 700,
                cursor: loading ? 'default' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'background 0.2s ease',
              }}
            >
              {loading ? (
                <span
                  className="spinner"
                  style={{
                    width: 18,
                    height: 18,
                    borderColor: 'rgba(11,14,19,0.3)',
                    borderTopColor: '#0b0e13',
                  }}
                />
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div
            style={{
              height: 1,
              background: '#252c37',
              margin: '24px 0',
            }}
          />

          <p
            style={{
              textAlign: 'center',
              margin: 0,
              color: '#707a89',
              fontSize: 14,
            }}
          >
            Already have an account?{' '}
            <Link
              to="/login"
              style={{
                color: '#6ea8fe',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Sign in
            </Link>
          </p>
        </div>

        <p
          style={{
            textAlign: 'center',
            color: '#596271',
            fontSize: 12,
            marginTop: 20,
          }}
        >
          Start where you are. Build from there.
        </p>
      </div>
    </div>
  );
}