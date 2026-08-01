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

export const SEED_DOCTORS = [
  {
    id: 'doc-seed-1',
    name: 'Dr. Meera Shah',
    specialty: 'Endocrinologist',
    hospital: 'Apollo Hospital, Ahmedabad',
    phone: '+91 98765 00011',
    email: 'meera.shah@apollohospitals.in',
    city: 'Ahmedabad',
    notes: 'Manages father\u2019s diabetes and cholesterol care.',
  },
  {
    id: 'doc-seed-2',
    name: 'Dr. Anil Patel',
    specialty: 'Cardiologist',
    hospital: 'Care Clinic, Navrangpura',
    phone: '+91 98765 00022',
    email: 'anil.patel@careclinic.in',
    city: 'Ahmedabad',
    notes: 'Monitors mother\u2019s blood pressure and heart health.',
  },
  {
    id: 'doc-seed-3',
    name: 'Dr. Nidhi Desai',
    specialty: 'Gynecologist',
    hospital: 'Shalby Hospital, Ahmedabad',
    phone: '+91 98765 00033',
    email: 'nidhi.desai@shalby.org',
    city: 'Ahmedabad',
    notes: 'Kavya\u2019s gestational diabetes follow-up.',
  },
];

const store = createApiStore({ seed: SEED_DOCTORS, listPath: '/api/doctors', bulkPath: '/api/doctors/bulk' });

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
