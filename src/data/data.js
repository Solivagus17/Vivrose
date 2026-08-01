/* ================================================
   VivRose — Personal & Family Health Data
   One account. Your family's health, in one place.
   ================================================ */

export const USER = {
  name: 'Arjun Mehta',
  initials: 'AM',
  role: 'Family Health Manager',
  location: 'Ahmedabad, Gujarat',
  familySize: 5,
};

const AVATAR_HIGH = 'linear-gradient(135deg, #C43C3C, #E06060)';
const AVATAR_MOD = 'linear-gradient(135deg, #D49A2A, #E4B24F)';
const AVATAR_LOW = 'linear-gradient(135deg, #2E9E6A, #4FBF88)';

const HIGH = '#C43C3C';
const MOD = '#D49A2A';
const LOW = '#2E9E6A';

export const FAMILY_MEMBERS = [
  {
    id: 'arjun',
    initials: 'AM',
    name: 'Arjun Mehta',
    relation: 'Self',
    age: 38,
    sex: 'Male',
    avatar: AVATAR_LOW,
    level: 'low',
    risk: 'Low overall',
    status: 'All clear',
    lastAssessed: '2 days ago',
    assessed: 'July 29, 2026',
    location: 'Ahmedabad, Gujarat',
    bmi: '24.2',
    bmiClass: 'Normal',
    bp: '120/78 mmHg',
    hba1c: '5.4%',
    smoking: 'Non-smoker',
    conditions: 'None',
    medications: 'None',
    familyHistory: 'Diabetes (Father), Hypertension (Mother)',
    glucose: '92 mg/dL',
    cholesterol: '178 mg/dL',
    creatinine: '0.9 mg/dL',
    scores: [
      { label: 'Diabetes', score: 22, level: 'low', trend: 'flat', trendLabel: 'Stable', points: '2,10 10,8 18,9 26,8 34,9 38,8', color: LOW },
      { label: 'Hypertension', score: 18, level: 'low', trend: 'down', trendLabel: 'Improving', points: '2,12 10,11 18,10 26,9 34,8 38,7', color: LOW },
      { label: 'CVD', score: 14, level: 'low', trend: 'flat', trendLabel: 'Stable', points: '2,9 10,10 18,9 26,9 34,10 38,9', color: LOW },
      { label: 'Stroke', score: 11, level: 'low', trend: 'flat', trendLabel: 'Stable', points: '2,10 10,9 18,9 26,8 34,9 38,9', color: LOW },
    ],
    factors: [
      { name: 'Sedentary Work', value: 'Desk job — long hours sitting', width: 40, gradient: 'linear-gradient(90deg, #2E9E6A, #4FBF88)', impact: 'low', impactLabel: 'Low' },
      { name: 'Irregular Meal Timing', value: 'Frequent skipped breakfasts', width: 30, gradient: 'linear-gradient(90deg, #2E9E6A, #4FBF88)', impact: 'low', impactLabel: 'Low' },
    ],
    checkups: [
      { icon: 'vial', name: 'Full Lipid Profile', rationale: 'First baseline in a while — helps lock in a healthy reference range.' },
      { icon: 'droplet', name: 'Vitamin D + B12 Check', rationale: 'Common deficiency with desk jobs and low sun exposure.' },
    ],
    warnings: [
      { level: 'moderate', icon: 'bolt', title: 'Sitting for Long Periods', desc: '6+ hours seated daily raises metabolic risk. Try a short walk after every meal.' },
    ],
    recommendations: [],
    summary:
      'Arjun is in <strong>good overall health</strong>. All risk scores are comfortably low, helped by not smoking and staying active on weekends. His only watch-point is a <strong>sedentary desk routine</strong> and <strong>irregular meals</strong> — small habits that, fixed now, keep diabetes and heart risk low for decades.',
    reportSummary:
      'Arjun shows low risk across all tracked conditions (diabetes 22%, hypertension 18%, CVD 14%). Main areas to improve: daily movement and regular meal timing. No urgent action needed.',
    findings: [
      'HbA1c 5.4% — well within the healthy range',
      'Blood pressure 120/78 mmHg — normal',
      'BMI 24.2 — within healthy range',
      'Sedentary desk job with 6+ hours of sitting daily',
      'Irregular meal timing and occasional skipped breakfasts',
    ],
    checkupList: [
      'Full Lipid Profile — establish a baseline',
      'Vitamin D and B12 check — common with desk jobs',
    ],
    recommendationList: [],
    lifestyle: [
      'Add a 10-minute walk after lunch and dinner',
      'Keep consistent meal times, especially breakfast',
      'Aim for 150 minutes of moderate activity per week',
    ],
  },
  {
    id: 'kavya',
    initials: 'KM',
    name: 'Kavya Mehta',
    relation: 'Wife',
    age: 35,
    sex: 'Female',
    avatar: AVATAR_MOD,
    level: 'moderate',
    risk: 'Diabetes',
    status: 'Keep an eye on sugar',
    lastAssessed: '5 days ago',
    assessed: 'July 27, 2026',
    location: 'Ahmedabad, Gujarat',
    bmi: '27.4',
    bmiClass: 'Overweight',
    bp: '128/84 mmHg',
    hba1c: '5.9%',
    smoking: 'Non-smoker',
    conditions: 'Gestational diabetes (previous pregnancy)',
    medications: 'None',
    familyHistory: 'Diabetes (Mother)',
    glucose: '104 mg/dL',
    cholesterol: '196 mg/dL',
    creatinine: '0.8 mg/dL',
    scores: [
      { label: 'Diabetes', score: 46, level: 'moderate', trend: 'up', trendLabel: 'Rising', points: '2,10 10,9 18,11 26,11 34,12 38,13', color: MOD },
      { label: 'Hypertension', score: 24, level: 'low', trend: 'flat', trendLabel: 'Stable', points: '2,10 10,9 18,10 26,9 34,10 38,9', color: LOW },
      { label: 'CVD', score: 19, level: 'low', trend: 'flat', trendLabel: 'Stable', points: '2,9 10,10 18,9 26,10 34,9 38,9', color: LOW },
    ],
    factors: [
      { name: 'Gestational Diabetes History', value: 'Previous pregnancy — strong predictor', width: 70, gradient: 'linear-gradient(90deg, #D49A2A, #E4B24F)', impact: 'high', impactLabel: 'High' },
      { name: 'Overweight (BMI 27.4)', value: 'Above the healthy range', width: 50, gradient: 'linear-gradient(90deg, #D49A2A, #E4B24F)', impact: 'moderate', impactLabel: 'Moderate' },
      { name: 'Low Daily Activity', value: 'Mostly home-based routine', width: 40, gradient: 'linear-gradient(90deg, #D49A2A, #E4B24F)', impact: 'moderate', impactLabel: 'Moderate' },
    ],
    checkups: [
      { icon: 'droplet', name: 'Oral Glucose Tolerance Test', rationale: 'The gold standard after a history of gestational diabetes.' },
      { icon: 'vial', name: 'Lipid Profile + HbA1c Recheck', rationale: 'Track the rising trend seen over the past year.' },
    ],
    warnings: [
      { level: 'moderate', icon: 'bolt', title: 'Prediabetes Range', desc: 'HbA1c 5.9% sits just below the diabetes threshold. Early lifestyle changes now can reverse the trend.' },
    ],
    recommendations: [
      { icon: 'stethoscope', specialty: 'Dietitian', reason: 'A simple, sustainable meal plan can bring glucose back to normal without medication.', priority: 'MODERATE', priorityClass: 'moderate', timeline: 'Within 4 weeks' },
    ],
    summary:
      'Kavya shows a <strong>moderate risk for diabetes (46%)</strong>, driven mainly by her <strong>gestational diabetes history</strong> and <strong>weight (BMI 27.4)</strong>. Her HbA1c of 5.9% is in the pre-diabetes range but is reversible. A consultation with a <strong>dietitian</strong> and a modest activity increase now can push the score back to low.',
    reportSummary:
      'Kavya has moderate diabetes risk (46%) due to gestational diabetes history and being overweight. HbA1c 5.9% is in the pre-diabetes range. Diet and activity changes are recommended; no medication indicated yet.',
    findings: [
      'HbA1c 5.9% — pre-diabetes range, trending upward',
      'Gestational diabetes in a previous pregnancy',
      'BMI 27.4 — overweight range',
      'Blood pressure 128/84 mmHg — borderline normal',
    ],
    checkupList: [
      'Oral Glucose Tolerance Test (OGTT)',
      'Lipid profile and HbA1c recheck',
    ],
    recommendationList: [
      'Dietitian (Moderate Priority) — sustainable meal planning, within 4 weeks',
    ],
    lifestyle: [
      '30-minute daily walk — start with post-meal walks',
      'Swap refined carbs for whole grains and dal',
      'Include strength training twice a week',
    ],
  },
  {
    id: 'rajesh',
    initials: 'RM',
    name: 'Rajesh Mehta',
    relation: 'Father',
    age: 62,
    sex: 'Male',
    avatar: AVATAR_HIGH,
    level: 'high',
    risk: 'Diabetes, CVD',
    status: 'Needs attention',
    lastAssessed: 'Today',
    assessed: 'July 31, 2026',
    location: 'Ahmedabad, Gujarat',
    bmi: '32.0',
    bmiClass: 'Obese Class I',
    bp: '165/100 mmHg',
    hba1c: '8.4%',
    smoking: 'Active Smoker',
    conditions: 'Hypertension, Dyslipidemia',
    medications: 'Amlodipine 5mg OD, Atorvastatin 20mg HS',
    familyHistory: 'Diabetes (Brother), Hypertension (Father)',
    glucose: '168 mg/dL',
    cholesterol: '242 mg/dL',
    creatinine: '1.3 mg/dL',
    scores: [
      { label: 'Diabetes', score: 78, level: 'high', trend: 'up', trendLabel: 'Trending up', points: '2,12 10,10 18,14 26,8 34,6 38,4', color: HIGH },
      { label: 'Hypertension', score: 82, level: 'high', trend: 'up', trendLabel: 'Trending up', points: '2,10 10,8 18,12 26,6 34,4 38,3', color: HIGH },
      { label: 'CKD', score: 52, level: 'moderate', trend: 'flat', trendLabel: 'Stable', points: '2,8 10,10 18,8 26,9 34,7 38,8', color: MOD },
      { label: 'CVD', score: 71, level: 'high', trend: 'up', trendLabel: 'Trending up', points: '2,12 10,10 18,8 26,6 34,5 38,4', color: HIGH },
      { label: 'Stroke', score: 45, level: 'moderate', trend: 'flat', trendLabel: 'Stable', points: '2,10 10,8 18,10 26,8 34,9 38,8', color: MOD },
    ],
    factors: [
      { name: 'HbA1c', value: '8.4% — far above the 7% target', width: 92, gradient: 'linear-gradient(90deg, #C43C3C, #E06060)', impact: 'high', impactLabel: 'High' },
      { name: 'Blood Pressure', value: '165/100 mmHg — Stage 2 Hypertension', width: 88, gradient: 'linear-gradient(90deg, #C43C3C, #E06060)', impact: 'high', impactLabel: 'High' },
      { name: 'Smoking Status', value: 'Active smoker — major heart risk factor', width: 80, gradient: 'linear-gradient(90deg, #C43C3C, #E06060)', impact: 'high', impactLabel: 'High' },
      { name: 'BMI', value: '32.0 — Class I Obesity', width: 65, gradient: 'linear-gradient(90deg, #D49A2A, #E4B24F)', impact: 'moderate', impactLabel: 'Moderate' },
      { name: 'Family History', value: 'Diabetes (Brother), HTN (Father)', width: 55, gradient: 'linear-gradient(90deg, #D49A2A, #E4B24F)', impact: 'moderate', impactLabel: 'Moderate' },
      { name: 'Total Cholesterol', value: '242 mg/dL — elevated', width: 50, gradient: 'linear-gradient(90deg, #D49A2A, #E4B24F)', impact: 'moderate', impactLabel: 'Moderate' },
    ],
    checkups: [
      { icon: 'flask', name: 'eGFR (Kidney Function)', rationale: 'Essential given elevated creatinine (1.3) with diabetes and blood pressure risk.' },
      { icon: 'droplet', name: 'Urine Albumin-to-Creatinine Ratio', rationale: 'Screens for kidney damage — important with HbA1c 8.4% and high BP.' },
      { icon: 'vial', name: 'Complete Lipid Profile', rationale: 'Only total cholesterol is available; a full panel sharpens the heart risk picture.' },
      { icon: 'heart', name: 'ECG / Echocardiogram', rationale: 'Check the heart given the high CVD risk score (71%).' },
      { icon: 'eye', name: 'Eye Check (Fundoscopy)', rationale: 'Screen for diabetes- and blood-pressure-related eye damage.' },
    ],
    warnings: [
      { level: 'high', icon: 'warning', title: 'Poor Blood Sugar Control', desc: 'HbA1c 8.4% means sustained high blood sugar. Risk of complications rises sharply above 7%. An early doctor visit is advised.' },
      { level: 'high', icon: 'warning', title: 'High Heart Risk', desc: 'Smoking, weight, blood pressure, and cholesterol together put the heart at high risk. These are all actionable.' },
      { level: 'moderate', icon: 'bolt', title: 'Possible Kidney Strain', desc: 'Creatinine 1.3 with diabetes and high BP suggests early kidney involvement. Book eGFR and urine tests.' },
      { level: 'moderate', icon: 'bolt', title: 'Blood Pressure Too High', desc: '165/100 on current medication suggests the dose may need review. Target is below 130/80.' },
    ],
    recommendations: [
      { icon: 'stethoscope', specialty: 'Endocrinologist', reason: 'Uncontrolled diabetes (HbA1c 8.4%). Needs a complete glycemic plan — possibly insulin.', priority: 'HIGH PRIORITY', priorityClass: 'high', timeline: 'Within 2 weeks' },
      { icon: 'heart', specialty: 'Cardiologist', reason: 'High 10-year heart risk with several combined risk factors. Heart check-up and lipid optimization recommended.', priority: 'HIGH PRIORITY', priorityClass: 'high', timeline: 'Within 2 weeks' },
      { icon: 'dna', specialty: 'Nephrologist', reason: 'Elevated creatinine with diabetes and high BP. Early kidney care can slow progression.', priority: 'MODERATE', priorityClass: 'moderate', timeline: 'Within 4 weeks' },
    ],
    summary:
      'Rajesh&apos;s profile shows <strong>high risk for diabetes (78%)</strong> and <strong>cardiovascular disease (71%)</strong>, driven mainly by <strong>blood sugar control (HbA1c 8.4%)</strong>, <strong>blood pressure (165/100)</strong>, <strong>smoking</strong>, and <strong>weight (BMI 32)</strong>. The encouraging part: every one of these is actionable. The next steps are clear — see an endocrinologist and cardiologist, quit smoking, and bring both sugar and blood pressure under control.',
    reportSummary:
      'Rajesh shows high risk for diabetes (78%) and cardiovascular disease (71%) driven by poor glycemic control (HbA1c 8.4%), high blood pressure (165/100 mmHg), smoking, and obesity (BMI 32). Kidney strain is possible (creatinine 1.3). Urgent specialist review and lifestyle change are recommended.',
    findings: [
      'HbA1c 8.4% — sustained high blood sugar, high impact on diabetes and heart risk',
      'Blood pressure 165/100 mmHg (Stage 2) — not controlled on current medication',
      'Active smoking — a major independent heart risk factor',
      'BMI 32 (Class I Obesity) — contributes to insulin resistance',
      'Creatinine 1.3 mg/dL — borderline elevation suggesting early kidney involvement',
      'Total cholesterol 242 mg/dL — full lipid panel needed',
    ],
    checkupList: [
      'eGFR — essential for kidney staging given elevated creatinine',
      'Urine Albumin-to-Creatinine Ratio — screen for kidney damage',
      'Complete Lipid Profile — complete heart risk picture',
      'ECG / Echocardiogram — heart evaluation given high CVD risk',
      'Eye Check (Fundoscopy) — diabetes and BP related eye screening',
    ],
    recommendationList: [
      'Endocrinologist (High Priority) — glycemic management, within 2 weeks',
      'Cardiologist (High Priority) — heart risk evaluation, within 2 weeks',
      'Nephrologist (Moderate Priority) — kidney function assessment, within 4 weeks',
    ],
    lifestyle: [
      'Quit smoking — structured cessation program with doctor support',
      'Dietary change — DASH-style diet, less sugar and salt',
      'Physical activity — start with 30 minutes of daily walking',
      'Weight management — target 5–10% loss over 6 months',
      'Stress management — daily breathing or light yoga',
    ],
  },
  {
    id: 'sunita',
    initials: 'SM',
    name: 'Sunita Mehta',
    relation: 'Mother',
    age: 58,
    sex: 'Female',
    avatar: AVATAR_MOD,
    level: 'moderate',
    risk: 'Hypertension',
    status: 'Monitor blood pressure',
    lastAssessed: '1 week ago',
    assessed: 'July 25, 2026',
    location: 'Ahmedabad, Gujarat',
    bmi: '28.6',
    bmiClass: 'Overweight',
    bp: '148/92 mmHg',
    hba1c: '6.2%',
    smoking: 'Former Smoker',
    conditions: 'None diagnosed',
    medications: 'None',
    familyHistory: 'Hypertension (Parents)',
    glucose: '112 mg/dL',
    cholesterol: '208 mg/dL',
    creatinine: '0.9 mg/dL',
    scores: [
      { label: 'Hypertension', score: 64, level: 'moderate', trend: 'up', trendLabel: 'Rising', points: '2,9 10,10 18,12 26,11 34,12 38,13', color: MOD },
      { label: 'Diabetes', score: 41, level: 'moderate', trend: 'flat', trendLabel: 'Stable', points: '2,10 10,10 18,11 26,10 34,11 38,11', color: MOD },
      { label: 'CVD', score: 34, level: 'low', trend: 'flat', trendLabel: 'Stable', points: '2,9 10,10 18,10 26,9 34,10 38,9', color: LOW },
    ],
    factors: [
      { name: 'Blood Pressure', value: '148/92 mmHg — Stage 1 Hypertension', width: 72, gradient: 'linear-gradient(90deg, #D49A2A, #E4B24F)', impact: 'high', impactLabel: 'High' },
      { name: 'Weight (BMI 28.6)', value: 'Overweight range', width: 52, gradient: 'linear-gradient(90deg, #D49A2A, #E4B24F)', impact: 'moderate', impactLabel: 'Moderate' },
      { name: 'Family History', value: 'Both parents had high BP', width: 55, gradient: 'linear-gradient(90deg, #D49A2A, #E4B24F)', impact: 'moderate', impactLabel: 'Moderate' },
    ],
    checkups: [
      { icon: 'heart', name: 'Home BP Monitoring', rationale: 'Track morning and evening readings for a week to confirm the trend.' },
      { icon: 'vial', name: 'Lipid Profile', rationale: 'Cholesterol 208 is borderline — a full panel clarifies heart risk.' },
    ],
    warnings: [
      { level: 'moderate', icon: 'bolt', title: 'Blood Pressure Rising', desc: '148/92 is Stage 1 hypertension. Home monitoring plus salt reduction now can often avoid medication.' },
    ],
    recommendations: [
      { icon: 'heart', specialty: 'Cardiologist', reason: 'A baseline cardiac evaluation given rising blood pressure and family history.', priority: 'MODERATE', priorityClass: 'moderate', timeline: 'Within 4 weeks' },
    ],
    summary:
      'Sunita&apos;s main watch-point is <strong>blood pressure (148/92 mmHg)</strong> — now in Stage 1 hypertension and trending up. Family history and weight amplify it. She has <strong>moderate diabetes risk (41%)</strong> as well. With home BP monitoring, salt reduction, and a gentle walking routine, medication can likely be avoided or delayed.',
    reportSummary:
      'Sunita shows moderate hypertension risk (64%) with BP at 148/92 mmHg and a rising trend. Diabetes risk is moderate (41%). Family history and weight contribute. Lifestyle measures and a baseline cardiac check are recommended.',
    findings: [
      'Blood pressure 148/92 mmHg — Stage 1 hypertension, rising trend',
      'HbA1c 6.2% — slightly above normal, pre-diabetes range',
      'BMI 28.6 — overweight range',
      'Family history of hypertension in both parents',
    ],
    checkupList: [
      'Home blood pressure monitoring — one week of readings',
      'Full lipid profile',
    ],
    recommendationList: [
      'Cardiologist (Moderate Priority) — baseline cardiac evaluation, within 4 weeks',
    ],
    lifestyle: [
      'Reduce salt to under 5g per day',
      'Daily 30-minute walk — monitor BP weekly',
      'Include more vegetables, dal, and whole grains',
      'Practice deep breathing before bed to lower stress',
    ],
  },
  {
    id: 'aarav',
    initials: 'AA',
    name: 'Aarav Mehta',
    relation: 'Son',
    age: 10,
    sex: 'Male',
    avatar: AVATAR_LOW,
    level: 'low',
    risk: 'Low overall',
    status: 'On track',
    lastAssessed: '2 weeks ago',
    assessed: 'July 18, 2026',
    location: 'Ahmedabad, Gujarat',
    bmi: '18.0',
    bmiClass: 'Healthy (age-adjusted)',
    bp: '104/66 mmHg',
    hba1c: '5.0%',
    smoking: 'N/A',
    conditions: 'None',
    medications: 'None',
    familyHistory: 'Diabetes (Grandparents)',
    glucose: '86 mg/dL',
    cholesterol: '—',
    creatinine: '—',
    scores: [
      { label: 'Obesity Risk', score: 12, level: 'low', trend: 'flat', trendLabel: 'Stable', points: '2,10 10,10 18,9 26,10 34,9 38,10', color: LOW },
      { label: 'Diabetes Risk', score: 8, level: 'low', trend: 'flat', trendLabel: 'Stable', points: '2,9 10,10 18,9 26,9 34,9 38,9', color: LOW },
      { label: 'CVD Risk', score: 5, level: 'low', trend: 'flat', trendLabel: 'Stable', points: '2,10 10,9 18,10 26,9 34,10 38,9', color: LOW },
    ],
    factors: [
      { name: 'Screen Time', value: 'High — tablet and TV after school', width: 45, gradient: 'linear-gradient(90deg, #2E9E6A, #4FBF88)', impact: 'low', impactLabel: 'Low' },
      { name: 'Sugary Drinks', value: 'Occasional soft drinks', width: 30, gradient: 'linear-gradient(90deg, #2E9E6A, #4FBF88)', impact: 'low', impactLabel: 'Low' },
    ],
    checkups: [
      { icon: 'calendar', name: 'Annual Growth & Nutrition Check', rationale: 'Keeps height, weight, and eating habits on a healthy track.' },
      { icon: 'eye', name: 'Vision Screening', rationale: 'Screen time makes an annual eye check worthwhile at this age.' },
    ],
    warnings: [],
    recommendations: [],
    summary:
      'Aarav is <strong>growing well</strong> with low risk across the board. The main habits to watch are <strong>screen time</strong> and <strong>sugary drinks</strong> — the classic early seeds of childhood lifestyle risk. Building outdoor play and good eating habits now sets him up for a healthy adulthood.',
    reportSummary:
      'Aarav is in excellent health with low risk across all categories. Focus areas: reduce screen time and sugary drinks, keep up outdoor play. Annual growth and vision checks recommended.',
    findings: [
      'BMI 18.0 — healthy for age',
      'HbA1c 5.0% — normal',
      'Blood pressure 104/66 mmHg — normal for age',
      'High screen time and occasional sugary drinks',
    ],
    checkupList: [
      'Annual growth and nutrition check',
      'Vision screening',
    ],
    recommendationList: [],
    lifestyle: [
      'Encourage 1 hour of outdoor play daily',
      'Limit sugary drinks to special occasions',
      'Keep screen time under 1 hour after school',
      'Serve fruits and nuts for snacks',
    ],
  },
];

