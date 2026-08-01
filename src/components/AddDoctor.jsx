import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from './Icon.jsx';
import { SPECIALTIES, loadDoctors, addDoctor, updateDoctor } from '../doctorsStore.js';
import { ROUTES } from '../routes.js';

export default function AddDoctor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const existing = isEdit ? (loadDoctors().find((d) => d.id === id) || null) : null;
  const [name, setName] = useState(existing?.name || '');
  const [specialty, setSpecialty] = useState(existing?.specialty || SPECIALTIES[0]);
  const [hospital, setHospital] = useState(existing?.hospital || '');
  const [phone, setPhone] = useState(existing?.phone || '');
  const [email, setEmail] = useState(existing?.email || '');
  const [city, setCity] = useState(existing?.city || '');
  const [notes, setNotes] = useState(existing?.notes || '');

  useEffect(() => {
    if (isEdit && !existing) navigate(ROUTES.doctors, { replace: true });
  }, [isEdit, existing, navigate]);

  const valid = name.trim().length > 0;

  const submit = () => {
    if (!valid) return;
    const payload = {
      name: name.trim(),
      specialty,
      hospital: hospital.trim(),
      phone: phone.trim(),
      email: email.trim(),
      city: city.trim(),
      notes: notes.trim(),
    };
    if (isEdit) updateDoctor(id, payload);
    else addDoctor(payload);
    navigate(ROUTES.doctors);
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">{isEdit ? 'Edit Doctor' : 'Add Doctor'}</div>
        <div className="page-subtitle">
          {isEdit ? 'Update the details of this doctor.' : 'Add a doctor to your family\u2019s care team.'}
        </div>
      </div>

      <div className="card upload-page-card">
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Dr. Meera Shah"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Specialty</label>
            <select className="form-select" value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Hospital / Clinic</label>
            <input
              className="form-input"
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              placeholder="e.g. Apollo Hospital, Ahmedabad"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98765 00011"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. doctor@hospital.in"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">City</label>
          <input
            className="form-input"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Ahmedabad"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea
            className="form-input"
            rows="3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Manages father's diabetes and cholesterol care..."
            style={{ resize: 'vertical' }}
          />
        </div>

        <div className="upload-page-actions">
          <button className="btn btn-ghost" onClick={() => navigate(ROUTES.doctors)}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={!valid} onClick={submit}>
            <Icon name={isEdit ? 'check' : 'userPlus'} size="sm" />
            {isEdit ? 'Update Doctor' : 'Save Doctor'}
          </button>
        </div>
      </div>
    </>
  );
}
