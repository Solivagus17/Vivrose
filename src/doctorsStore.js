import { apiPost, apiPut, apiDelete } from './api.js';
import { createApiStore } from './storeUtils.js';

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

const store = createApiStore({ seed: [], listPath: '/api/doctors' });

export function loadDoctors() {
  return store.load();
}

export function saveDoctors(doctors) {
  store.save(doctors);
}

export async function addDoctor(doctor) {
  try {
    const created = await apiPost('/api/doctors', doctor);
    const next = [created, ...loadDoctors().filter((d) => d.id !== created.id)];
    store.setCache(next);
    return created;
  } catch {
    const local = { id: `doc-${Date.now()}`, ...doctor };
    const next = [local, ...loadDoctors()];
    store.setCache(next);
    return local;
  }
}

export async function updateDoctor(id, patch) {
  const current = loadDoctors();
  const next = current.map((d) => (d.id === id ? { ...d, ...patch } : d));
  store.setCache(next);
  try {
    const updated = await apiPut(`/api/doctors/${id}`, patch);
    if (updated && updated.id) {
      const synced = loadDoctors().map((d) => (d.id === id ? updated : d));
      store.setCache(synced);
    }
  } catch {
    store.save(next);
  }
  return next;
}

export async function deleteDoctor(id) {
  const next = loadDoctors().filter((d) => d.id !== id);
  store.setCache(next);
  try {
    await apiDelete(`/api/doctors/${id}`);
  } catch {
    store.save(next);
  }
  return next;
}

export const refreshDoctors = () => store.refresh();