export const DASH_STATS = [
  {
    icon: 'users',
    value: '5',
    label: 'Family Members',
    change: 'All in one account',
    changeClass: 'up',
    iconBg: 'var(--teal-100)',
    iconColor: 'var(--teal-700)',
  },
  {
    icon: 'warning',
    value: '1',
    label: 'Health Alerts',
    change: 'Father needs attention',
    changeClass: 'down',
    iconBg: 'var(--risk-high-bg)',
    iconColor: 'var(--risk-high)',
  },
  {
    icon: 'sparkle',
    value: '4',
    label: 'Assessments This Month',
    change: '1 new today',
    changeClass: 'up',
    iconBg: 'var(--blue-100)',
    iconColor: 'var(--blue-600)',
  },
  {
    icon: 'flask',
    value: '3',
    label: 'Check-ups Due',
    change: '2 bookings suggested',
    changeClass: 'up',
    iconBg: 'var(--risk-mod-bg)',
    iconColor: 'var(--risk-mod)',
  },
];

export const ALERTS = [
  {
    icon: 'warning',
    wrap: 'danger',
    title: 'Rajesh Mehta — Blood Sugar Critical',
    desc: 'HbA1c at 8.4%. Book a doctor visit to review glycemic management.',
    time: '2h ago',
  },
  {
    icon: 'warning',
    wrap: 'warning',
    title: 'Sunita Mehta — Blood Pressure High',
    desc: 'BP 148/92 mmHg and rising. Start home monitoring this week.',
    time: '5h ago',
  },
  {
    icon: 'flask',
    wrap: 'info',
    title: '3 Check-ups Due This Month',
    desc: 'Lipid panel, kidney function, and eye checks recommended for your family.',
    time: 'Today',
  },
  {
    icon: 'clipboard',
    wrap: 'info',
    title: 'Aarav — Annual Screening Due',
    desc: 'Growth and vision screening overdue for your son.',
    time: 'Yesterday',
  },
];

