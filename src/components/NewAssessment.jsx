import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import { useMember } from '../memberContext.jsx';
import { ROUTES } from '../routes.js';

const STEP_LABELS = ['Demographics', 'Lifestyle', 'Symptoms', 'History', 'Vitals', 'Labs'];

const CONDITIONS = ['Hypertension', 'Pre-Diabetes', 'Diabetes', 'Heart Disease', 'Kidney Disease', 'Dyslipidemia', 'Stroke', 'COPD'];
const FAMILY = ['Diabetes (Father)', 'Hypertension (Mother)', 'Heart Disease', 'Stroke', 'Kidney Disease', 'Cancer'];

const LOADING_STEPS = [
  { progress: 20, text: 'Analyzing demographics and lifestyle...' },
  { progress: 40, text: 'Processing vital signs and lab results...' },
  { progress: 60, text: 'Running predictive risk models...' },
  { progress: 80, text: 'Preparing health recommendations...' },
  { progress: 95, text: 'Compiling the AI health report...' },
  { progress: 100, text: 'Assessment complete!' },
];

function numOf(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : undefined;
}

function Segmented({ options, active, onChange, size = '' }) {
  return (
    <div className="segmented" style={size === 'small' ? { flexWrap: 'nowrap' } : undefined}>
      {options.map((opt) => (
        <span
          key={opt}
          className={`segmented-btn${active === opt ? ' active' : ''}`}
          onClick={() => onChange(opt)}
        >
          {opt}
        </span>
      ))}
    </div>
  );
}

function ToggleTag({ label, selected, onToggle }) {
  return (
    <span
      className={`tag${selected ? ' selected' : ''}`}
      onClick={onToggle}
      style={{ padding: '8px 16px', fontSize: '0.8125rem' }}
    >
      {selected && <Icon name="check" size="xs" />}
      {label}
    </span>
  );
}

