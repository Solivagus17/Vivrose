import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import { StatCard } from './ui.jsx';
import { loadDoctors, saveDoctors } from '../doctorsStore.js';
import { CHECKUP_STATUS, loadCheckups, saveCheckups } from '../checkupsStore.js';
import { ROUTES } from '../routes.js';

const SPECIALTY_ICONS = {
  Cardiologist: 'heart',
  Endocrinologist: 'droplet',
  Gynecologist: 'users',
  Nephrologist: 'flask',
  'General Physician': 'stethoscope',
  Ophthalmologist: 'eye',
  Orthopedist: 'run',
};

const CHECKUP_FILTERS = ['Scheduled', 'Completed', 'Cancelled'];

function specialtyIcon(specialty) {
  return SPECIALTY_ICONS[specialty] || 'stethoscope';
}

function formatDate(iso) {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso || '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(t) {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  if (!Number.isFinite(h)) return t;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr = h % 12 || 12;
  return `${hr}:${String(m || 0).padStart(2, '0')} ${ampm}`;
}

function statusClass(s) {
  if (s === 'Scheduled') return 'active';
  if (s === 'Completed') return 'done';
  return 'off';
}

export default function Doctors() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState(loadDoctors);
  const [checkups, setCheckups] = useState(loadCheckups);
  const [query, setQuery] = useState('');
  const [chkFilter, setChkFilter] = useState('Scheduled');

  useEffect(() => {
    saveDoctors(doctors);
  }, [doctors]);

  useEffect(() => {
    saveCheckups(checkups);
  }, [checkups]);

  const filteredDoctors = doctors.filter((d) => {
    const q = query.toLowerCase().trim();
    return (
      !q ||
      d.name.toLowerCase().includes(q) ||
      d.specialty.toLowerCase().includes(q) ||
      d.hospital.toLowerCase().includes(q) ||
      d.city.toLowerCase().includes(q) ||
      d.notes.toLowerCase().includes(q)
    );
  });

  const stats = useMemo(() => {
    const specialties = new Set(doctors.map((d) => d.specialty)).size;
    const hospitals = new Set(doctors.map((d) => d.hospital).filter(Boolean)).size;
    const upcoming = checkups.filter((c) => c.status === 'Scheduled').length;
    return { total: doctors.length, specialties, hospitals, upcoming };
  }, [doctors, checkups]);

  const checkupsList = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkups
      .filter((c) => c.status === chkFilter)
      .sort((a, b) => {
        const da = new Date(`${a.date}T00:00:00`);
        const db = new Date(`${b.date}T00:00:00`);
        return da - db || (a.time || '').localeCompare(b.time || '');
      });
  }, [checkups, chkFilter]);

  const nextCheckupFor = (doctorId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkups
      .filter((c) => c.doctorId === doctorId && c.status === 'Scheduled')
      .filter((c) => new Date(`${c.date}T00:00:00`) >= today)
      .sort((a, b) => new Date(`${a.date}T00:00:00`) - new Date(`${b.date}T00:00:00`))[0];
  };

  const handleDoctorDelete = (d) => {
    const ok = window.confirm(`Remove ${d.name} from your doctors?`);
    if (ok) setDoctors((prev) => prev.filter((x) => x.id !== d.id));
  };

  const setCheckupStatus = (id, status) =>
    setCheckups((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));

  const handleCheckupDelete = (c) => {
    const ok = window.confirm(`Remove the "${c.purpose}" checkup?`);
    if (ok) setCheckups((prev) => prev.filter((x) => x.id !== c.id));
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">Doctors</div>
        <div className="page-subtitle">Keep your family&apos;s care team and upcoming checkups in one place.</div>
      </div>

      <div className="reports-stats">
        <StatCard
          icon="stethoscope"
          value={stats.total}
          label="Doctors"
          change="In your care team"
          changeClass="up"
          iconBg="var(--plum-100)"
          iconColor="var(--plum-700)"
        />
        <StatCard
          icon="brain"
          value={stats.specialties}
          label="Specialties"
          change="Covered"
          changeClass="up"
          iconBg="var(--blue-100)"
          iconColor="var(--blue-600)"
        />
        <StatCard
          icon="flask"
          value={stats.hospitals}
          label="Hospitals / Clinics"
          change="Distinct facilities"
          changeClass="up"
          iconBg="var(--teal-100)"
          iconColor="var(--teal-700)"
        />
        <StatCard
          icon="calendar"
          value={stats.upcoming}
          label="Upcoming Checkups"
          change="Scheduled"
          changeClass="up"
          iconBg="var(--risk-low-bg)"
          iconColor="var(--risk-low-text)"
        />
      </div>

      <div className="patients-toolbar">
        <div className="search-input-wrap">
          <span className="search-icon">
            <Icon name="search" size="sm" />
          </span>
          <input
            type="text"
            placeholder="Search by name, specialty, or facility..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate(ROUTES.doctorsAdd)}>
          <Icon name="userPlus" size="sm" />
          Add Doctor
        </button>
      </div>

      {filteredDoctors.length === 0 ? (
        <div className="reports-empty">
          <div className="reports-empty-icon">
            <Icon name="stethoscope" size="lg" />
          </div>
          <div className="reports-empty-title">No doctors found</div>
          <div className="reports-empty-desc">
            {doctors.length === 0
              ? 'Your care team is empty. Add your first doctor to get started.'
              : 'Nothing matches your search.'}
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate(ROUTES.doctorsAdd)}>
            <Icon name="userPlus" size="sm" />
            Add Doctor
          </button>
        </div>
      ) : (
        <div className="doctor-grid">
          {filteredDoctors.map((d) => {
            const next = nextCheckupFor(d.id);
            return (
              <div className="doctor-card" key={d.id}>
                <div className="doctor-card-top">
                  <span className="doctor-card-avatar">
                    <Icon name={specialtyIcon(d.specialty)} size="md" />
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="doctor-card-name">{d.name}</div>
                    <div className="doctor-card-specialty">{d.specialty}</div>
                  </div>
                </div>

                <div className="doctor-card-meta">
                  <div>
                    <span className="f-label">Hospital / Clinic</span>
                    <span className="f-value">{d.hospital || '—'}</span>
                  </div>
                  <div>
                    <span className="f-label">City</span>
                    <span className="f-value">{d.city || '—'}</span>
                  </div>
                  <div>
                    <span className="f-label">Phone</span>
                    <span className="f-value">{d.phone || '—'}</span>
                  </div>
                  <div>
                    <span className="f-label">Email</span>
                    <span className="f-value">{d.email || '—'}</span>
                  </div>
                </div>

                {d.notes && <div className="doctor-card-notes">{d.notes}</div>}

                {next && (
                  <div className="doctor-card-next" title={`${next.purpose} — ${formatDate(next.date)} ${formatTime(next.time)}`}>
                    <Icon name="calendar" size="sm" />
                    <span>
                      Next: <strong>{formatDate(next.date)}</strong> · {formatTime(next.time)}
                    </span>
                  </div>
                )}

                <div className="doctor-card-footer">
                  <div style={{ display: 'flex', gap: 8 }}>
                    {d.phone && (
                      <a className="btn btn-ghost btn-sm" href={`tel:${d.phone}`}>
                        <Icon name="phone" size="sm" /> Call
                      </a>
                    )}
                    {d.email && (
                      <a className="btn btn-ghost btn-sm" href={`mailto:${d.email}`}>
                        <Icon name="mail" size="sm" /> Email
                      </a>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => navigate(ROUTES.doctorsEdit.replace(':id', d.id))}
                      title={`Edit ${d.name}`}
                      aria-label={`Edit ${d.name}`}
                    >
                      <Icon name="edit" size="sm" />
                    </button>
                    <button
                      className="btn btn-icon-danger btn-sm"
                      onClick={() => handleDoctorDelete(d)}
                      title={`Remove ${d.name}`}
                      aria-label={`Remove ${d.name}`}
                    >
                      <Icon name="trash" size="sm" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="checkups-section">
        <div className="checkups-head">
          <div className="checkups-title">
            <Icon name="calendar" size="sm" />
            Upcoming Checkups
            <span className="tag plum">{stats.upcoming} scheduled</span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="segmented">
              {CHECKUP_FILTERS.map((s) => (
                <span
                  key={s}
                  className={`segmented-btn${chkFilter === s ? ' active' : ''}`}
                  onClick={() => setChkFilter(s)}
                >
                  {s}
                </span>
              ))}
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => navigate(ROUTES.checkupsAdd)}>
              <Icon name="plus" size="sm" />
              Add Checkup
            </button>
          </div>
        </div>

        {checkupsList.length === 0 ? (
          <div className="reports-empty">
            <div className="reports-empty-icon">
              <Icon name="calendar" size="lg" />
            </div>
            <div className="reports-empty-title">No {chkFilter.toLowerCase()} checkups</div>
            <div className="reports-empty-desc">
              {checkups.length === 0
                ? 'No checkups scheduled yet. Add one to stay on top of appointments.'
                : 'Nothing matches this status right now.'}
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => navigate(ROUTES.checkupsAdd)}>
              <Icon name="plus" size="sm" />
              Add Checkup
            </button>
          </div>
        ) : (
          <div className="report-records-table chk-records-table">
            <div className="report-records-header">
              <span>Checkup</span>
              <span>Doctor</span>
              <span>Date &amp; Time</span>
              <span>Location</span>
              <span>Notes</span>
              <span>Status</span>
              <span></span>
            </div>
            {checkupsList.map((c) => (
              <div className="report-records-row" key={c.id}>
                <div className="report-records-file">
                  <span className="report-records-file-icon"><Icon name="calendar" size="sm" /></span>
                  <span>
                    <span className="report-records-file-name" title={c.purpose}>{c.purpose}</span>
                    <span className="report-records-file-meta">{c.doctorName || '—'}</span>
                  </span>
                </div>
                <div className="report-records-cell" data-label="Doctor" title={c.doctorName}>{c.doctorName || '—'}</div>
                <div className="report-records-cell" data-label="Date & Time" title={`${formatDate(c.date)} ${formatTime(c.time)}`}>
                  {formatDate(c.date)}
                  <span className="med-timing">· {formatTime(c.time)}</span>
                </div>
                <div className="report-records-cell" data-label="Location" title={c.location}>{c.location || '—'}</div>
                <div className="report-records-cell" data-label="Notes" title={c.notes}>{c.notes || '—'}</div>
                <div className="report-records-cell" data-label="Status">
                  <span className={`tag ${statusClass(c.status)}`}>{c.status}</span>
                </div>
                <div className="report-records-row-actions">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => navigate(ROUTES.checkupsEdit.replace(':id', c.id))}
                    title={`Edit ${c.purpose}`}
                    aria-label={`Edit ${c.purpose}`}
                  >
                    <Icon name="edit" size="sm" />
                  </button>
                  <button
                    className={`btn ${c.status === 'Scheduled' ? 'btn-ghost' : 'btn-secondary'} btn-sm`}
                    onClick={() => setCheckupStatus(c.id, c.status === 'Scheduled' ? 'Completed' : 'Scheduled')}
                    title={c.status === 'Scheduled' ? 'Mark as completed' : 'Move back to scheduled'}
                  >
                    <Icon name={c.status === 'Scheduled' ? 'check' : 'run'} size="sm" />
                  </button>
                  <button
                    className="btn btn-icon-danger btn-sm"
                    onClick={() => handleCheckupDelete(c)}
                    title={`Remove ${c.purpose}`}
                    aria-label={`Remove ${c.purpose}`}
                  >
                    <Icon name="trash" size="sm" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
