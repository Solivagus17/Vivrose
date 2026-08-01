import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import { useMember } from '../memberContext.jsx';
import { ROUTES } from '../routes.js';

export default function GenerateReport() {
  const navigate = useNavigate();
  const { member } = useMember();

  const INFO_ITEMS = [
    ['Name:', member.name],
    ['Relation:', member.relation],
    ['Age / Sex:', `${member.age} years / ${member.sex}`],
    ['BMI:', `${member.bmi} (${member.bmiClass})`],
    ['Blood Pressure:', member.bp],
    ['HbA1c:', member.hba1c],
    ['Smoking:', member.smoking],
    ['Known Conditions:', member.conditions],
    ['Family History:', member.familyHistory],
  ];

  return (
    <>
      <div className="page-header">
        <div className="page-title">Generate AI Report</div>
        <div className="page-subtitle">Generate and preview a new AI health assessment report for {member.name}.</div>
      </div>

      <div className="report-container">
        <div className="report-toolbar">
          <div className="segmented">
            <span className="segmented-btn active">Preview</span>
            <span className="segmented-btn">Download PDF</span>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(ROUTES.assessment)}>
            <Icon name="sparkle" size="sm" />
            Run Assessment
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
            <Icon name="printer" size="sm" />
            Print Report
          </button>
        </div>

        <div className="report-page">
          <div className="report-header">
            <div className="report-logo">
              <div className="r-mark">V</div>
              <div>
                <div className="r-text">VivRose</div>
                <div className="r-tag">AI Health Assessment Report</div>
              </div>
            </div>
            <div className="report-date">
              <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>Assessment Date</div>
              <div>{member.assessed}</div>
              <div style={{ marginTop: 4 }}>Report ID: VR-HR-{member.assessed.replace(/\s|,/g, '').slice(0, 8)}-{member.id.toUpperCase()}</div>
            </div>
          </div>

          <div className="report-section">
            <div className="report-section-title">Member Information</div>
            <div className="report-info-grid">
              {INFO_ITEMS.map(([label, value]) => (
                <div className="report-info-item" key={label}>
                  <span className="label">{label}</span>
                  <span className="value">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="report-section">
            <div className="report-section-title">AI Risk Assessment</div>
            <div className="report-risk-grid">
              {member.scores.map((r) => (
                <div className={`report-risk-item ${r.level}`} key={r.label}>
                  <div className="r-name">{r.label}</div>
                  <div className="r-score">{r.score}%</div>
                  <div className="r-level">{r.level === 'high' ? 'HIGH RISK' : r.level === 'moderate' ? 'MODERATE' : 'LOW RISK'}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="report-section">
            <div className="report-section-title">AI Health Summary</div>
            <div className="report-summary-text">{member.reportSummary}</div>
          </div>

          <div className="report-section">
            <div className="report-section-title">Key Findings</div>
            <ul className="report-list">
              {member.findings.map((li) => (
                <li key={li}>{li}</li>
              ))}
            </ul>
          </div>

          <div className="report-section">
            <div className="report-section-title">Suggested Check-ups</div>
            <ul className="report-list">
              {member.checkupList.map((li) => (
                <li key={li}>{li}</li>
              ))}
            </ul>
          </div>

          {member.recommendationList.length > 0 && (
            <div className="report-section">
              <div className="report-section-title">Doctor Recommendations</div>
              <ul className="report-list">
                {member.recommendationList.map((li) => (
                  <li key={li}>{li}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="report-section">
            <div className="report-section-title">Healthy Lifestyle Plan</div>
            <ul className="report-list">
              {member.lifestyle.map((li) => (
                <li key={li}>{li}</li>
              ))}
            </ul>
          </div>

          <div className="report-footer">
            <p>
              This report was generated by the VivRose AI health assessment.
              <br />
              All findings are AI-assisted and should be discussed with a qualified healthcare professional.
              <br />
              VivRose · Predict. Prevent. Prosper. · © 2026
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
