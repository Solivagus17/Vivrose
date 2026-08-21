/* ─────────────────────────────────────────────────────────────
   ShushrutAI — Personal & Family Health Utilities
   ───────────────────────────────────────────────────────────── */

export const AVATAR_LOW = 'linear-gradient(135deg, #2E9E6A, #4FBF88)';
export const DEFAULT_LOCATION = 'India';

export const FAMILY_MEMBERS = [];
export const DASH_STATS = [];
export const ALERTS = [];

export const ANALYTICS_OVERVIEW = [
  {
    label: 'High Risk Members',
    value: '0',
    change: '0% of family',
    icon: 'alertCircle',
    iconBg: 'rgba(196, 60, 60, 0.1)',
    iconColor: '#C43C3C',
    changeClass: 'down',
  },
  {
    label: 'Moderate Risk Members',
    value: '0',
    change: '0% of family',
    icon: 'trend',
    iconBg: 'rgba(212, 154, 42, 0.1)',
    iconColor: '#D49A2A',
    changeClass: 'neutral',
  },
  {
    label: 'Low Risk Members',
    value: '0',
    change: '0% of family',
    icon: 'heart',
    iconBg: 'rgba(46, 158, 106, 0.1)',
    iconColor: '#2E9E6A',
    changeClass: 'up',
  },
  {
    label: 'Total Assessed',
    value: '0',
    change: '0% of family',
    icon: 'users',
    iconBg: 'rgba(92, 42, 158, 0.1)',
    iconColor: '#5C2A9E',
    changeClass: 'up',
  },
];

export const ANALYTICS_CHART = [
  { label: 'Diabetes', low: 60, mod: 25, high: 15 },
  { label: 'Hypertension', low: 40, mod: 35, high: 25 },
  { label: 'CKD', low: 70, mod: 20, high: 10 },
  { label: 'CVD', low: 55, mod: 30, high: 15 },
  { label: 'Stroke', low: 75, mod: 15, high: 10 },
];

export const TOP_CONTRIBUTORS = [
  { name: 'Elevated Blood Pressure', value: 'Systolic ≥ 130 or Diastolic ≥ 80', width: 70 },
  { name: 'Elevated HbA1c / Fasting Glucose', value: 'HbA1c ≥ 6.5% or Glucose ≥ 126 mg/dL', width: 55 },
  { name: 'Elevated BMI / Overweight', value: 'BMI ≥ 25.0 kg/m²', width: 65 },
  { name: 'Family History of Chronic Disease', value: 'First-degree genetic predisposition', width: 80 },
  { name: 'Smoking / Tobacco Use', value: 'Active or past tobacco use', width: 40 },
];

export function calcAge(birthDate) {
  if (!birthDate) return null;
  const d = new Date(birthDate);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

export function createFamilyMember(input) {
  const initials =
    (input.name || '')
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'FM';
  const age = input.birthDate ? calcAge(input.birthDate) : (input.age || null);
  return {
    id: input.id || `mem-${Date.now()}`,
    initials,
    name: input.name || '',
    relation: input.relation || 'Family Member',
    age: age,
    birthDate: input.birthDate || '',
    birthLocation: input.birthLocation || '',
    sex: input.sex || 'Male',
    avatar: AVATAR_LOW,
    level: 'low',
    risk: 'Low overall',
    status: 'Needs first assessment',
    lastAssessed: 'Never',
    assessed: null,
    location: input.location || DEFAULT_LOCATION,
    bmi: '—',
    bmiClass: '—',
    bp: '—',
    hba1c: '—',
    smoking: 'Non-smoker',
    conditions: [],
    medications: [],
    familyHistory: [],
    glucose: '—',
    cholesterol: '—',
    creatinine: '—',
    scores: [],
    factors: [],
    checkups: [],
    warnings: [],
    recommendations: [],
    summary: `<strong>${input.name}</strong> has been added and is <strong>awaiting their first AI health assessment</strong>.`,
    reportSummary: `${input.name} has been added to the family. Complete an assessment to generate a health report.`,
    findings: [],
    checkupList: [],
    recommendationList: [],
    lifestyle: [],
  };
}