export default function NewAssessment() {
  const navigate = useNavigate();
  const { members, member, setMember } = useMember();
  const [forId, setForId] = useState(member.id);
  const forMember = members.find((m) => m.id === forId) || member;
  const [step, setStep] = useState(1);
  const [phase, setPhase] = useState('form');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [conditions, setConditions] = useState(['Hypertension', 'Dyslipidemia']);
  const [family, setFamily] = useState(['Diabetes (Father)', 'Hypertension (Mother)']);
  const [stress, setStress] = useState('Moderate');
  const [freqUrination, setFreqUrination] = useState('No');
  const [thirst, setThirst] = useState('No');
  const [weightLoss, setWeightLoss] = useState('No');
  const [blurredVision, setBlurredVision] = useState('No');
  const [chestPain, setChestPain] = useState('No');
  const [sob, setSob] = useState('No');
  const [fatigue, setFatigue] = useState('None');

  const [bpSys, bpDia] = (forMember.bp.replace('mmHg', '').trim().split('/').map((s) => s.trim()) || []);

  useEffect(() => {
    if (phase === 'loading') {
      const timers = [];
      LOADING_STEPS.forEach((s, i) => {
        timers.push(
          setTimeout(() => {
            setProgress(s.progress);
            setStatus(s.text);
            if (i === LOADING_STEPS.length - 1) {
              timers.push(
                setTimeout(() => {
                  setMember(forId);
                  navigate(ROUTES.insights);
                  setPhase('form');
                  setStep(1);
                  setProgress(0);
                }, 600)
              );
            }
          }, (i + 1) * 500)
        );
      });
      return () => timers.forEach(clearTimeout);
    }
    return undefined;
  }, [phase, forId, navigate, setMember]);

  const toggleCondition = (c) =>
    setConditions((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  const toggleFamily = (f) =>
    setFamily((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  const stepDots = STEP_LABELS.map((label, i) => {
    const n = i + 1;
    return (
      <React.Fragment key={label}>
        {i > 0 && <div className={`wizard-step-line${step > n - 1 ? ' completed' : ''}`}></div>}
        <div className={`wizard-step-dot${step === n ? ' active' : ''}${step > n ? ' completed' : ''}`}>
          {step > n ? <Icon name="check" size="sm" /> : n}
        </div>
      </React.Fragment>
    );
  });

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="wizard-card">
            <div className="wizard-card-title">Member Demographics</div>
            <div className="wizard-card-desc">Enter the family member&apos;s basic information to begin the assessment.</div>
            <div className="form-row" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" defaultValue={forMember.name} />
              </div>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input type="number" className="form-input" defaultValue={forMember.age} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Sex</label>
                <select className="form-select" defaultValue={forMember.sex.toLowerCase()}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Relation to You</label>
                <input type="text" className="form-input" defaultValue={forMember.relation} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Occupation</label>
                <input type="text" className="form-input" placeholder="e.g. Accountant" />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input type="text" className="form-input" defaultValue={forMember.location} />
              </div>
            </div>
            <div className="wizard-actions">
              <div></div>
              <button className="btn btn-primary" onClick={() => setStep(2)}>
                Continue
                <Icon name="arrowRight" size="md" />
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="wizard-card">
            <div className="wizard-card-title">Lifestyle Factors</div>
            <div className="wizard-card-desc">Assess habits that shape health risk.</div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Smoking Status</label>
                <select className="form-select" defaultValue="never">
                  <option value="current">Current Smoker</option>
                  <option value="former">Former Smoker</option>
                  <option value="never">Never Smoked</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Alcohol Consumption</label>
                <select className="form-select" defaultValue="none">
                  <option value="moderate">Moderate (3–7 drinks/week)</option>
                  <option value="none">None</option>
                  <option value="light">Light (1–2 drinks/week)</option>
                  <option value="heavy">Heavy (&gt;7 drinks/week)</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Physical Activity</label>
                <select className="form-select" defaultValue="moderate">
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Light (1–2 days/week)</option>
                  <option value="moderate">Moderate (3–5 days/week)</option>
                  <option value="active">Active (6+ days/week)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Diet Quality</label>
                <select className="form-select" defaultValue="good">
                  <option value="poor">Poor — high processed food intake</option>
                  <option value="fair">Fair — some healthy choices</option>
                  <option value="good">Good — balanced diet</option>
                  <option value="excellent">Excellent — whole food based</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Sleep Duration (hours/night)</label>
              <input type="number" className="form-input" placeholder="e.g. 7" defaultValue="7" style={{ maxWidth: 200 }} />
            </div>
            <div className="form-group">
              <label className="form-label">Stress Level</label>
              <Segmented options={['Low', 'Moderate', 'High', 'Severe']} active={stress} onChange={setStress} />
            </div>
            <div className="wizard-actions">
              <button className="btn btn-ghost" onClick={() => setStep(1)}>
                <Icon name="arrowLeft" size="md" />
                Back
              </button>
              <button className="btn btn-primary" onClick={() => setStep(3)}>
                Continue
                <Icon name="arrowRight" size="md" />
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="wizard-card">
            <div className="wizard-card-title">Current Symptoms</div>
            <div className="wizard-card-desc">Select any symptoms this person is currently experiencing.</div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Frequent Urination</label>
                <Segmented options={['Yes', 'No']} active={freqUrination} onChange={setFreqUrination} />
              </div>
              <div className="form-group">
                <label className="form-label">Excessive Thirst</label>
                <Segmented options={['Yes', 'No']} active={thirst} onChange={setThirst} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Unexplained Weight Loss</label>
                <Segmented options={['Yes', 'No']} active={weightLoss} onChange={setWeightLoss} />
              </div>
              <div className="form-group">
                <label className="form-label">Blurred Vision</label>
                <Segmented options={['Yes', 'No']} active={blurredVision} onChange={setBlurredVision} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Chest Pain / Discomfort</label>
                <Segmented options={['Yes', 'No']} active={chestPain} onChange={setChestPain} />
              </div>
              <div className="form-group">
                <label className="form-label">Shortness of Breath</label>
                <Segmented options={['Yes', 'No']} active={sob} onChange={setSob} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Fatigue Level</label>
              <Segmented options={['None', 'Mild', 'Moderate', 'Severe']} active={fatigue} onChange={setFatigue} />
            </div>
            <div className="wizard-actions">
              <button className="btn btn-ghost" onClick={() => setStep(2)}>
                <Icon name="arrowLeft" size="md" />
                Back
              </button>
              <button className="btn btn-primary" onClick={() => setStep(4)}>
                Continue
                <Icon name="arrowRight" size="md" />
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="wizard-card">
            <div className="wizard-card-title">Medical History</div>
            <div className="wizard-card-desc">Document known conditions and family history.</div>
            <div className="form-group">
              <label className="form-label">Known Conditions</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {CONDITIONS.map((c) => (
                  <ToggleTag key={c} label={c} selected={conditions.includes(c)} onToggle={() => toggleCondition(c)} />
                ))}
              </div>
            </div>
            <div className="form-group" style={{ marginTop: 20 }}>
              <label className="form-label">Family History</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {FAMILY.map((f) => (
                  <ToggleTag key={f} label={f} selected={family.includes(f)} onToggle={() => toggleFamily(f)} />
                ))}
              </div>
            </div>
            <div className="form-group" style={{ marginTop: 20 }}>
              <label className="form-label">Current Medications</label>
              <textarea
                className="form-input"
                rows="3"
                placeholder="List current medications..."
                defaultValue={forMember.medications}
                style={{ resize: 'vertical' }}
              />
            </div>
            <div className="wizard-actions">
              <button className="btn btn-ghost" onClick={() => setStep(3)}>
                <Icon name="arrowLeft" size="md" />
                Back
              </button>
              <button className="btn btn-primary" onClick={() => setStep(5)}>
                Continue
                <Icon name="arrowRight" size="md" />
              </button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="wizard-card">
            <div className="wizard-card-title">Vital Signs</div>
            <div className="wizard-card-desc">Record the latest measurements.</div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Systolic BP (mmHg)</label>
                <input type="number" className="form-input" defaultValue={numOf(bpSys)} />
              </div>
              <div className="form-group">
                <label className="form-label">Diastolic BP (mmHg)</label>
                <input type="number" className="form-input" defaultValue={numOf(bpDia)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Heart Rate (bpm)</label>
                <input type="number" className="form-input" defaultValue="78" />
              </div>
              <div className="form-group">
                <label className="form-label">Respiratory Rate</label>
                <input type="number" className="form-input" defaultValue="16" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input type="number" className="form-input" placeholder="Enter weight" />
              </div>
              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input type="number" className="form-input" placeholder="Enter height" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">BMI</label>
                <input type="text" className="form-input" value={forMember.bmi} readOnly style={{ background: 'var(--gray-50)' }} />
              </div>
              <div className="form-group">
                <label className="form-label">SpO₂ (%)</label>
                <input type="number" className="form-input" defaultValue="98" />
              </div>
            </div>
            <div className="wizard-actions">
              <button className="btn btn-ghost" onClick={() => setStep(4)}>
                <Icon name="arrowLeft" size="md" />
                Back
              </button>
              <button className="btn btn-primary" onClick={() => setStep(6)}>
                Continue
                <Icon name="arrowRight" size="md" />
              </button>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="wizard-card">
            <div className="wizard-card-title">Laboratory Results</div>
            <div className="wizard-card-desc">
              Enter available lab values. Leave blank if unavailable — VivRose will suggest missing check-ups.
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">HbA1c (%)</label>
                <input type="number" className="form-input" step="0.1" defaultValue={numOf(forMember.hba1c)} />
              </div>
              <div className="form-group">
                <label className="form-label">Fasting Blood Glucose (mg/dL)</label>
                <input type="number" className="form-input" defaultValue={numOf(forMember.glucose)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Total Cholesterol (mg/dL)</label>
                <input type="number" className="form-input" defaultValue={numOf(forMember.cholesterol)} />
              </div>
              <div className="form-group">
                <label className="form-label">LDL Cholesterol (mg/dL)</label>
                <input type="number" className="form-input" placeholder="Not available" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">HDL Cholesterol (mg/dL)</label>
                <input type="number" className="form-input" placeholder="Not available" />
              </div>
              <div className="form-group">
                <label className="form-label">Triglycerides (mg/dL)</label>
                <input type="number" className="form-input" placeholder="Not available" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Serum Creatinine (mg/dL)</label>
                <input type="number" className="form-input" step="0.1" defaultValue={numOf(forMember.creatinine)} />
              </div>
              <div className="form-group">
                <label className="form-label">eGFR (mL/min/1.73m²)</label>
                <input type="number" className="form-input" placeholder="Not available" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Urine Albumin (mg/L)</label>
                <input type="number" className="form-input" placeholder="Not available" />
              </div>
              <div className="form-group">
                <label className="form-label">Hemoglobin (g/dL)</label>
                <input type="number" className="form-input" step="0.1" placeholder="Not available" />
              </div>
            </div>
            <div className="wizard-actions">
              <button className="btn btn-ghost" onClick={() => setStep(5)}>
                <Icon name="arrowLeft" size="md" />
                Back
              </button>
              <button className="btn btn-primary" onClick={() => setPhase('loading')}>
                <Icon name="sparkle" size="md" />
                Generate AI Assessment
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">New Assessment</div>
        <div className="page-subtitle">A quick health check-up that generates AI-powered risk insights.</div>
      </div>

      <div className="wizard-container">
        <div className="assess-for">
          <span className="assess-for-label">This assessment is for</span>
          <div className="assess-for-chips">
            {members.map((m) => (
              <span
                key={m.id}
                className={`assess-chip${forId === m.id ? ' active' : ''}`}
                onClick={() => setForId(m.id)}
              >
                {m.initials} · {m.name.split(' ')[0]}
              </span>
            ))}
          </div>
        </div>

        <div className="wizard-progress">
          <div className="wizard-step-indicator">{stepDots}</div>
        </div>
        <div className="wizard-step-labels">
          {STEP_LABELS.map((label, i) => (
            <span key={label} className={`wizard-step-label${step === i + 1 ? ' active' : ''}`}>
              {label}
            </span>
          ))}
        </div>

        <div style={{ marginTop: 28 }} key={forId}>
          {phase === 'loading' ? (
            <div className="wizard-card" style={{ textAlign: 'center', padding: '48px 20px' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'var(--plum-100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  animation: 'pulse 1.5s ease-in-out infinite',
                  color: 'var(--plum-700)',
                }}
              >
                <Icon name="sparkle" size="xl" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>
                Analyzing Health Data
              </h3>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.9375rem', marginBottom: 28 }}>
                VivRose AI is processing risk factors and preparing {forMember.name.split(' ')[0]}&apos;s health insights...
              </p>
              <div
                style={{
                  width: 200,
                  height: 4,
                  background: 'rgba(0,0,0,0.06)',
                  borderRadius: 9,
                  margin: '0 auto',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--plum-700), var(--plum-500))',
                    borderRadius: 9,
                    transition: 'width 0.3s ease',
                  }}
                ></div>
              </div>
              <div style={{ marginTop: 12, fontSize: '0.75rem', color: 'var(--gray-400)' }}>{status}</div>
            </div>
          ) : (
            renderStep()
          )}
        </div>
      </div>
    </>
  );
}
