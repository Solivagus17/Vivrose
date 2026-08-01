import { createApiStore } from './storeUtils.js';

export const DOCTORS_STORAGE_KEY = 'vivrose.doctors.v1';

export const SPECIALTIES = [
  'General Physician',
  'Cardiologist',
  'Endocrinologist',
  'Dermatologist',
  'ENT Specialist',
  'Gastroenterologist',
  'Gynecologist',
  'Nephrologist',
  'Neurologist',
  'Nutritionist / Dietitian',
  'Oncologist',
  'Ophthalmologist',
  'Orthopedist',
  'Pediatrician',
  'Physiotherapist',
  'Psychiatrist',
  'Pulmonologist',
  'Urologist',
  'Dentist',
  'Other',
];

export const SEED_DOCTORS = [];

const store = createApiStore({ seed: [], listPath: '/api/doctors', bulkPath: '/api/doctors/bulk' });

export function loadDoctors() {
  return store.load();
}

export function saveDoctors(doctors) {
  store.save(doctors);
}

export function addDoctor(doctor) {
  const next = [{ id: `doc-${Date.now()}`, ...doctor }, ...loadDoctors()];
  saveDoctors(next);
  return next;
}

export function updateDoctor(id, doctor) {
  const next = loadDoctors().map((d) => (d.id === id ? { ...d, ...doctor } : d));
  saveDoctors(next);
  return next;
}

export const refreshDoctors = () => store.refresh();
