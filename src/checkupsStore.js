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

export function addCheckup(checkup) {
  const next = [{ id: `chk-${Date.now()}`, ...checkup }, ...loadCheckups()];
  saveCheckups(next);
  return next;
}

export function updateCheckup(id, checkup) {
  const next = loadCheckups().map((c) => (c.id === id ? { ...c, ...checkup } : c));
  saveCheckups(next);
  return next;
}

export const refreshCheckups = () => store.refresh();
