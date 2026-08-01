import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import { RiskBadge, StatCard, Avatar } from './ui.jsx';
import { TextEffect } from './core/TextEffect.jsx';
import { InView } from './core/InView.jsx';
import { useMember } from '../memberContext.jsx';
import { useAuth } from '../authContext.jsx';
import { ROUTES } from '../routes.js';
import { apiGet } from '../api.js';

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
  const { profile, user } = useAuth();
  const [dashData, setDashData] = useState(null);

  useEffect(() => {
    let unmounted = false;
    apiGet('/api/dashboard')
      .then((data) => {
        if (!unmounted && data) setDashData(data);
      })
      .catch(() => {});
    return () => {
      unmounted = true;
    };
  }, [members]);

  const displayName = profile?.name || user?.displayName || 'Family Health Manager';
  const firstName = displayName.split(' ')[0] || 'Manager';
  const greeting = `${getGreeting()}, ${firstName}`;

  const familySize = dashData?.familySize ?? members.length;
  const highRiskCount = dashData?.highRisk ?? members.filter((m) => m.level === 'high').length;
  const assessedCount = dashData?.assessments ?? members.filter((m) => m.assessed && m.lastAssessed !== 'Never').length;
  const pendingCheckups = dashData?.pendingCheckups ?? 0;

  const stats = [
    { label: 'Family Members', value: String(familySize), icon: 'users', change: 'Registered', trend: 'up' },
    { label: 'High Risk Members', value: String(highRiskCount), icon: 'alert', change: 'Needs attention', trend: highRiskCount > 0 ? 'down' : 'flat' },
    { label: 'AI Assessments', value: String(assessedCount), icon: 'sparkle', change: 'Completed', trend: 'up' },
    { label: 'Pending Check-ups', value: String(pendingCheckups), icon: 'calendar', change: 'Scheduled', trend: 'flat' },
  ];

  const alerts = dashData?.alerts || [];
  members.forEach((m) => {
    (m.warnings || []).forEach((w) => {
      if (!alerts.some((a) => a.title === w.title && a.memberName === m.name)) {
        alerts.push({
          level: w.level || 'moderate',
          icon: w.icon || 'bolt',
          title: w.title || 'Health Alert',
          desc: w.desc || '',
          memberName: m.name,
        });
      }
    });
  });

  const openMember = (id) => {
    setMember(id);
    navigate(ROUTES.insights);
  };

  return (
    <>
      <div className="dash-greeting">
        <h1>
          <TextEffect per="word" preset="slide" as="span">
            {greeting}
          </TextEffect>
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
        <InView
          className="card card-lg"
          variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } }}
          viewOptions={{ margin: '0px 0px -60px 0px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="card-header">
            <div>
              <div className="card-title">Family Members</div>
              <div className="card-subtitle">Latest assessments and risk levels</div>
            </div>
          </div>
          <div className="recent-patients">
            {members.length === 0 ? (
              <div style={{ padding: '24px', color: 'var(--gray-400)', textAlign: 'center', fontSize: '0.875rem' }}>
                No family members added yet. Click &quot;Family Members&quot; to add your first profile.
              </div>
            ) : (
              members.map((p) => (
                <div
                  key={p.id}
                  className="patient-row clickable"
                  onClick={() => openMember(p.id)}
                >
                  <Avatar initials={p.initials} background={p.avatar} />
                  <div className="patient-info">
                    <div className="patient-name">{p.name}</div>
                    <div className="patient-detail">
                      {p.relation} {p.age ? `· ${p.age} yrs` : ''} · Assessed {p.lastAssessed || 'Never'}
                    </div>
                  </div>
                  <RiskBadge level={p.level || 'low'} />
                </div>
              ))
            )}
          </div>
        </InView>

        <InView
          className="card card-lg"
          variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } }}
          viewOptions={{ margin: '0px 0px -60px 0px' }}
          transition={{ duration: 0.5, delay: 0.12, ease: 'easeOut' }}
        >
          <div className="card-header">
            <div>
              <div className="card-title">Health Alerts</div>
              <div className="card-subtitle">Needs your attention</div>
            </div>
          </div>
          <div className="alert-list">
            {alerts.length === 0 ? (
              <div style={{ padding: '24px', color: 'var(--gray-400)', textAlign: 'center', fontSize: '0.875rem' }}>
                No active health alerts. All family members are monitored.
              </div>
            ) : (
              alerts.map((a, i) => (
                <div className="alert-item" key={i}>
                  <div className={`alert-icon-wrap ${a.level === 'high' ? 'danger' : 'warning'}`}>
                    <Icon name={a.icon || 'bolt'} size="md" />
                  </div>
                  <div className="alert-text">
                    <div className="alert-title">{a.title} {a.memberName ? `(${a.memberName})` : ''}</div>
                    <div className="alert-desc">{a.desc}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </InView>
      </div>
    </>
  );
}
