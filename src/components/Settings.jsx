import React, { useState } from 'react';

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
  const [autoSuggest, setAutoSuggest] = useState(true);
  const [highAlerts, setHighAlerts] = useState(true);
  const [missingReminders, setMissingReminders] = useState(true);
  const [followUps, setFollowUps] = useState(false);
  const [explainLevel, setExplainLevel] = useState('Standard');
  const [highThreshold, setHighThreshold] = useState(70);
  const [modThreshold, setModThreshold] = useState(40);

  return (
    <>
      <div className="page-header">
        <div className="page-title">Settings</div>
        <div className="page-subtitle">Configure VivRose preferences for your family.</div>
      </div>

      <div className="settings-grid">
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
      </div>
    </>
  );
}
