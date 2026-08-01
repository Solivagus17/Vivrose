import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import InsightView from './InsightView.jsx';
import { useMember } from '../memberContext.jsx';
import { ROUTES } from '../routes.js';
import { apiGet } from '../api.js';
import { loadInsights } from '../insightsStore.js';

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
  const [insights, setInsights] = useState(() => loadInsights() || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const activeMemberId = member?.id || (members.length ? members[0].id : '');

  /* Fetch insights from the backend and merge with local store */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    apiGet('/api/insights')
      .then((list) => {
        if (!cancelled) {
          const serverList = Array.isArray(list) ? list : [];
          const localList = loadInsights() || [];
          const map = new Map();
          [...localList, ...serverList].forEach((item) => {
            if (item && item.id) map.set(item.id, item);
          });
          setInsights(Array.from(map.values()));
        }
      })
      .catch((err) => {
        console.warn('[PastInsights] Failed to fetch server insights, using local cache:', err);
        if (!cancelled) {
          setInsights(loadInsights() || []);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [activeMemberId]);


  /* Filter and sort by selected member */
  const activeMemberObj = members.find((m) => m.id === activeMemberId);
  const activeName = activeMemberObj?.name?.trim().toLowerCase();

  const list = useMemo(() => {
    if (!activeMemberId) return insights;
    return insights
      .filter((s) => {
        if (!s) return false;
        const mId = s.memberId || s.member_id || s.member?.id || s.id;
        if (mId === activeMemberId) return true;
        const mName = (s.memberName || s.member_name || s.member?.name || s.name || '').trim().toLowerCase();
        if (activeName && mName && activeName === mName) return true;
        return false;
      })
      .sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0));
  }, [insights, activeMemberId, activeName]);

  const selected = list.find((s) => s.id === selectedId) || list[0] || null;
  const rawData = selected?.member || selected?.snapshot || selected?.data || (selected?.scores ? selected : null);
  const snapshotData = typeof rawData === 'string' ? (() => { try { return JSON.parse(rawData); } catch { return selected; } })() : (rawData || selected);


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
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(ROUTES.aiAssistant)}>
              <Icon name="sparkles" size="sm" />
              View LLM Logs
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
