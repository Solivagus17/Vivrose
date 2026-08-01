import { FAMILY_MEMBERS } from './data/data.js';

export const INSIGHTS_STORAGE_KEY = 'vivrose.insights.v1';

function toIso(dateString) {
  const d = new Date(dateString);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export const SEED_INSIGHTS = FAMILY_MEMBERS.filter((m) => toIso(m.assessed))
  .map((m) => ({
    id: `ins-seed-${m.id}`,
    memberId: m.id,
    memberName: m.name,
    memberInitials: m.initials,
    createdAt: toIso(m.assessed),
    member: { ...m },
  }))
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

export function loadInsights() {
  if (typeof window === 'undefined') return SEED_INSIGHTS;
  try {
    const raw = window.localStorage.getItem(INSIGHTS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return SEED_INSIGHTS;
}

export function saveInsights(insights) {
  try {
    window.localStorage.setItem(INSIGHTS_STORAGE_KEY, JSON.stringify(insights));
  } catch {
    /* ignore */
  }
}

export function addInsight(memberId, memberSnapshot) {
  const snapshot = {
    id: `ins-${Date.now()}`,
    memberId,
    memberName: memberSnapshot.name || '',
    memberInitials: memberSnapshot.initials || '',
    createdAt: new Date().toISOString(),
    member: { ...memberSnapshot },
  };
  const next = [snapshot, ...loadInsights()];
  saveInsights(next);
  return snapshot;
}
