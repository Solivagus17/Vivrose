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

export function addReport(record) {
  const next = [{ id: `rep-${Date.now()}`, ...record }, ...loadReports()];
  saveReports(next);
  return next;
}

export function updateReport(id, record) {
  const next = loadReports().map((r) => (r.id === id ? { ...r, ...record } : r));
  saveReports(next);
  return next;
}

export const refreshReports = () => store.refresh();