export const ANALYTICS_OVERVIEW = [
  {
    icon: 'warning',
    value: '1',
    label: 'High Risk',
    change: '20% of family',
    changeClass: 'down',
    iconBg: 'var(--risk-high-bg)',
    iconColor: 'var(--risk-high)',
  },
  {
    icon: 'bolt',
    value: '2',
    label: 'Moderate Risk',
    change: '40% of family',
    changeClass: 'up',
    iconBg: 'var(--risk-mod-bg)',
    iconColor: 'var(--risk-mod)',
  },
  {
    icon: 'check',
    value: '2',
    label: 'Low Risk',
    change: '40% of family',
    changeClass: 'up',
    iconBg: 'var(--risk-low-bg)',
    iconColor: 'var(--risk-low)',
  },
];

export const ANALYTICS_CHART = [
  { label: 'Diabetes', low: 40, mod: 40, high: 20 },
  { label: 'HTN', low: 40, mod: 40, high: 20 },
  { label: 'CKD', low: 80, mod: 20, high: 0 },
  { label: 'CVD', low: 60, mod: 20, high: 20 },
  { label: 'Stroke', low: 80, mod: 20, high: 0 },
];

export const TOP_CONTRIBUTORS = [
  { name: 'Low Physical Activity', value: '3 of 5 members', width: 75 },
  { name: 'Overweight / Obesity', value: '2 of 5 members', width: 60 },
  { name: 'High Blood Pressure', value: '2 of 5 members', width: 50 },
  { name: 'Poor Blood Sugar Control', value: '1 of 5 members', width: 30 },
  { name: 'Smoking / Tobacco', value: '1 of 5 members', width: 30 },
];

