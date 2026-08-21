import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../authContext.jsx';
import { ROUTES } from '../routes.js';
import { friendlyError, GoogleButton } from './AuthBits.jsx';

export default function Login() {
  const { user, loading, firebaseReady, signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to={ROUTES.dashboard} replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signIn(email.trim(), password);
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
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to manage your family&apos;s health.</p>

        {/* Firebase config warning */}
        {!firebaseReady && (
          <div className="auth-config-warn">
            <strong>⚠️ Firebase not configured</strong><br />
            Open the root <code>.env</code> file and replace the{' '}
            <code>VITE_FIREBASE_API_KEY</code> placeholder with your real Firebase
            web app credentials, then restart the dev server.
          </div>
        )}

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={onSubmit} className="auth-form">
          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={!firebaseReady}
            />
          </label>
          <label className="auth-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              required
              disabled={!firebaseReady}
            />
          </label>
          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy || !firebaseReady}>
            {busy ? 'Signing in\u2026' : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <GoogleButton onClick={onGoogle} busy={busy || !firebaseReady} />

        <p className="auth-alt">
          New to ShushrutAI? <Link to={ROUTES.register}>Create an account</Link>
        </p>
      </div>
    </div>
  );
}
