import { apiPost, apiPut, apiDelete } from './api.js';
import { createApiStore } from './storeUtils.js';

export const CHECKUPS_STORAGE_KEY = 'vivrose.checkups.v1';

export const CHECKUP_STATUS = ['Scheduled', 'Completed', 'Cancelled'];

export const SEED_CHECKUPS = [];

const store = createApiStore({ seed: [], listPath: '/api/checkups', bulkPath: '/api/checkups/bulk' });

export function loadCheckups() {
  return store.load();
}

export function saveCheckups(checkups) {
  store.save(checkups);
}

export async function addCheckup(checkup) {
  try {
    const created = await apiPost('/api/checkups', checkup);
    const next = [created, ...loadCheckups().filter((c) => c.id !== created.id)];
    store.setCache(next);
    return created;
  } catch {
    const local = { id: `chk-${Date.now()}`, ...checkup };
    const next = [local, ...loadCheckups()];
    store.setCache(next);
    return local;
  }
}

export async function updateCheckup(id, patch) {
  const current = loadCheckups();
  const next = current.map((c) => (c.id === id ? { ...c, ...patch } : c));
  store.setCache(next);
  try {
    const updated = await apiPut(`/api/checkups/${id}`, patch);
    if (updated && updated.id) {
      const synced = loadCheckups().map((c) => (c.id === id ? updated : c));
      store.setCache(synced);
    }
  } catch {
    store.save(next);
  }
  return next;
}

export async function deleteCheckup(id) {
  const next = loadCheckups().filter((c) => c.id !== id);
  store.setCache(next);
  try {
    await apiDelete(`/api/checkups/${id}`);
  } catch {
    store.save(next);
  }
  return next;
}

export const refreshCheckups = () => store.refresh();
