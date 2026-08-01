import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../authContext.jsx';
import { ROUTES } from '../routes.js';

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="logo-mark logo-mark-lg">V</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  return children;
}
