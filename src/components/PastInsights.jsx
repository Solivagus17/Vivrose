import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import InsightView from './InsightView.jsx';
import { useMember } from '../memberContext.jsx';
import { ROUTES } from '../routes.js';
import { loadInsights } from '../insightsStore.js';

function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso || '';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function riskLabel(member) {
  const level = member.level || 'low';
  if (level === 'high') return 'High risk';
  if (level === 'moderate') return 'Moderate risk';
  return 'Low risk';
}

export default function PastInsights() {
  const navigate = useNavigate();
  const { members, member, setMember } = useMember();
  const [insights] = useState(loadInsights);
  const [forId, setForId] = useState(member.id);
  const [selectedId, setSelectedId] = useState(null);

  const forMember = members.find((m) => m.id === forId) || member;

  const list = useMemo(
    () =>
      insights
        .filter((s) => s.memberId === forId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [insights, forId]
  );

  const selected = insights.find((s) => s.id === selectedId) || list[0] || null;

  const selectMember = (id) => {
    setForId(id);
    setMember(id);
    setSelectedId(null);
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">AI Insights</div>
        <div className="page-subtitle">Past AI assessments and health insights for each family member.</div>
      </div>

      <div className="assess-for">
        <div className="assess-for-head">
          <span className="assess-for-label">Showing insights for</span>
          <button className="btn btn-primary btn-sm" onClick={() => navigate(ROUTES.assessment)}>
            <Icon name="sparkle" size="sm" />
            AI Assessment
          </button>
        </div>
        <div className="assess-for-chips">
          {members.map((m) => (
            <span
              key={m.id}
              className={`assess-chip${forId === m.id ? ' active' : ''}`}
              onClick={() => selectMember(m.id)}
            >
              {m.initials} · {m.name.split(' ')[0]}
            </span>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="reports-empty">
          <div className="reports-empty-icon">
            <Icon name="brain" size="lg" />
          </div>
          <div className="reports-empty-title">No insights for {forMember.name.split(' ')[0]} yet</div>
          <div className="reports-empty-desc">
            Run an AI assessment for {forMember.name.split(' ')[0]} to generate risk scores and health insights.
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate(ROUTES.assessment)}>
            <Icon name="sparkle" size="sm" />
            Run AI Assessment
          </button>
        </div>
      ) : (
        <>
          <div className="past-insights-bar">
            {list.map((s) => (
              <span
                key={s.id}
                className={`past-chip${selected?.id === s.id ? ' active' : ''}`}
                onClick={() => setSelectedId(s.id)}
              >
                <Icon name="calendar" size="xs" />
                {formatDate(s.createdAt)}
                <span className={`risk-badge ${s.member.level || 'low'}`}>{riskLabel(s.member)}</span>
              </span>
            ))}
          </div>
          {selected && <InsightView key={selected.id} data={selected.member} />}
        </>
      )}
    </>
  );
}
