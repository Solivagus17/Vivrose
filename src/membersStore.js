import React from 'react';
import { createFamilyMember } from './data/data.js';
import { apiPost, apiPut, apiDelete } from './api.js';
import { createApiStore } from './storeUtils.js';

const store = createApiStore({ seed: [], listPath: '/api/members', bulkPath: '/api/members/bulk' });

export function loadMembers() {
  return store.load();
}

export async function addMember(profile) {
  // 1. Optimistic: build local copy immediately so UI is instant
  const localMember = createFamilyMember(profile);
  const optimistic = [localMember, ...loadMembers()];
  store.setCache(optimistic);

  // 2. Background sync with backend (fire-and-forget style, no blocking)
  apiPost('/api/members', profile)
    .then((created) => {
      if (created && created.id) {
        const synced = loadMembers().map((m) =>
          m.id === localMember.id ? created : m
        );
        store.setCache(synced);
      }
    })
    .catch(() => {}); // already cached locally, will sync on next refresh

  return localMember;
}

export async function updateMember(id, patch) {
  // Optimistic update
  const next = loadMembers().map((m) => (m.id === id ? { ...m, ...patch } : m));
  store.setCache(next);

  // Background sync
  apiPut(`/api/members/${id}`, patch)
    .then((updated) => {
      if (updated && updated.id) {
        const synced = loadMembers().map((m) => (m.id === id ? updated : m));
        store.setCache(synced);
      }
    })
    .catch(() => {});

  return next;
}

export async function removeMember(id) {
  // Optimistic remove
  const next = loadMembers().filter((m) => m.id !== id);
  store.setCache(next);

  // Background sync
  apiDelete(`/api/members/${id}`).catch(() => {});

  return next;
}

export function refreshMembers() {
  return store.refresh();
}

export function saveMembers(members) {
  store.setCache(members);
}

export { createFamilyMember };
