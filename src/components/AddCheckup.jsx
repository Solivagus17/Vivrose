import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from './Icon.jsx';
import { loadDoctors } from '../doctorsStore.js';
import { CHECKUP_STATUS, loadCheckups, addCheckup, updateCheckup } from '../checkupsStore.js';
import { ROUTES } from '../routes.js';

export default function AddCheckup() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const existing = isEdit ? (loadCheckups().find((c) => c.id === id) || null) : null;
  const doctors = loadDoctors();
  const [doctorId, setDoctorId] = useState(existing?.doctorId || '');
  const [purpose, setPurpose] = useState(existing?.purpose || '');
  const [date, setDate] = useState(existing?.date || '');
  const [time, setTime] = useState(existing?.time || '');
  const [location, setLocation] = useState(existing?.location || '');
  const [notes, setNotes] = useState(existing?.notes || '');
  const [status, setStatus] = useState(existing?.status || 'Scheduled');

  useEffect(() => {
    if (isEdit && !existing) navigate(ROUTES.doctors, { replace: true });
  }, [isEdit, existing, navigate]);

  const onDoctorChange = (e) => {
    const docId = e.target.value;
    setDoctorId(docId);
    const doc = doctors.find((d) => d.id === docId);
    if (doc) setLocation((prev) => prev || doc.hospital);
  };

  const valid = !!doctorId && purpose.trim().length > 0 && !!date;

  const submit = async () => {
    if (!valid) return;
    const doctor = doctors.find((d) => d.id === doctorId);
    const payload = {
      doctorId,
      doctorName: doctor?.name || '',
      purpose: purpose.trim(),
      date,
      time,
      location: location.trim() || doctor?.hospital || '',
      notes: notes.trim(),
      status,
    };
    if (isEdit) await updateCheckup(id, payload);
    else await addCheckup(payload);
    navigate(ROUTES.doctors);
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">{isEdit ? 'Edit Checkup' : 'Add Checkup'}</div>
        <div className="page-subtitle">
          {isEdit ? 'Update the details of this upcoming checkup.' : 'Schedule an upcoming checkup with your family&apos;s doctor.'}
        </div>
      </div>

      <div className="card upload-page-card">
        <div className="form-group">
          <label className="form-label">Doctor</label>
          <select className="form-select" value={doctorId} onChange={onDoctorChange}>
            <option value="" disabled>
              Select a doctor
            </option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} — {d.specialty}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Purpose / Reason</label>
          <input
            className="form-input"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="e.g. Diabetes follow-up — HbA1c & lipid review"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Time</label>
            <input type="time" className="form-input" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              className="form-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Apollo Hospital, Ahmedabad"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              {CHECKUP_STATUS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea
            className="form-input"
            rows="3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Bring latest lab reports..."
            style={{ resize: 'vertical' }}
          />
        </div>

        <div className="upload-page-actions">
          <button className="btn btn-ghost" onClick={() => navigate(ROUTES.doctors)}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={!valid} onClick={submit}>
            <Icon name={isEdit ? 'check' : 'calendar'} size="sm" />
            {isEdit ? 'Update Checkup' : 'Save Checkup'}
          </button>
        </div>
      </div>
    </>
  );
}
