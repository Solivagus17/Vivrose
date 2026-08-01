export const CHECKUPS_STORAGE_KEY = 'vivrose.checkups.v1';

export const CHECKUP_STATUS = ['Scheduled', 'Completed', 'Cancelled'];

export const SEED_CHECKUPS = [
  {
    id: 'chk-seed-1',
    doctorId: 'doc-seed-1',
    doctorName: 'Dr. Meera Shah',
    purpose: 'Diabetes follow-up — HbA1c & lipid review',
    date: '2026-08-14',
    time: '10:30',
    location: 'Apollo Hospital, Ahmedabad',
    notes: 'Bring latest HbA1c and lipid reports.',
    status: 'Scheduled',
  },
  {
    id: 'chk-seed-2',
    doctorId: 'doc-seed-2',
    doctorName: 'Dr. Anil Patel',
    purpose: 'Blood pressure review',
    date: '2026-08-18',
    time: '17:00',
    location: 'Care Clinic, Navrangpura',
    notes: 'Bring home BP readings for the past week.',
    status: 'Scheduled',
  },
  {
    id: 'chk-seed-3',
    doctorId: 'doc-seed-3',
    doctorName: 'Dr. Nidhi Desai',
    purpose: 'OGTT recheck',
    date: '2026-09-02',
    time: '09:15',
    location: 'Shalby Hospital, Ahmedabad',
    notes: 'Fast since midnight before the test.',
    status: 'Scheduled',
  },
];

export function loadCheckups() {
  if (typeof window === 'undefined') return SEED_CHECKUPS;
  try {
    const raw = window.localStorage.getItem(CHECKUPS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return SEED_CHECKUPS;
}

export function saveCheckups(checkups) {
  try {
    window.localStorage.setItem(CHECKUPS_STORAGE_KEY, JSON.stringify(checkups));
  } catch {
    /* ignore */
  }
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
