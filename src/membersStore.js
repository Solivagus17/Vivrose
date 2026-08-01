import { createFamilyMember } from './data/data.js';
import { apiPost, apiPut, apiDelete } from './api.js';
import { createApiStore } from './storeUtils.js';

const store = createApiStore({ seed: [], listPath: '/api/members' });

export function loadMembers() {
  return store.load();
}

export async function addMember(profile) {
  const localMember = createFamilyMember(profile);
  const optimistic = [localMember, ...loadMembers()];
  store.setCache(optimistic);

  try {
    const created = await apiPost('/api/members', localMember);
    if (created && created.id) {
      const synced = loadMembers().map((m) =>
        m.id === localMember.id ? created : m
      );
      store.setCache(synced);
      return created;
    }
  } catch (err) {
    console.warn('Backend sync failed for addMember, keeping local member:', err);
  }

  return localMember;
}

export async function updateMember(id, patch) {
  const next = loadMembers().map((m) => (m.id === id ? { ...m, ...patch } : m));
  store.setCache(next);

  try {
    const updated = await apiPut(`/api/members/${id}`, patch);
    if (updated && updated.id) {
      const synced = loadMembers().map((m) => (m.id === id ? updated : m));
      store.setCache(synced);
      return synced;
    }
  } catch (err) {
    console.warn('Backend sync failed for updateMember:', err);
  }

  return next;
}

export async function removeMember(id) {
  const next = loadMembers().filter((m) => m.id !== id);
  store.setCache(next);

  try {
    await apiDelete(`/api/members/${id}`);
  } catch (err) {
    console.warn('Backend sync failed for removeMember:', err);
  }

  return next;
}

export function refreshMembers() {
  return store.refresh();
}

export function saveMembers(members) {
  store.save(members);
}

export { createFamilyMember };
