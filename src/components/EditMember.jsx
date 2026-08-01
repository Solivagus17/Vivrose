import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from './Icon.jsx';
import { useMember } from '../memberContext.jsx';
import { ROUTES } from '../routes.js';
import { calcAge } from '../data/data.js';

const CONDITIONS = [
  'Hypertension', 'Pre-Diabetes', 'Diabetes', 'Heart Disease',
  'Kidney Disease', 'Dyslipidemia', 'Stroke', 'COPD', 'Asthma', 'Obesity',
];
const FAMILY_HISTORY_OPTIONS = [
  'Diabetes (Father)', 'Diabetes (Mother)', 'Hypertension (Father)',
  'Hypertension (Mother)', 'Heart Disease', 'Stroke', 'Kidney Disease', 'Cancer',
];

function ToggleChip({ label, selected, onToggle }) {
  return (
    <span
      onClick={onToggle}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 14px',
        borderRadius: 'var(--r-full)',
        fontSize: '0.8125rem',
        fontWeight: 500,
        cursor: 'pointer',
        userSelect: 'none',
        border: selected
          ? '1.5px solid var(--plum-500)'
          : '1.5px solid var(--gray-200)',
        background: selected ? 'var(--plum-50)' : 'transparent',
        color: selected ? 'var(--plum-700)' : 'var(--gray-500)',
        transition: 'all var(--t-fast)',
      }}
    >
      {selected && (
        <Icon name="check" size="xs" />
      )}
      {label}
    </span>
  );
}

