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

export function addMedicine(medicine) {
  const next = [{ id: `med-${Date.now()}`, ...medicine }, ...loadMedicines()];
  saveMedicines(next);
  return next;
}

export function updateMedicine(id, medicine) {
  const next = loadMedicines().map((m) => (m.id === id ? { ...m, ...medicine } : m));
  saveMedicines(next);
  return next;
}

export const refreshMedicines = () => store.refresh();
