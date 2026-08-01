import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../authContext.jsx';
import Icon from './Icon.jsx';
import { ROUTES } from '../routes.js';

function Toggle({ on, onChange }) {
  return (
    <div className={`toggle-track${on ? ' active' : ''}`} onClick={() => onChange(!on)} role="switch" aria-checked={on}>
      <div className="toggle-thumb"></div>
    </div>
  );
}

function SettingsRow({ label, desc, children }) {
  return (
    <div className="settings-row">
      <div>
        <div className="settings-row-label">{label}</div>
        <div className="settings-row-desc">{desc}</div>
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [autoSuggest, setAutoSuggest] = useState(true);
  const [highAlerts, setHighAlerts] = useState(true);
  const [missingReminders, setMissingReminders] = useState(true);
  const [followUps, setFollowUps] = useState(false);
  const [explainLevel, setExplainLevel] = useState('Standard');
  const [highThreshold, setHighThreshold] = useState(70);
  const [modThreshold, setModThreshold] = useState(40);
  const [signingOut, setSigningOut] = useState(false);

  const displayName = profile?.name || user?.displayName || 'Family Health Manager';
  const displayEmail = profile?.email || user?.email || '';
  const initials = (displayName || 'U')
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      navigate(ROUTES.home);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">Settings</div>
        <div className="page-subtitle">Configure VivRose preferences for your family.</div>
      </div>

      <div className="settings-grid">

        {/* Account Card */}
        <div className="settings-section">
          <h3>Account</h3>
          <div className="section-desc">Your signed-in identity and session controls.</div>
          <div className="settings-account-card">
            <div className="avatar settings-avatar">{initials}</div>
            <div className="settings-account-info">
              <div className="settings-account-name">{displayName}</div>
              {displayEmail && (
                <div className="settings-account-email">{displayEmail}</div>
              )}
              <div className="settings-account-provider">
                {user?.providerData?.[0]?.providerId === 'google.com'
                  ? '🔐 Signed in with Google'
                  : '🔐 Signed in with email'}
              </div>
            </div>
          </div>
        </div>

        {/* Health Monitoring */}
        <div className="settings-section">
          <h3>Health Monitoring</h3>
          <div className="section-desc">Configure risk thresholds and health parameters.</div>
          <SettingsRow label="High Risk Threshold" desc="Score above which a family member is flagged as high risk">
            <input
              type="number"
              className="form-input"
              value={highThreshold}
              onChange={(e) => setHighThreshold(e.target.value)}
              style={{ width: 80, textAlign: 'center' }}
            />
          </SettingsRow>
          <SettingsRow label="Moderate Risk Threshold" desc="Score above which a family member is flagged as moderate risk">
            <input
              type="number"
              className="form-input"
              value={modThreshold}
              onChange={(e) => setModThreshold(e.target.value)}
              style={{ width: 80, textAlign: 'center' }}
            />
          </SettingsRow>
          <SettingsRow
            label="Auto-suggest Check-ups"
            desc="Automatically recommend check-ups based on available data"
          >
            <Toggle on={autoSuggest} onChange={setAutoSuggest} />
          </SettingsRow>
        </div>

        {/* Notification Preferences */}
        <div className="settings-section">
          <h3>Notification Preferences</h3>
          <div className="section-desc">Manage how you receive health alerts.</div>
          <SettingsRow label="Health Alerts" desc="Notify me when a family member is flagged as high risk">
            <Toggle on={highAlerts} onChange={setHighAlerts} />
          </SettingsRow>
          <SettingsRow label="Check-up Reminders" desc="Remind me about pending lab tests and screenings">
            <Toggle on={missingReminders} onChange={setMissingReminders} />
          </SettingsRow>
          <SettingsRow label="Follow-up Reminders" desc="Notify me about doctor follow-ups">
            <Toggle on={followUps} onChange={setFollowUps} />
          </SettingsRow>
        </div>

        {/* AI Preferences */}
        <div className="settings-section">
          <h3>AI Preferences</h3>
          <div className="section-desc">Adjust how AI explanations are presented.</div>
          <SettingsRow label="Explanation Detail Level" desc="How much detail health explanations should include">
            <div className="segmented">
              {['Brief', 'Standard', 'Detailed'].map((opt) => (
                <span
                  key={opt}
                  className={`segmented-btn${explainLevel === opt ? ' active' : ''}`}
                  onClick={() => setExplainLevel(opt)}
                >
                  {opt}
                </span>
              ))}
            </div>
          </SettingsRow>
          <SettingsRow label="Default Education Language" desc="Default language for health education materials">
            <select className="form-select" style={{ width: 150 }} defaultValue="en">
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="gu">ગુજરાતી</option>
            </select>
          </SettingsRow>
        </div>

        {/* Session / Sign Out */}
        <div className="settings-section">
          <h3>Session</h3>
          <div className="section-desc">Sign out to end your session on this device.</div>
          <div className="settings-signout-row">
            <div>
              <div className="settings-row-label">Sign Out</div>
              <div className="settings-row-desc">You will be returned to the home screen.</div>
            </div>
            <button
              id="settings-signout-btn"
              type="button"
              className="btn settings-signout-btn"
              onClick={handleSignOut}
              disabled={signingOut}
            >
              <Icon name="logout" size="sm" />
              {signingOut ? 'Signing out\u2026' : 'Sign Out'}
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
