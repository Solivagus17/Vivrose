import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import { RiskBadge, StatCard, Avatar } from './ui.jsx';
import { USER, DASH_STATS, ALERTS } from '../data/data.js';
import { useMember } from '../memberContext.jsx';
import { ROUTES } from '../routes.js';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function today() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { members, setMember } = useMember();

  const stats = DASH_STATS.map((s) =>
    s.label === 'Family Members' ? { ...s, value: String(members.length) } : s
  );

  const openMember = (id) => {
    setMember(id);
    navigate(ROUTES.insights);
  };

  return (
    <>
      <div className="dash-greeting">
        <h1>
          {getGreeting()}, {USER.name.split(' ')[0]}
        </h1>
        <p>Here&apos;s your family&apos;s health overview for today.</p>
      </div>
      <div className="dash-date">{today()}</div>

      <div className="dash-stats stagger-children">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="dash-grid">
        <div className="card card-lg">
          <div className="card-header">
            <div>
              <div className="card-title">Family Members</div>
              <div className="card-subtitle">Latest assessments and risk levels</div>
            </div>
          </div>
          <div className="recent-patients">
            {members.map((p) => (
              <div
                key={p.id}
                className="patient-row clickable"
                onClick={() => openMember(p.id)}
              >
                <Avatar initials={p.initials} background={p.avatar} />
                <div className="patient-info">
                  <div className="patient-name">{p.name}</div>
                  <div className="patient-detail">
                    {p.relation} · {p.age} yrs · Assessed {p.lastAssessed}
                  </div>
                </div>
                <RiskBadge level={p.level} />
              </div>
            ))}
          </div>
        </div>

        <div className="card card-lg">
          <div className="card-header">
            <div>
              <div className="card-title">Health Alerts</div>
              <div className="card-subtitle">Needs your attention</div>
            </div>
          </div>
          <div className="alert-list">
            {ALERTS.map((a) => (
              <div className="alert-item" key={a.title}>
                <div className={`alert-icon-wrap ${a.wrap}`}>
                  <Icon name={a.icon} size="md" />
                </div>
                <div className="alert-text">
                  <div className="alert-title">{a.title}</div>
                  <div className="alert-desc">{a.desc}</div>
                </div>
                <span className="alert-time">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
