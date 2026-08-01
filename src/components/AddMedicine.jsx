import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from './Icon.jsx';
import { FREQUENCIES, MEDICINE_STATUS, loadMedicines, addMedicine, updateMedicine } from '../medicinesStore.js';
import { ROUTES } from '../routes.js';

export default function AddMedicine() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const existing = isEdit ? (loadMedicines().find((m) => m.id === id) || null) : null;
  const [name, setName] = useState(existing?.name || '');
  const [purpose, setPurpose] = useState(existing?.purpose || '');
  const [dosage, setDosage] = useState(existing?.dosage || '');
  const [frequency, setFrequency] = useState(existing?.frequency || FREQUENCIES[0]);
  const [timing, setTiming] = useState(existing?.timing || '');
  const [prescribedBy, setPrescribedBy] = useState(existing?.prescribedBy || '');
  const [startDate, setStartDate] = useState(existing?.startDate || '');
  const [endDate, setEndDate] = useState(existing?.endDate || '');
  const [status, setStatus] = useState(existing?.status || 'Active');
  const [remark, setRemark] = useState(existing?.remark || '');

  useEffect(() => {
    if (isEdit && !existing) navigate(ROUTES.medicines, { replace: true });
  }, [isEdit, existing, navigate]);

  const valid = name.trim().length > 0 && !!startDate;

  const submit = async () => {
    if (!valid) return;
    const payload = {
      name: name.trim(),
      purpose: purpose.trim(),
      dosage: dosage.trim(),
      frequency,
      timing: timing.trim(),
      prescribedBy: prescribedBy.trim(),
      startDate,
      endDate,
      status,
      remark: remark.trim(),
    };
    if (isEdit) await updateMedicine(id, payload);
    else await addMedicine(payload);
    navigate(ROUTES.medicines);
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">{isEdit ? 'Edit Medicine' : 'Add Medicine'}</div>
        <div className="page-subtitle">
          {isEdit ? 'Update this medicine course for your family.' : 'Start tracking a new medicine course for your family.'}
        </div>
      </div>

      <div className="card upload-page-card">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Medicine Name</label>
            <input
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Amlodipine"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Purpose</label>
            <input
              className="form-input"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Blood pressure control"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Dosage</label>
            <input
              className="form-input"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g. 5 mg"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Frequency</label>
            <select className="form-select" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
              {FREQUENCIES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Timing / Instructions</label>
          <input
            className="form-input"
            value={timing}
            onChange={(e) => setTiming(e.target.value)}
            placeholder="e.g. Morning, after breakfast"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Prescribed By</label>
            <input
              className="form-input"
              value={prescribedBy}
              onChange={(e) => setPrescribedBy(e.target.value)}
              placeholder="e.g. Dr. Anil Patel"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              {MEDICINE_STATUS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input type="date" className="form-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">End Date</label>
            <input type="date" className="form-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <span className="form-hint">Leave empty if the course is ongoing.</span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Remark</label>
          <textarea
            className="form-input"
            rows="3"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Any notes worth remembering about this course..."
            style={{ resize: 'vertical' }}
          />
        </div>

        <div className="upload-page-actions">
          <button className="btn btn-ghost" onClick={() => navigate(ROUTES.medicines)}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={!valid} onClick={submit}>
            <Icon name={isEdit ? 'check' : 'plus'} size="sm" />
            {isEdit ? 'Update Medicine' : 'Save Medicine'}
          </button>
        </div>
      </div>
    </>
  );
}
