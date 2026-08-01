/* ================================================
   VivRose — Personal & Family Health Utilities
   ================================================ */

export const AVATAR_LOW = 'linear-gradient(135deg, #2E9E6A, #4FBF88)';
export const DEFAULT_LOCATION = 'India';

export const FAMILY_MEMBERS = [];
export const DASH_STATS = [];
export const ALERTS = [];
export const ANALYTICS_OVERVIEW = [];
export const ANALYTICS_CHART = [];
export const TOP_CONTRIBUTORS = [];

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
