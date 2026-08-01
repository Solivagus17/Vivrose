import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import { ROUTES } from '../routes.js';
import { useAuth } from '../authContext.jsx';

const NAV_SECTIONS = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'chart', path: ROUTES.dashboard },
      { id: 'ai-assessments', label: 'AI Assessments', icon: 'sparkle', path: ROUTES.assessment },
    ],
  },
  {
    title: 'Family',
    items: [
      { id: 'family', label: 'Family Members', icon: 'user', path: ROUTES.family },
    ],
  },
  {
    title: 'Insights',
    items: [
      { id: 'insights', label: 'AI Insights', icon: 'sparkle', path: ROUTES.insights },
      { id: 'past-insights', label: 'Past Insights', icon: 'brain', path: ROUTES.pastInsights },
      { id: 'health', label: 'Health Analytics', icon: 'trend', path: ROUTES.health },
      { id: 'generate-report', label: 'Generate AI Report', icon: 'document', path: ROUTES.generateReport },
    ],
  },
  {
    title: 'Care',
    items: [
      { id: 'doctors', label: 'Doctors', icon: 'stethoscope', path: ROUTES.doctors },
      { id: 'medicines', label: 'Medicines', icon: 'pill', path: ROUTES.medicines },
    ],
  },
  {
    title: 'Resources',
    items: [
      { id: 'reports', label: 'Reports', icon: 'clipboard', path: ROUTES.reports },
      { id: 'patient-education', label: 'Health Education', icon: 'book', path: ROUTES.education },
      { id: 'settings', label: 'Settings', icon: 'gear', path: ROUTES.settings },
    ],
  },
];

export default function Sidebar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const name = profile?.name || user?.displayName || 'Family Health Manager';
  const initials = (name || 'U')
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const onSignOut = async () => {
    await signOut();
    navigate(ROUTES.home);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">V</div>
        <div className="logo-word">
          <div className="logo-text">VivRose</div>
          <div className="logo-tag">Predict. Prevent. Prosper.</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to={ROUTES.aiAssistant}
          end
          className={({ isActive }) => `sidebar-ai${isActive ? ' active' : ''}`}
        >
          <span className="sidebar-ai-icon">
            <Icon name="sparkles" size="md" />
          </span>
          <span className="sidebar-ai-text">
            <span className="sidebar-ai-name">VivRose AI</span>
            <span className="sidebar-ai-sub">Ask about your family</span>
          </span>
          <span className="sidebar-ai-badge">AI</span>
        </NavLink>

        {NAV_SECTIONS.map((section) => (
          <div className="sidebar-section" key={section.title}>
            <div className="sidebar-section-title">{section.title}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                end
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <span className="nav-icon">
                  <Icon name={item.icon} size="md" />
                </span>
                {item.label}
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{name}</div>
            <div className="user-role">Family Health Manager</div>
          </div>
          <button
            type="button"
            className="logout-btn"
            title="Sign out"
            aria-label="Sign out"
            onClick={onSignOut}
          >
            <Icon name="logout" size="sm" />
          </button>
        </div>
      </div>
    </aside>
  );
}
