import { apiPost, apiPut, apiDelete } from './api.js';
import { createFamilyMember } from './data/data.js';
import { createApiStore } from './storeUtils.js';

const store = createApiStore({ seed: [], listPath: '/api/members', bulkPath: '/api/members/bulk' });

export function loadMembers() {
  return store.load();
}

export function saveMembers(members) {
  store.save(members);
}

export async function addMember(profile) {
  const localMember = createFamilyMember(profile);
  try {
    const created = await apiPost('/api/members', profile);
    const result = created && created.id ? created : localMember;
    const next = [result, ...loadMembers().filter((m) => m.id !== result.id)];
    store.setCache(next);
    return result;
  } catch {
    const next = [localMember, ...loadMembers()];
    store.save(next);
    return localMember;
  }
}

export async function updateMember(id, patch) {
  const current = loadMembers();
  const next = current.map((m) => (m.id === id ? { ...m, ...patch } : m));
  store.setCache(next);
  try {
    const updated = await apiPut(`/api/members/${id}`, patch);
    if (updated && updated.id) {
      const synced = loadMembers().map((m) => (m.id === id ? updated : m));
      store.setCache(synced);
    }
  } catch {
    store.save(next);
  }
  return next;
}

export async function removeMember(id) {
  const next = loadMembers().filter((m) => m.id !== id);
  store.setCache(next);
  try {
    await apiDelete(`/api/members/${id}`);
  } catch {
    store.save(next);
  }
  return next;
}

export function refreshMembers() {
  return store.refresh();
}

export { createFamilyMember };
