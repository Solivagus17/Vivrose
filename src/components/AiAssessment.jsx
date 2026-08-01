import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import InsightView from './InsightView.jsx';
import { useMember } from '../memberContext.jsx';
import { ROUTES } from '../routes.js';

export default function AiAssessment() {
  const navigate = useNavigate();
  const { members, member, setMember } = useMember();

  const forMember = member || (members.length ? members[0] : null);
  const hasData = Boolean(
    forMember &&
    ((forMember.scores && forMember.scores.length > 0) ||
     (forMember.summary && !forMember.summary.includes('awaiting their first AI health assessment')))
  );

  return (
    <>
      <div className="page-header">
        <div className="page-title">AI Health Insights</div>
        <div className="page-subtitle">Personalized risk analysis, clinical findings, and recommendations.</div>
      </div>

      <div className="assess-for" style={{ marginBottom: 24 }}>
        <div className="assess-for-head">
          <span className="assess-for-label">Viewing insights for</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(ROUTES.pastInsights)}>
              <Icon name="brain" size="sm" />
              Past Insights
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate(ROUTES.assessment)}>
              <Icon name="sparkle" size="sm" />
              Run AI Assessment
            </button>
          </div>
        </div>
        {members.length > 0 && (
          <div className="assess-for-chips">
            {members.map((m) => (
              <span
                key={m.id}
                className={`assess-chip${forMember?.id === m.id ? ' active' : ''}`}
                onClick={() => setMember(m.id)}
              >
                {m.initials} · {(m.name || 'Member').split(' ')[0]}
              </span>
            ))}
          </div>
        )}
      </div>

      {!forMember ? (
        <div className="reports-empty">
          <div className="reports-empty-icon">
            <Icon name="user" size="lg" />
          </div>
          <div className="reports-empty-title">No family members found</div>
          <div className="reports-empty-desc">
            Add a family member to your profile to generate and view AI health insights.
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate(ROUTES.family)}>
            <Icon name="userPlus" size="sm" />
            Add Family Member
          </button>
        </div>
      ) : !hasData ? (
        <div className="reports-empty">
          <div className="reports-empty-icon">
            <Icon name="sparkle" size="lg" />
          </div>
          <div className="reports-empty-title">Awaiting AI Assessment for {(forMember.name || 'Member').split(' ')[0]}</div>
          <div className="reports-empty-desc">
            No assessment results generated yet for {(forMember.name || 'this member')}. Run a quick AI Assessment to compute risk scores and personalized health recommendations.
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate(ROUTES.assessment)}>
            <Icon name="sparkle" size="sm" />
            Run AI Assessment
          </button>
        </div>
      ) : (
        <InsightView key={forMember.id} data={forMember} />
      )}
    </>
  );
}
