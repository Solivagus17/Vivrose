import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import InsightView from './InsightView.jsx';
import { useMember } from '../memberContext.jsx';
import { ROUTES } from '../routes.js';
import { apiGet } from '../api.js';

function formatDate(iso) {
  if (!iso) return 'Recent';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso || 'Recent';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function riskLabel(snapshot) {
  const level = snapshot?.level || 'low';
  if (level === 'high') return 'High risk';
  if (level === 'moderate') return 'Moderate risk';
  return 'Low risk';
}

export default function PastInsights() {
  const navigate = useNavigate();
  const { members, member, setMember } = useMember();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const activeMemberId = member?.id || (members.length ? members[0].id : '');

  /* Fetch insights from the backend */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    apiGet('/api/insights')
      .then((list) => {
        if (!cancelled) {
          setInsights(Array.isArray(list) ? list : []);
        }
      })
      .catch((err) => {
        console.error('[PastInsights] Failed to fetch insights:', err);
        if (!cancelled) {
          setError(err?.message || 'Failed to load insights');
          setInsights([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [activeMemberId]);

  /* Filter and sort by selected member */
  const list = useMemo(() => {
    if (!activeMemberId) return insights;
    return insights
      .filter((s) => s.memberId === activeMemberId)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [insights, activeMemberId]);

  const selected = list.find((s) => s.id === selectedId) || list[0] || null;
  const rawData = selected?.member || selected?.snapshot || null;
  const snapshotData = typeof rawData === 'string' ? (() => { try { return JSON.parse(rawData); } catch { return null; } })() : rawData;

  const selectMember = (id) => {
    setMember(id);
    setSelectedId(null);
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">Past AI Insights</div>
        <div className="page-subtitle">Review past AI health assessments and reports for each family member.</div>
      </div>

      <div className="assess-for" style={{ marginBottom: 24 }}>
        <div className="assess-for-head">
          <span className="assess-for-label">Showing insights for</span>
          <button className="btn btn-primary btn-sm" onClick={() => navigate(ROUTES.assessment)}>
            <Icon name="sparkle" size="sm" />
            Run AI Assessment
          </button>
        </div>
        {members.length > 0 && (
          <div className="assess-for-chips">
            {members.map((m) => (
              <span
                key={m.id}
                className={`assess-chip${activeMemberId === m.id ? ' active' : ''}`}
                onClick={() => selectMember(m.id)}
              >
                {m.initials} · {(m.name || 'Member').split(' ')[0]}
              </span>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>
          Loading insights...
        </div>
      ) : error ? (
        <div className="reports-empty">
          <div className="reports-empty-icon">
            <Icon name="warning" size="lg" />
          </div>
          <div className="reports-empty-title">Could not load insights</div>
          <div className="reports-empty-desc">{error}</div>
          <button className="btn btn-primary btn-sm" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      ) : list.length === 0 ? (
        <div className="reports-empty">
          <div className="reports-empty-icon">
            <Icon name="brain" size="lg" />
          </div>
          <div className="reports-empty-title">
            No insights {activeMemberId ? `for ${(members.find(m => m.id === activeMemberId)?.name || 'this member').split(' ')[0]}` : ''} yet
          </div>
          <div className="reports-empty-desc">
            Run an AI assessment to generate risk scores and personalized health insights.
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate(ROUTES.assessment)}>
            <Icon name="sparkle" size="sm" />
            Run AI Assessment
          </button>
        </div>
      ) : (
        <>
          <div className="past-insights-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {list.map((s) => (
              <span
                key={s.id}
                className={`past-chip${selected?.id === s.id ? ' active' : ''}`}
                onClick={() => setSelectedId(s.id)}
                style={{ cursor: 'pointer' }}
              >
                <Icon name="calendar" size="xs" />
                {formatDate(s.createdAt)}
                <span className={`risk-badge ${(s.member || s.snapshot)?.level || 'low'}`}>
                  {riskLabel(s.member || s.snapshot)}
                </span>
              </span>
            ))}
          </div>
          {snapshotData ? (
            <InsightView key={selected?.id} data={snapshotData} />
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>
              Select an assessment to view its details.
            </div>
          )}
        </>
      )}
    </>
  );
}
