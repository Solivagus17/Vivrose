import { apiPost, apiPut, apiDelete, apiUpload } from './api.js';
import { createApiStore } from './storeUtils.js';

export const REPORTS_STORAGE_KEY = 'vivrose.medical-reports.v1';

export const REPORT_TYPES = [
  'Blood Test',
  'Urine Test',
  'Imaging / Radiology',
  'ECG / Cardiac',
  'Pathology / Biopsy',
  'Prescription',
  'Specialist Consultation',
  'Discharge Summary',
  'Vaccination Record',
  'Other',
];

export const SEED_REPORTS = [];

const store = createApiStore({ seed: [], listPath: '/api/reports', bulkPath: '/api/reports/bulk' });

export function loadReports() {
  return store.load();
}

export function saveReports(records) {
  store.save(records);
}

export async function addReport(record) {
  try {
    let created;
    if (record instanceof FormData) {
      created = await apiUpload('/api/reports/upload', record);
    } else {
      created = await apiPost('/api/reports', record);
    }
    const next = [created, ...loadReports().filter((r) => r.id !== created.id)];
    store.setCache(next);
    return created;
  } catch {
    const local = { id: `rep-${Date.now()}`, ...record };
    const next = [local, ...loadReports()];
    store.setCache(next);
    return local;
  }
}

export async function updateReport(id, patch) {
  const current = loadReports();
  const next = current.map((r) => (r.id === id ? { ...r, ...patch } : r));
  store.setCache(next);
  try {
    const updated = await apiPut(`/api/reports/${id}`, patch);
    if (updated && updated.id) {
      const synced = loadReports().map((r) => (r.id === id ? updated : r));
      store.setCache(synced);
    }
  } catch {
    store.save(next);
  }
  return next;
}

export async function deleteReport(id) {
  const next = loadReports().filter((r) => r.id !== id);
  store.setCache(next);
  try {
    await apiDelete(`/api/reports/${id}`);
  } catch {
    store.save(next);
  }
  return next;
}

export const refreshReports = () => store.refresh();
