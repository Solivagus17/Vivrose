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

export const SEED_REPORTS = [
  {
    id: 'rep-seed-1',
    fileName: 'rajesh-followup-blood-2026-07-28.pdf',
    fileSize: '284 KB',
    type: 'Blood Test',
    date: '2026-07-28',
    hospital: 'Apollo Hospital, Ahmedabad',
    doctor: 'Dr. Meera Shah',
    purpose: 'Follow-up review for HbA1c and cholesterol',
    remark: 'HbA1c 8.4%, total cholesterol 242 mg/dL. Medication dose under review.',
  },
  {
    id: 'rep-seed-2',
    fileName: 'sunita-bp-checkup-2026-07-30.pdf',
    fileSize: '152 KB',
    type: 'ECG / Cardiac',
    date: '2026-07-30',
    hospital: 'Care Clinic, Navrangpura',
    doctor: 'Dr. Anil Patel',
    purpose: 'Rising blood pressure — baseline ECG',
    remark: 'BP 148/92 mmHg. ECG normal. Home BP monitoring advised.',
  },
  {
    id: 'rep-seed-3',
    fileName: 'kavya-ogtt-result-2026-07-26.pdf',
    fileSize: '198 KB',
    type: 'Blood Test',
    date: '2026-07-26',
    hospital: 'Shalby Hospital, Ahmedabad',
    doctor: 'Dr. Nidhi Desai',
    purpose: 'Gestational diabetes follow-up',
    remark: 'Oral glucose tolerance within normal limits.',
  },
];

const store = createApiStore({ seed: SEED_REPORTS, listPath: '/api/reports', bulkPath: '/api/reports/bulk' });

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
