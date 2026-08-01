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

/** Safely render an item that might be a string OR an object from the LLM. */
function renderListItem(item, i) {
  if (typeof item === 'string') return <li key={i}>{item}</li>;
  if (item && typeof item === 'object') {
    const text = item.name || item.specialty || item.title || item.reason || JSON.stringify(item);
    const sub = item.rationale || item.reason || item.desc || item.timeline || '';
    return (
      <li key={i}>
        <strong>{text}</strong>
        {sub ? ` — ${sub}` : ''}
      </li>
    );
  }
  return <li key={i}>{String(item)}</li>;
}

class InsightErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>
            Unable to render this insight
          </div>
          <p>The assessment data may be in an unexpected format. Try running a new AI Assessment.</p>
          <pre style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 12 }}>
            {String(this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function InsightViewInner({ data }) {
  const navigate = useNavigate();
  const member = data || {};

  return (
    <>
      <div className="patient-header-card">
        <div className="patient-header-content">
          <div className="patient-header-left">
            <div className="patient-header-avatar">{member.initials || 'FM'}</div>
            <div>
              <div className="patient-header-name">
                <TextEffect per="char" preset="blur" as="span" speedReveal={1.3}>
                  {member.name || 'Family Member'}
                </TextEffect>
              </div>
              <div className="patient-header-meta">
                <span>
                  <Icon name="user" size="xs" /> {member.relation || 'Member'}, {member.age ?? '—'} years
                </span>
                <span>
                  <Icon name="ruler" size="xs" /> BMI {member.bmi || '—'}
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

      {(member.llmError || member.llm_error) && (
        <div className="warning-card high" style={{ marginBottom: 20, padding: 16 }}>
          <div className="warning-icon">
            <Icon name="alert" size="md" />
          </div>
          <div className="warning-content">
            <div className="warning-title" style={{ fontWeight: 700, color: 'var(--red-600)' }}>
              LLM API Service Notification
            </div>
            <div className="warning-desc" style={{ fontSize: '0.875rem', marginTop: 4, color: 'var(--gray-700)' }}>
              {member.llmError || member.llm_error}
            </div>
          </div>
        </div>
      )}

      <div className="risk-cards-grid stagger-children">
        {(Array.isArray(member.scores) ? member.scores : []).map((r, idx) => (
          <div className="risk-card" key={r.label || idx}>
            <div className={`risk-card-accent ${r.level || 'low'}`}></div>
            <div className="risk-card-title">{r.label || 'Risk'}</div>
            <div className="risk-card-score">
              {r.score ?? 0}
              <span>%</span>
            </div>
            <RiskBadge level={r.level || 'low'} />
            <div className="risk-card-bar">
              <RiskBar width={r.score ?? 0} level={r.level || 'low'} />
            </div>
            <div className="risk-card-trend">
              <TrendLine points={r.points || '2,10 10,10 18,10 26,10 34,10 38,10'} color={r.color || '#94a3b8'} />
              {r.trendLabel || ''}
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

        <p className="ai-summary-text" dangerouslySetInnerHTML={{ __html: member.summary ? String(member.summary) : '<em>No AI health summary generated yet. Run an assessment to generate clinical insights.</em>' }} />

        <div className="ai-summary-body">
          {/* Key Findings */}
          {Array.isArray(member.findings) && member.findings.length > 0 && (
            <div className="ai-summary-section">
              <div className="ai-summary-section-title">
                <Icon name="target" size="xs" /> Key Findings
              </div>
              <ul className="ai-summary-list">
                {member.findings.map((f, i) => renderListItem(f, i))}
              </ul>
            </div>
          )}

          {/* Lifestyle & Action */}
          <div className="ai-summary-right">
            {Array.isArray(member.lifestyle) && member.lifestyle.length > 0 && (
              <div className="ai-summary-section">
                <div className="ai-summary-section-title">
                  <Icon name="bolt" size="xs" /> Lifestyle Actions
                </div>
                <ul className="ai-summary-list ai-summary-list--action">
                  {member.lifestyle.map((l, i) => renderListItem(l, i))}
                </ul>
              </div>
            )}

            {(
              (Array.isArray(member.checkupList) && member.checkupList.length > 0) ||
              (Array.isArray(member.recommendationList) && member.recommendationList.length > 0)
            ) && (
              <div className="ai-summary-section">
                <div className="ai-summary-section-title">
                  <Icon name="clipboard" size="xs" /> Action Checklist
                </div>
                <ul className="ai-summary-list ai-summary-list--check">
                  {(member.checkupList || []).map((c, i) => renderListItem(c, `c-${i}`))}
                  {(member.recommendationList || []).map((r, i) => renderListItem(r, `r-${i}`))}
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
            {(Array.isArray(member.factors) ? member.factors : []).map((f, idx) => (
              <div className="xai-item" key={f.name || idx}>
                <div className="xai-factor">
                  <div className="xai-factor-name">{f.name || 'Factor'}</div>
                  <div className="xai-factor-value">{f.value || ''}</div>
                </div>
                <div className="xai-impact-bar-container">
                  <div className="xai-impact-bar-bg">
                    <div className="xai-impact-bar" style={{ width: `${f.width || 0}%`, background: f.gradient || 'var(--gray-300)' }}></div>
                  </div>
                </div>
                <div className="xai-impact-label">
                  <span className={`risk-badge ${f.impact || 'low'}`}>{f.impactLabel || 'Low'}</span>
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
            {(Array.isArray(member.checkups) ? member.checkups : []).map((inv, idx) => (
              <div className="investigation-item" key={inv.name || idx}>
                <div className="investigation-icon">
                  <Icon name={inv.icon || 'clipboard'} size="md" />
                </div>
                <div className="investigation-info">
                  <div className="investigation-name">{inv.name || 'Check-up'}</div>
                  <div className="investigation-rationale">{inv.rationale || ''}</div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      {Array.isArray(member.warnings) && member.warnings.length > 0 && (
        <Reveal className="card card-lg mb-24">
          <SectionHeader title="Health Alerts" subtitle="Things worth discussing with your doctor" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {member.warnings.map((w, idx) => (
              <div className={`warning-card ${w.level || 'low'}`} key={w.title || idx}>
                <div className="warning-icon">
                  <Icon name={w.icon || 'alert'} size="md" />
                </div>
                <div className="warning-content">
                  <div className="warning-title">{w.title || 'Alert'}</div>
                  <div className="warning-desc">{w.desc || ''}</div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      )}

      {Array.isArray(member.recommendations) && member.recommendations.length > 0 && (
        <Reveal className="card card-lg">
          <SectionHeader title="Doctor Recommendations" subtitle="Specialists worth seeing based on this assessment" />
          <div className="referral-cards">
            {member.recommendations.map((ref, idx) => (
              <div className="referral-card" key={ref.specialty || idx}>
                <div className="referral-icon">
                  <Icon name={ref.icon || 'stethoscope'} size="lg" />
                </div>
                <div className="referral-specialty">{ref.specialty || 'Specialist'}</div>
                <div className="referral-reason">{ref.reason || ''}</div>
                <div className="referral-meta">
                  <span className={`referral-priority ${ref.priorityClass || 'low'}`}>{ref.priority || 'normal'}</span>
                  <span className="referral-timeline">{ref.timeline || ''}</span>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      )}
    </>
  );
}

export default function InsightView({ data }) {
  return (
    <InsightErrorBoundary>
      <InsightViewInner data={data} />
    </InsightErrorBoundary>
  );
}

