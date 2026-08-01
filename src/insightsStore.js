import { apiGet, apiPost } from './api.js';

let cache = [];
let loaded = false;

async function refresh() {
  if (typeof window === 'undefined') return cache;
  try {
    const list = await apiGet('/api/insights');
    cache = Array.isArray(list) ? list : [];
    loaded = true;
  } catch {
    /* offline — keep cache */
  }
  return cache;
}

export function loadInsights() {
  if (typeof window !== 'undefined' && !loaded) refresh();
  return cache;
}

export function saveInsights() {
  /* insights are created server-side or posted individually */
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
  cache = [snapshot, ...cache];
  if (typeof window !== 'undefined') apiPost('/api/insights', snapshot).catch(() => {});
  return snapshot;
}

export function refreshInsights() {
  return refresh();
}
