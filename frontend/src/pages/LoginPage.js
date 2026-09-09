import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(form.email.trim(), form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Unable to sign in'
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
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 410,
          animation: 'fadeIn 0.3s ease',
        }}
      >
        <div style={{ marginBottom: 30 }}>
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
            Welcome back
          </h1>

          <p
            style={{
              marginTop: 7,
              color: '#7f8998',
              fontSize: 14,
            }}
          >
            Pick up where you left off.
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
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email
              </label>

              <input
                id="email"
                name="email"
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
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
                name="password"
                className="form-input"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
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
                'Sign In'
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
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{
                color: '#6ea8fe',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Create one
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
          Train consistently. See the difference.
        </p>
      </div>
    </div>
  );
}