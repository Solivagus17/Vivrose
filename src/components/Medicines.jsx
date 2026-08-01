import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import { StatCard } from './ui.jsx';
import { MEDICINE_STATUS, loadMedicines, refreshMedicines, addMedicine, updateMedicine, deleteMedicine } from '../medicinesStore.js';
import { ROUTES } from '../routes.js';

const STATUS_FILTERS = ['All', ...MEDICINE_STATUS];

function formatDate(iso) {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso || '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function courseLabel(m) {
  const start = formatDate(m.startDate);
  if (!m.endDate) return `${start} → Ongoing`;
  return `${start} → ${formatDate(m.endDate)}`;
}

function daysLeft(m) {
  if (m.status !== 'Active' || !m.endDate) return null;
  const diff = Math.ceil((new Date(`${m.endDate}T00:00:00`) - new Date()) / 86400000);
  return diff;
}

function statusClass(status) {
  if (status === 'Active') return 'active';
  if (status === 'Completed') return 'done';
  return 'off';
}

export default function Medicines() {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState(loadMedicines);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    refreshMedicines().then(setMedicines);
  }, []);

  const filtered = medicines.filter((m) => {
    const matchesStatus = filter === 'All' || m.status === filter;
    const q = query.toLowerCase().trim();
    const matchesQuery =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.purpose.toLowerCase().includes(q) ||
      m.prescribedBy.toLowerCase().includes(q) ||
      m.remark.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  const stats = useMemo(() => {
    const active = medicines.filter((m) => m.status === 'Active').length;
    const completed = medicines.filter((m) => m.status === 'Completed').length;
    return { total: medicines.length, active, completed };
  }, [medicines]);

  const setStatus = async (id, status) => {
    await updateMedicine(id, { status });
    const updated = await refreshMedicines();
    setMedicines(updated);
  };

  const handleDelete = async (m) => {
    const ok = window.confirm(`Remove ${m.name} from your medicines?`);
    if (ok) {
      await deleteMedicine(m.id);
      const updated = await refreshMedicines();
      setMedicines(updated);
    }
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">Medicines</div>
        <div className="page-subtitle">Track medicine courses, dosages, and schedules for your family.</div>
      </div>

      <div className="reports-stats">
        <StatCard
          icon="pill"
          value={stats.active}
          label="Active Courses"
          change="Currently ongoing"
          changeClass="up"
          iconBg="var(--risk-low-bg)"
          iconColor="var(--risk-low-text)"
        />
        <StatCard
          icon="check"
          value={stats.completed}
          label="Completed"
          change="Finished courses"
          changeClass="up"
          iconBg="var(--blue-100)"
          iconColor="var(--blue-600)"
        />
        <StatCard
          icon="clipboard"
          value={stats.total}
          label="Total Medicines"
          change="Tracked courses"
          changeClass="up"
          iconBg="var(--plum-100)"
          iconColor="var(--plum-700)"
        />
      </div>

      <div className="patients-toolbar">
        <div className="search-input-wrap">
          <span className="search-icon">
            <Icon name="search" size="sm" />
          </span>
          <input
            type="text"
            placeholder="Search by medicine, purpose, or doctor..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="segmented">
            {STATUS_FILTERS.map((s) => (
              <span
                key={s}
                className={`segmented-btn${filter === s ? ' active' : ''}`}
                onClick={() => setFilter(s)}
              >
                {s}
              </span>
            ))}
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate(ROUTES.medicinesAdd)}>
            <Icon name="plus" size="sm" />
            Add Medicine
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="reports-empty">
          <div className="reports-empty-icon">
            <Icon name="pill" size="lg" />
          </div>
          <div className="reports-empty-title">No medicines found</div>
          <div className="reports-empty-desc">
            {medicines.length === 0
              ? 'Your medicine tracker is empty. Add a medicine course to get started.'
              : 'Nothing matches your current search or filter.'}
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate(ROUTES.medicinesAdd)}>
            <Icon name="plus" size="sm" />
            Add Medicine
          </button>
        </div>
      ) : (
        <div className="report-records-table med-records-table">
          <div className="report-records-header">
            <span>Medicine</span>
            <span>Course</span>
            <span>Dosage</span>
            <span>Frequency</span>
            <span>Prescribed By</span>
            <span>Status</span>
            <span></span>
          </div>
          {filtered.map((m) => (
            <div className="report-records-row" key={m.id}>
              <div className="report-records-file">
                <span className="report-records-file-icon"><Icon name="pill" size="sm" /></span>
                <span>
                  <span className="report-records-file-name" title={m.name}>{m.name}</span>
                  <span className="report-records-file-meta">{m.purpose || '—'}</span>
                </span>
              </div>
              <div className="report-records-cell med-course" data-label="Course" title={courseLabel(m)}>
                {courseLabel(m)}
                {daysLeft(m) != null && (
                  <span className={`med-days-left${daysLeft(m) < 0 ? ' overdue' : ''}`}>
                    {daysLeft(m) < 0 ? `${Math.abs(daysLeft(m))}d overdue` : `${daysLeft(m)}d left`}
                  </span>
                )}
              </div>
              <div className="report-records-cell" data-label="Dosage" title={m.dosage}>{m.dosage || '—'}</div>
              <div className="report-records-cell" data-label="Frequency" title={m.frequency}>
                {m.frequency || '—'}
                {m.timing && <span className="med-timing">· {m.timing}</span>}
              </div>
              <div className="report-records-cell" data-label="Prescribed By" title={m.prescribedBy}>{m.prescribedBy || '—'}</div>
              <div className="report-records-cell" data-label="Status">
                <span className={`tag ${statusClass(m.status)}`}>{m.status}</span>
              </div>
              <div className="med-row-actions">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => navigate(ROUTES.medicinesEdit.replace(':id', m.id))}
                  title={`Edit ${m.name}`}
                  aria-label={`Edit ${m.name}`}
                >
                  <Icon name="edit" size="sm" />
                </button>
                <button
                  className={`btn ${m.status === 'Active' ? 'btn-ghost' : 'btn-secondary'} btn-sm`}
                  onClick={() => setStatus(m.id, m.status === 'Active' ? 'Completed' : 'Active')}
                  title={m.status === 'Active' ? 'Mark as completed' : 'Resume course'}
                >
                  <Icon name={m.status === 'Active' ? 'check' : 'run'} size="sm" />
                </button>
                <button
                  className="btn btn-icon-danger btn-sm"
                  onClick={() => handleDelete(m)}
                  title={`Remove ${m.name}`}
                  aria-label={`Remove ${m.name}`}
                >
                  <Icon name="trash" size="sm" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
