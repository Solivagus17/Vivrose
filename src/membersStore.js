import { FAMILY_MEMBERS, createFamilyMember } from './data/data.js';
import { createApiStore } from './storeUtils.js';

const store = createApiStore({ seed: FAMILY_MEMBERS, listPath: '/api/members', bulkPath: '/api/members/bulk' });

export function loadMembers() {
  return store.load();
}

export function saveMembers(members) {
  store.save(members);
}

export function addMember(profile) {
  const newMember = createFamilyMember(profile);
  const next = [newMember, ...loadMembers()];
  saveMembers(next);
  return newMember;
}

export function updateMember(id, patch) {
  const next = loadMembers().map((m) => (m.id === id ? { ...m, ...patch } : m));
  saveMembers(next);
  return next;
}

export function removeMember(id) {
  const next = loadMembers().filter((m) => m.id !== id);
  saveMembers(next);
  return next;
}

export function refreshMembers() {
  return store.refresh();
}

export { createFamilyMember };
