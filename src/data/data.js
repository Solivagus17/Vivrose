/* ================================================
   VivRose — Personal & Family Health Data
   One account. Your family's health, in one place.
   ================================================ */

export const USER = {
  name: 'Family Health Manager',
  initials: 'FM',
  role: 'Family Health Manager',
  location: 'India',
  familySize: 0,
};

const AVATAR_HIGH = 'linear-gradient(135deg, #C43C3C, #E06060)';
const AVATAR_MOD = 'linear-gradient(135deg, #D49A2A, #E4B24F)';
const AVATAR_LOW = 'linear-gradient(135deg, #2E9E6A, #4FBF88)';

const HIGH = '#C43C3C';
const MOD = '#D49A2A';
const LOW = '#2E9E6A';

export const FAMILY_MEMBERS = [];

export const DASH_STATS = [];
export const ALERTS = [];
export const ANALYTICS_OVERVIEW = [];
export const ANALYTICS_CHART = [];
export const TOP_CONTRIBUTORS = [];

const DEFAULT_SCORES = [
  { label: 'Diabetes', score: 0, level: 'low', trend: 'flat', trendLabel: 'Awaiting assessment', points: '2,10 10,10 18,10 26,10 34,10 38,10', color: LOW },
  { label: 'Hypertension', score: 0, level: 'low', trend: 'flat', trendLabel: 'Awaiting assessment', points: '2,10 10,10 18,10 26,10 34,10 38,10', color: LOW },
  { label: 'CVD', score: 0, level: 'low', trend: 'flat', trendLabel: 'Awaiting assessment', points: '2,10 10,10 18,10 26,10 34,10 38,10', color: LOW },
  { label: 'Stroke', score: 0, level: 'low', trend: 'flat', trendLabel: 'Awaiting assessment', points: '2,10 10,10 18,10 26,10 34,10 38,10', color: LOW },
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
  const age = input.birthDate ? calcAge(input.birthDate) : input.age;
  return {
    id: `mem-${Date.now()}`,
    initials,
    name: input.name,
    relation: input.relation || 'Family Member',
    age: age || 30,
    birthDate: input.birthDate || '',
    birthLocation: input.birthLocation || '',
    sex: input.sex || 'Male',
    avatar: AVATAR_LOW,
    level: 'low',
    risk: 'Low overall',
    status: 'Needs first assessment',
    lastAssessed: 'Never',
    assessed: '—',
    location: input.location || USER.location,
    bmi: '—',
    bmiClass: '—',
    bp: '—',
    hba1c: '—',
    smoking: 'Non-smoker',
    conditions: 'None',
    medications: 'None',
    familyHistory: 'None reported',
    glucose: '—',
    cholesterol: '—',
    creatinine: '—',
    scores: DEFAULT_SCORES,
    factors: [],
    checkups: [
      { icon: 'calendar', name: 'Complete Health Check-up', rationale: 'A new family member — an initial check-up builds a health baseline.' },
    ],
    warnings: [],
    recommendations: [],
    summary: `<strong>${input.name}</strong> has been added and is <strong>awaiting their first AI health assessment</strong>. Run an AI Assessment to generate risk scores, check-up suggestions, and doctor recommendations.`,
    reportSummary: `${input.name} has been added to the family. No assessment data is available yet — complete an assessment to generate the health report.`,
    findings: ['No assessment data yet — awaiting the first health assessment'],
    checkupList: ['Complete health check-up — establish a baseline'],
    recommendationList: [],
    lifestyle: ['Complete an AI Assessment to receive a personalized lifestyle plan'],
  };
}
