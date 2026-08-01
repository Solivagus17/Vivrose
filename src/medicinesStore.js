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

export const SEED_MEDICINES = [
  {
    id: 'med-seed-1',
    name: 'Amlodipine',
    purpose: 'Blood pressure control',
    dosage: '5 mg',
    frequency: 'Once Daily (OD)',
    timing: 'Morning, after breakfast',
    prescribedBy: 'Dr. Anil Patel',
    startDate: '2026-06-15',
    endDate: '',
    status: 'Active',
    remark: 'Review dose at next visit; target BP below 130/80.',
  },
  {
    id: 'med-seed-2',
    name: 'Atorvastatin',
    purpose: 'Cholesterol management',
    dosage: '20 mg',
    frequency: 'Once Daily (OD)',
    timing: 'Night, after dinner',
    prescribedBy: 'Dr. Meera Shah',
    startDate: '2026-06-15',
    endDate: '',
    status: 'Active',
    remark: 'Take at the same time every night.',
  },
  {
    id: 'med-seed-3',
    name: 'Metformin',
    purpose: 'Blood sugar control',
    dosage: '500 mg',
    frequency: 'Twice Daily (BD)',
    timing: 'After breakfast and dinner',
    prescribedBy: 'Dr. Meera Shah',
    startDate: '2026-05-01',
    endDate: '2026-07-31',
    status: 'Completed',
    remark: 'Course completed — HbA1c improved to 5.9%.',
  },
];

const store = createApiStore({ seed: SEED_MEDICINES, listPath: '/api/medicines', bulkPath: '/api/medicines/bulk' });

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
