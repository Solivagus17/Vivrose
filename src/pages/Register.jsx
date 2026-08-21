import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../authContext.jsx';
import Icon from '../components/Icon.jsx';
import { ROUTES } from '../routes.js';
import { friendlyError, GoogleButton } from './AuthBits.jsx';

export default function Register() {
  const { user, loading, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to={ROUTES.dashboard} replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await signUp(name.trim(), email.trim(), password);
      navigate(ROUTES.dashboard);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async () => {
    setError('');
    setBusy(true);
    try {
      await signInWithGoogle();
      navigate(ROUTES.dashboard);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="logo-mark">S</div>
          <span>ShushrutAI</span>
        </div>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">One account for your whole family&apos;s health.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={onSubmit} className="auth-form">
          <label className="auth-field">
            <span>Your name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Arjun Mehta"
              autoComplete="name"
              required
            />
          </label>
          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>
          <label className="auth-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              required
            />
          </label>
          <label className="auth-field">
            <span>Confirm password</span>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your password"
              autoComplete="new-password"
              required
            />
          </label>
          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy}>
            {busy ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <GoogleButton onClick={onGoogle} busy={busy} />

        <p className="auth-alt">
          Already have an account? <Link to={ROUTES.login}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
