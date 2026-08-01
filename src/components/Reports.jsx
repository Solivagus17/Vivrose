import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import { StatCard } from './ui.jsx';
import { REPORT_TYPES, loadReports, refreshReports, deleteReport } from '../reportsStore.js';
import { ROUTES } from '../routes.js';

function formatDate(iso) {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso || '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Reports() {
  const navigate = useNavigate();
  const [records, setRecords] = useState(loadReports);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    refreshReports().then(setRecords);
  }, []);

  const filtered = records.filter((r) => {
    const matchesType = filter === 'All' || r.type === filter;
    const q = query.toLowerCase().trim();
    const matchesQuery =
      !q ||
      r.fileName.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q) ||
      r.hospital.toLowerCase().includes(q) ||
      r.doctor.toLowerCase().includes(q) ||
      r.purpose.toLowerCase().includes(q) ||
      r.remark.toLowerCase().includes(q);
    return matchesType && matchesQuery;
  });

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = records.filter((r) => {
      const d = new Date(`${r.date}T00:00:00`);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
    const facilities = new Set(records.map((r) => r.hospital).filter(Boolean)).size;
    return { total: records.length, thisMonth, facilities };
  }, [records]);

  const handleDelete = async (r) => {
    const ok = window.confirm(`Remove "${r.fileName}" from your reports library?`);
    if (ok) {
      await deleteReport(r.id);
      const updated = await refreshReports();
      setRecords(updated);
    }
  };

  return (
    <>
      <div className="page-header">
        <div className="page-title">Reports</div>
        <div className="page-subtitle">Upload medical reports and keep every check-up organized in one place.</div>
      </div>

      <div className="reports-stats">
        <StatCard
          icon="document"
          value={stats.total}
          label="Uploaded Reports"
          change="In your library"
          changeClass="up"
          iconBg="var(--plum-100)"
          iconColor="var(--plum-700)"
        />
        <StatCard
          icon="calendar"
          value={stats.thisMonth}
          label="This Month"
          change="Recent check-ups"
          changeClass="up"
          iconBg="var(--blue-100)"
          iconColor="var(--blue-600)"
        />
        <StatCard
          icon="stethoscope"
          value={stats.facilities}
          label="Hospitals / Clinics"
          change="Distinct facilities"
          changeClass="up"
          iconBg="var(--teal-100)"
          iconColor="var(--teal-700)"
        />
      </div>

      <div className="patients-toolbar">
        <div className="search-input-wrap">
          <span className="search-icon">
            <Icon name="search" size="sm" />
          </span>
          <input
            type="text"
            placeholder="Search by file, doctor, facility, or purpose..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="reports-toolbar-right">
          <div className="report-filter">
            <span className="report-filter-label">Filter by type</span>
            <select
              className="form-select report-filter-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Types</option>
              {REPORT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate(ROUTES.reportsUpload)}>
            <Icon name="upload" size="sm" />
            Upload Report
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="reports-empty">
          <div className="reports-empty-icon">
            <Icon name="document" size="lg" />
          </div>
          <div className="reports-empty-title">No reports found</div>
          <div className="reports-empty-desc">
            {records.length === 0
              ? 'Your library is empty. Upload your first medical report to get started.'
              : 'Nothing matches your current search or filter.'}
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => navigate(ROUTES.reportsUpload)}>
            <Icon name="upload" size="sm" />
            Upload Report
          </button>
        </div>
      ) : (
        <div className="report-records-table">
          <div className="report-records-header">
            <span>Report</span>
            <span>Date</span>
            <span>Hospital / Clinic</span>
            <span>Doctor</span>
            <span>Purpose</span>
            <span>Remark</span>
            <span></span>
          </div>
          {filtered.map((r) => (
            <div className="report-records-row" key={r.id}>
              <div className="report-records-file">
                <span className="report-records-file-icon"><Icon name="document" size="sm" /></span>
                <span>
                  <span className="report-records-file-name" title={r.fileName}>{r.fileName}</span>
                  <span className="report-records-file-meta">{r.fileSize || '—'} · <span className="tag plum">{r.type}</span></span>
                </span>
              </div>
              <div className="report-records-cell" data-label="Date" title={formatDate(r.date)}>{formatDate(r.date)}</div>
              <div className="report-records-cell" data-label="Hospital / Clinic" title={r.hospital}>{r.hospital || '—'}</div>
              <div className="report-records-cell" data-label="Doctor" title={r.doctor}>{r.doctor || '—'}</div>
              <div className="report-records-cell" data-label="Purpose" title={r.purpose}>{r.purpose || '—'}</div>
              <div className="report-records-cell" data-label="Remark" title={r.remark}>{r.remark || '—'}</div>
              <div className="report-records-row-actions">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => navigate(ROUTES.reportsEdit.replace(':id', r.id))}
                  title={`Edit ${r.fileName}`}
                  aria-label={`Edit ${r.fileName}`}
                >
                  <Icon name="edit" size="sm" />
                </button>
                <button
                  className="btn btn-icon-danger btn-sm"
                  onClick={() => handleDelete(r)}
                  title={`Remove ${r.fileName}`}
                  aria-label={`Remove ${r.fileName}`}
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
