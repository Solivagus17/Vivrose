import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import { RiskBadge, RiskBar, TrendLine, Reveal } from './ui.jsx';
import { TextEffect } from './core/TextEffect.jsx';
import { TextScramble } from './core/TextScramble.jsx';
import { ROUTES } from '../routes.js';

function SectionHeader({ title, subtitle }) {
  return (
    <div className="card-header">
      <div>
        <div className="card-title">{title}</div>
        <div className="card-subtitle">{subtitle}</div>
      </div>
    </div>
  );
}

export default function InsightView({ data }) {
  const navigate = useNavigate();
  const member = data || {};

  return (
    <>
      <div className="patient-header-card">
        <div className="patient-header-content">
          <div className="patient-header-left">
            <div className="patient-header-avatar">{member.initials}</div>
            <div>
              <div className="patient-header-name">
                <TextEffect per="char" preset="blur" as="span" speedReveal={1.3}>
                  {member.name}
                </TextEffect>
              </div>
              <div className="patient-header-meta">
                <span>
                  <Icon name="user" size="xs" /> {member.relation}, {member.age} years
                </span>
                <span>
                  <Icon name="ruler" size="xs" /> BMI {member.bmi}
                </span>
                <span>
                  <Icon name="pill" size="xs" /> {Array.isArray(member.conditions) ? (member.conditions.join(', ') || 'None') : (typeof member.conditions === 'string' ? member.conditions : 'None')}
                </span>
                <span>
                  <Icon name="calendar" size="xs" /> Assessed {typeof member.assessed === 'string' ? member.assessed : (member.assessed ? String(member.assessed) : '—')}
                </span>
              </div>
            </div>
          </div>
          <div className="patient-header-right">
            <button className="btn btn-sm" onClick={() => navigate(ROUTES.education)}>
              <Icon name="book" size="sm" /> Education
            </button>
            <button className="btn btn-sm" onClick={() => navigate(ROUTES.generateReport)}>
              <Icon name="document" size="sm" /> Report
            </button>
          </div>
        </div>
      </div>

      <div className="risk-cards-grid stagger-children">
        {(Array.isArray(member.scores) ? member.scores : []).map((r) => (
          <div className="risk-card" key={r.label}>
            <div className={`risk-card-accent ${r.level}`}></div>
            <div className="risk-card-title">{r.label}</div>
            <div className="risk-card-score">
              {r.score}
              <span>%</span>
            </div>
            <RiskBadge level={r.level} />
            <div className="risk-card-bar">
              <RiskBar width={r.score} level={r.level} />
            </div>
            <div className="risk-card-trend">
              <TrendLine points={r.points} color={r.color} />
              {r.trendLabel}
            </div>
          </div>
        ))}
      </div>

      <Reveal className="ai-summary-card" delay={0.15}>
        <div className="ai-summary-label">
          <Icon name="sparkles" size="xs" />{' '}
          <TextScramble as="span" duration={0.9} speed={0.045}>
            AI Health Summary
          </TextScramble>
        </div>

        <p className="ai-summary-text" dangerouslySetInnerHTML={{ __html: member.summary }} />

        <div className="ai-summary-body">
          {/* Key Findings */}
          {member.findings?.length > 0 && (
            <div className="ai-summary-section">
              <div className="ai-summary-section-title">
                <Icon name="target" size="xs" /> Key Findings
              </div>
              <ul className="ai-summary-list">
                {member.findings.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Lifestyle & Action */}
          <div className="ai-summary-right">
            {member.lifestyle?.length > 0 && (
              <div className="ai-summary-section">
                <div className="ai-summary-section-title">
                  <Icon name="bolt" size="xs" /> Lifestyle Actions
                </div>
                <ul className="ai-summary-list ai-summary-list--action">
                  {member.lifestyle.map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              </div>
            )}

            {(member.checkupList?.length > 0 || member.recommendationList?.length > 0) && (
              <div className="ai-summary-section">
                <div className="ai-summary-section-title">
                  <Icon name="clipboard" size="xs" /> Action Checklist
                </div>
                <ul className="ai-summary-list ai-summary-list--check">
                  {member.checkupList?.map((c, i) => (
                    <li key={`c-${i}`}>{c}</li>
                  ))}
                  {member.recommendationList?.map((r, i) => (
                    <li key={`r-${i}`}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Reveal>

      <div className="assess-grid">
        <Reveal className="card card-lg">
          <SectionHeader
            title="What's Driving This Risk Score?"
            subtitle="Factors ranked by how much they affect the score"
          />
          <div className="xai-section">
            {(member.factors || []).map((f) => (
              <div className="xai-item" key={f.name}>
                <div className="xai-factor">
                  <div className="xai-factor-name">{f.name}</div>
                  <div className="xai-factor-value">{f.value}</div>
                </div>
                <div className="xai-impact-bar-container">
                  <div className="xai-impact-bar-bg">
                    <div className="xai-impact-bar" style={{ width: `${f.width}%`, background: f.gradient }}></div>
                  </div>
                </div>
                <div className="xai-impact-label">
                  <span className={`risk-badge ${f.impact}`}>{f.impactLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="card card-lg" delay={0.1}>
          <SectionHeader
            title="Suggested Check-ups"
            subtitle="Tests worth booking for a clearer health picture"
          />
          <div>
            {(member.checkups || []).map((inv) => (
              <div className="investigation-item" key={inv.name}>
                <div className="investigation-icon">
                  <Icon name={inv.icon} size="md" />
                </div>
                <div className="investigation-info">
                  <div className="investigation-name">{inv.name}</div>
                  <div className="investigation-rationale">{inv.rationale}</div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      {(member.warnings || []).length > 0 && (
        <Reveal className="card card-lg mb-24">
          <SectionHeader title="Health Alerts" subtitle="Things worth discussing with your doctor" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {member.warnings.map((w) => (
              <div className={`warning-card ${w.level}`} key={w.title}>
                <div className="warning-icon">
                  <Icon name={w.icon} size="md" />
                </div>
                <div className="warning-content">
                  <div className="warning-title">{w.title}</div>
                  <div className="warning-desc">{w.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      )}

      {(member.recommendations || []).length > 0 && (
        <Reveal className="card card-lg">
          <SectionHeader title="Doctor Recommendations" subtitle="Specialists worth seeing based on this assessment" />
          <div className="referral-cards">
            {member.recommendations.map((ref) => (
              <div className="referral-card" key={ref.specialty}>
                <div className="referral-icon">
                  <Icon name={ref.icon} size="lg" />
                </div>
                <div className="referral-specialty">{ref.specialty}</div>
                <div className="referral-reason">{ref.reason}</div>
                <div className="referral-meta">
                  <span className={`referral-priority ${ref.priorityClass}`}>{ref.priority}</span>
                  <span className="referral-timeline">{ref.timeline}</span>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      )}
    </>
  );
}
