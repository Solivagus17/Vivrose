import { apiPost, apiPut, apiDelete } from './api.js';
import { createApiStore } from './storeUtils.js';

export const MEDICINES_STORAGE_KEY = 'vivrose.medicines.v1';

export const MEDICINE_STATUS = ['Active', 'Completed', 'Discontinued'];

export const FREQUENCIES = [
  'Once Daily (OD)',
  'Twice Daily (BD)',
  'Three Times Daily (TDS)',
  'Four Times Daily (QID)',
  'Every Other Day',
  'Once Weekly',
  'As Needed (PRN)',
];

export const SEED_MEDICINES = [];

const store = createApiStore({ seed: [], listPath: '/api/medicines', bulkPath: '/api/medicines/bulk' });

export function loadMedicines() {
  return store.load();
}

export function saveMedicines(medicines) {
  store.save(medicines);
}

export async function addMedicine(medicine) {
  try {
    const created = await apiPost('/api/medicines', medicine);
    const next = [created, ...loadMedicines().filter((m) => m.id !== created.id)];
    store.setCache(next);
    return created;
  } catch {
    const local = { id: `med-${Date.now()}`, ...medicine };
    const next = [local, ...loadMedicines()];
    store.setCache(next);
    return local;
  }
}

export async function updateMedicine(id, patch) {
  const current = loadMedicines();
  const next = current.map((m) => (m.id === id ? { ...m, ...patch } : m));
  store.setCache(next);
  try {
    const updated = await apiPut(`/api/medicines/${id}`, patch);
    if (updated && updated.id) {
      const synced = loadMedicines().map((m) => (m.id === id ? updated : m));
      store.setCache(synced);
    }
  } catch {
    store.save(next);
  }
  return next;
}

export async function deleteMedicine(id) {
  const next = loadMedicines().filter((m) => m.id !== id);
  store.setCache(next);
  try {
    await apiDelete(`/api/medicines/${id}`);
  } catch {
    store.save(next);
  }
  return next;
}

export const refreshMedicines = () => store.refresh();