function SectionTitle({ icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 'var(--r-sm)',
            background: 'var(--plum-50)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--plum-600)',
            flexShrink: 0,
          }}
        >
          <Icon name={icon} size="sm" />
        </div>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)' }}>{title}</div>
      </div>
      {subtitle && (
        <div style={{ fontSize: '0.8125rem', color: 'var(--gray-400)', paddingLeft: 36 }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

// Parse conditions/familyHistory from stored format (array or comma-string)
function toArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (val === 'None' || val === 'None reported') return [];
  return String(val).split(',').map((s) => s.trim()).filter(Boolean);
}

// Parse BP "130/85 mmHg" => { sys: '130', dia: '85' }
function parseBP(bp) {
  const str = (bp || '').replace('mmHg', '').trim();
  const [sys, dia] = str.split('/').map((s) => s.trim());
  return { sys: sys || '', dia: dia || '' };
}

// Parse numeric value from strings like "7.2%" or "120 mg/dL"
function numStr(val) {
  if (val === undefined || val === null || val === '—') return '';
  const n = parseFloat(String(val).replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? String(n) : '';
}

export default function EditMember() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { members, updateMember } = useMember();

  const existing = members.find((m) => m.id === id) || null;

  useEffect(() => {
    if (!existing) navigate(ROUTES.family, { replace: true });
  }, [existing, navigate]);

  // Section A: Basic Profile
  const [name, setName]               = useState(existing?.name || '');
  const [relation, setRelation]       = useState(existing?.relation || '');
  const [sex, setSex]                 = useState(existing?.sex || 'Male');
  const [birthDate, setBirthDate]     = useState(existing?.birthDate || existing?.birth_date || '');
  const [birthLocation, setBirthLocation] = useState(existing?.birthLocation || existing?.birth_location || '');
  const [location, setLocation]       = useState(existing?.location || '');

  // Section B: Vitals & Labs
  const bp0                           = parseBP(existing?.bp);
  const [bpSys, setBpSys]             = useState(bp0.sys);
  const [bpDia, setBpDia]             = useState(bp0.dia);
  const [bmi, setBmi]                 = useState(existing?.bmi === '—' ? '' : (existing?.bmi || ''));
  const [hba1c, setHba1c]             = useState(numStr(existing?.hba1c));
  const [glucose, setGlucose]         = useState(numStr(existing?.glucose));
  const [cholesterol, setCholesterol] = useState(numStr(existing?.cholesterol));
  const [creatinine, setCreatinine]   = useState(numStr(existing?.creatinine));
  const [smoking, setSmoking]         = useState(existing?.smoking || 'Non-smoker');

  // Section C: Medical History
  const [conditions, setConditions]   = useState(() => toArray(existing?.conditions));
  const [familyHistory, setFamilyHistory] = useState(() => toArray(existing?.familyHistory || existing?.family_history));
  const [medications, setMedications] = useState(
    Array.isArray(existing?.medications)
      ? existing.medications.join(', ')
      : existing?.medications && existing.medications !== 'None' ? existing.medications : ''
  );

  // Section D: AI Summary (editable)
  const [summary, setSummary] = useState(
    (existing?.summary || '').replace(/<[^>]*>/g, '')
  );

  const age = calcAge(birthDate) || existing?.age || '';
  const valid = name.trim().length > 0;

  const toggleCondition = (c) =>
    setConditions((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  const toggleFamily = (f) =>
    setFamilyHistory((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!valid || saving) return;
    setSaving(true);

    const bp = bpSys && bpDia ? `${bpSys}/${bpDia} mmHg` : existing?.bp;

    const payload = {
      name: name.trim(),
      relation: relation.trim() || 'Family Member',
      sex,
      birthDate,
      birthLocation: birthLocation.trim(),
      location: location.trim(),
      age: age || existing?.age,
      bp,
      bmi: bmi || existing?.bmi,
      hba1c: hba1c ? `${hba1c}%` : existing?.hba1c,
      glucose: glucose ? `${glucose} mg/dL` : existing?.glucose,
      cholesterol: cholesterol ? `${cholesterol} mg/dL` : existing?.cholesterol,
      creatinine: creatinine ? `${creatinine} mg/dL` : existing?.creatinine,
      smoking,
      conditions: conditions.length > 0 ? conditions : (existing?.conditions || []),
      familyHistory: familyHistory.length > 0 ? familyHistory : (existing?.familyHistory || []),
      medications: medications.trim() ? medications.split(',').map((s) => s.trim()).filter(Boolean) : 'None',
      summary: summary.trim() || existing?.summary,
    };

    try {
      await updateMember(id, payload);
      setSaving(false);
      navigate(ROUTES.family);
    } catch (e) {
      console.error('Save failed:', e);
      setSaving(false);
      alert('Failed to save changes. Please try again.');
    }
  };

  if (!existing) return null;

  return (
    <>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div className="page-title">Edit Family Member</div>
          <div className="page-subtitle">
            Update profile and health data for <strong>{existing.name}</strong>.
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(ROUTES.family)} style={{ flexShrink: 0, marginTop: 4 }}>
          <Icon name="arrowLeft" size="sm" />
          Back to Family
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 820, marginBottom: 40 }}>

        {/* Section A: Basic Profile */}
        <div className="card card-lg">
          <SectionTitle icon="user" title="Basic Profile" subtitle="Name, relation, sex, and date of birth." />

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Meera Mehta"
              autoFocus
            />
          </div>

          <div className="form-row" style={{ marginTop: 16 }}>
            <div className="form-group">
              <label className="form-label">Relation</label>
              <input
                className="form-input"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                placeholder="e.g. Mother, Father, Sister..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Sex</label>
              <select className="form-select" value={sex} onChange={(e) => setSex(e.target.value)}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 16 }}>
            <label className="form-label">Date of Birth</label>
            <input
              className="form-input"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              style={{ maxWidth: 240 }}
            />
            {age && (
              <span className="form-hint">{age} year{age === 1 ? '' : 's'} old</span>
            )}
          </div>

          <div className="form-row" style={{ marginTop: 16 }}>
            <div className="form-group">
              <label className="form-label">Birth Location</label>
              <input
                className="form-input"
                value={birthLocation}
                onChange={(e) => setBirthLocation(e.target.value)}
                placeholder="e.g. Mumbai, Maharashtra"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Current Residence</label>
              <input
                className="form-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Ahmedabad, Gujarat"
              />
            </div>
          </div>
        </div>

        {/* Section B: Vitals & Labs */}
        <div className="card card-lg">
          <SectionTitle
            icon="ruler"
            title="Vitals & Lab Values"
            subtitle="Latest measurements from the AI Assessment or manual entry."
          />

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Systolic BP (mmHg)</label>
              <input
                type="number"
                className="form-input"
                value={bpSys}
                onChange={(e) => setBpSys(e.target.value)}
                placeholder="e.g. 130"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Diastolic BP (mmHg)</label>
              <input
                type="number"
                className="form-input"
                value={bpDia}
                onChange={(e) => setBpDia(e.target.value)}
                placeholder="e.g. 85"
              />
            </div>
          </div>

          <div className="form-row" style={{ marginTop: 16 }}>
            <div className="form-group">
              <label className="form-label">BMI</label>
              <input
                type="text"
                className="form-input"
                value={bmi}
                onChange={(e) => setBmi(e.target.value)}
                placeholder="e.g. 24.5 (Overweight)"
              />
            </div>
            <div className="form-group">
              <label className="form-label">HbA1c (%)</label>
              <input
                type="number"
                className="form-input"
                step="0.1"
                value={hba1c}
                onChange={(e) => setHba1c(e.target.value)}
                placeholder="e.g. 7.2"
              />
            </div>
          </div>

          <div className="form-row" style={{ marginTop: 16 }}>
            <div className="form-group">
              <label className="form-label">Fasting Blood Glucose (mg/dL)</label>
              <input
                type="number"
                className="form-input"
                value={glucose}
                onChange={(e) => setGlucose(e.target.value)}
                placeholder="e.g. 126"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Total Cholesterol (mg/dL)</label>
              <input
                type="number"
                className="form-input"
                value={cholesterol}
                onChange={(e) => setCholesterol(e.target.value)}
                placeholder="e.g. 220"
              />
            </div>
          </div>

          <div className="form-row" style={{ marginTop: 16 }}>
            <div className="form-group">
              <label className="form-label">Serum Creatinine (mg/dL)</label>
              <input
                type="number"
                className="form-input"
                step="0.1"
                value={creatinine}
                onChange={(e) => setCreatinine(e.target.value)}
                placeholder="e.g. 1.1"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Smoking Status</label>
              <select className="form-select" value={smoking} onChange={(e) => setSmoking(e.target.value)}>
                <option value="Non-smoker">Non-smoker</option>
                <option value="Active Smoker">Active Smoker</option>
                <option value="Former Smoker">Former Smoker</option>
                <option value="N/A">N/A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section C: Medical History */}
        <div className="card card-lg">
          <SectionTitle
            icon="clipboard"
            title="Medical History"
            subtitle="Known conditions, family history, and current medications."
          />

          <div className="form-group">
            <label className="form-label">Known Conditions</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {CONDITIONS.map((c) => (
                <ToggleChip
                  key={c}
                  label={c}
                  selected={conditions.includes(c)}
                  onToggle={() => toggleCondition(c)}
                />
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 20 }}>
            <label className="form-label">Family History</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {FAMILY_HISTORY_OPTIONS.map((f) => (
                <ToggleChip
                  key={f}
                  label={f}
                  selected={familyHistory.includes(f)}
                  onToggle={() => toggleFamily(f)}
                />
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 20 }}>
            <label className="form-label">Current Medications</label>
            <textarea
              className="form-input"
              rows="3"
              value={medications}
              onChange={(e) => setMedications(e.target.value)}
              placeholder="e.g. Metformin 500mg twice daily, Amlodipine 5mg once daily..."
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingBottom: 8 }}>
          <button className="btn btn-ghost" onClick={() => navigate(ROUTES.family)}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={!valid || saving} onClick={submit}>
            {saving ? (
              <>Saving&hellip;</>
            ) : (
              <>
                <Icon name="check" size="sm" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