const DEFAULT_SCORES = [
  { label: 'Diabetes', score: 0, level: 'low', trend: 'flat', trendLabel: 'Awaiting assessment', points: '2,10 10,10 18,10 26,10 34,10 38,10', color: LOW },
  { label: 'Hypertension', score: 0, level: 'low', trend: 'flat', trendLabel: 'Awaiting assessment', points: '2,10 10,10 18,10 26,10 34,10 38,10', color: LOW },
  { label: 'CVD', score: 0, level: 'low', trend: 'flat', trendLabel: 'Awaiting assessment', points: '2,10 10,10 18,10 26,10 34,10 38,10', color: LOW },
  { label: 'Stroke', score: 0, level: 'low', trend: 'flat', trendLabel: 'Awaiting assessment', points: '2,10 10,10 18,10 26,10 34,10 38,10', color: LOW },
];

export function createFamilyMember(input) {
  const initials =
    input.name
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'FM';
  return {
    id: `mem-${Date.now()}`,
    initials,
    name: input.name,
    relation: input.relation || 'Family Member',
    age: input.age || 30,
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
    summary: `<strong>${input.name}</strong> has been added and is <strong>awaiting their first AI health assessment</strong>. Run a New Assessment to generate risk scores, check-up suggestions, and doctor recommendations.`,
    reportSummary: `${input.name} has been added to the family. No assessment data is available yet — complete an assessment to generate the health report.`,
    findings: ['No assessment data yet — awaiting the first health assessment'],
    checkupList: ['Complete health check-up — establish a baseline'],
    recommendationList: [],
    lifestyle: ['Complete a New Assessment to receive a personalized lifestyle plan'],
  };
}
