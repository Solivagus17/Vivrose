import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from './Icon.jsx';
import { REPORT_TYPES, loadReports, addReport, updateReport } from '../reportsStore.js';
import { ROUTES } from '../routes.js';

function formatSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function UploadReport() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const existing = isEdit ? (loadReports().find((r) => r.id === id) || null) : null;
  const [file, setFile] = useState(null);
  const [type, setType] = useState(existing?.type || REPORT_TYPES[0]);
  const [date, setDate] = useState(existing?.date || '');
  const [hospital, setHospital] = useState(existing?.hospital || '');
  const [doctor, setDoctor] = useState(existing?.doctor || '');
  const [purpose, setPurpose] = useState(existing?.purpose || '');
  const [remark, setRemark] = useState(existing?.remark || '');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEdit && !existing) navigate(ROUTES.reports, { replace: true });
  }, [isEdit, existing, navigate]);

  const hasFile = !!file || !!existing;
  const valid = hasFile && !!type && !!date;

  const submit = () => {
    if (!valid) return;
    const payload = {
      fileName: file ? file.name : existing.fileName,
      fileSize: file ? formatSize(file.size) : existing.fileSize,
      type,
      date,
      hospital: hospital.trim(),
      doctor: doctor.trim(),
      purpose: purpose.trim(),
      remark: remark.trim(),
    };
    if (isEdit) updateReport(id, payload);
    else addReport(payload);
    navigate(ROUTES.reports);
  };

  const displayName = file ? file.name : existing?.fileName;
  const displayMeta = file ? (formatSize(file.size) || 'File selected') : existing ? `Current file · ${existing.fileSize || 'size unknown'}` : '';

  return (
    <>
      <div className="page-header">
        <div className="page-title">{isEdit ? 'Edit Medical Report' : 'Upload Medical Report'}</div>
        <div className="page-subtitle">
          {isEdit ? 'Update the categorization of this medical report.' : 'Add a report and categorize it for easy reference later.'}
        </div>
      </div>

      <div className="card upload-page-card">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={{ display: 'none' }}
        />
        <button
          className={`upload-dropzone${hasFile ? ' has-file' : ''}`}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          {hasFile ? (
            <>
              <span className="upload-dropzone-icon"><Icon name="document" size="md" /></span>
              <span className="upload-dropzone-name">{displayName}</span>
              <span className="upload-dropzone-meta">
                {displayMeta}
                {isEdit && <span style={{ opacity: 0.7 }}> · Click to replace</span>}
              </span>
            </>
          ) : (
            <>
              <span className="upload-dropzone-icon"><Icon name="upload" size="md" /></span>
              <span className="upload-dropzone-title">Click to choose a medical report</span>
              <span className="upload-dropzone-meta">PDF, image, or document up to 10 MB</span>
            </>
          )}
        </button>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Type of Report</label>
            <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
              {REPORT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date of Checkup</label>
            <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Hospital / Clinic</label>
            <input
              className="form-input"
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              placeholder="e.g. Apollo Hospital, Ahmedabad"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Doctor Consulted</label>
            <input
              className="form-input"
              value={doctor}
              onChange={(e) => setDoctor(e.target.value)}
              placeholder="e.g. Dr. Meera Shah"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Purpose</label>
          <input
            className="form-input"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="e.g. Annual health check-up"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Remark</label>
          <textarea
            className="form-input"
            rows="3"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Any notes worth remembering about this visit..."
            style={{ resize: 'vertical' }}
          />
        </div>

        <div className="upload-page-actions">
          <button className="btn btn-ghost" onClick={() => navigate(ROUTES.reports)}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={!valid} onClick={submit}>
            <Icon name={isEdit ? 'check' : 'upload'} size="sm" />
            {isEdit ? 'Update Report' : 'Save Report'}
          </button>
        </div>
      </div>
    </>
  );
}
