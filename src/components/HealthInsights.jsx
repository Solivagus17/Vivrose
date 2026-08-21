import React, { useRef, useMemo } from 'react';
import { useInView } from 'motion/react';
import { StatCard, Reveal } from './ui.jsx';
import { ANALYTICS_OVERVIEW, ANALYTICS_CHART, TOP_CONTRIBUTORS } from '../data/data.js';
import { useMember } from '../memberContext.jsx';

const BAR_COLORS = { low: '#2E9E6A', mod: '#D49A2A', high: '#C43C3C' };

function RiskChart({ chartData }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '0px 0px -80px 0px' });
  const items = chartData || ANALYTICS_CHART;

  return (
    <div className="chart-wrap" ref={ref}>
      <div className="analytics-chart">
        {items.map((item, i) => (
          <div className="chart-group" key={item.label}>
            <div className="chart-bars">
              {Object.entries(BAR_COLORS).map(([key, color], j) => (
                <div
                  key={key}
                  className="chart-bar"
                  style={{
                    background: color,
                    height: isInView ? `${((item[key] || 0) / 100) * 140}px` : '0px',
                    transitionDelay: `${(i * 3 + j) * 80}ms`,
                  }}
                ></div>
              ))}
            </div>
            <div className="chart-group-label">{item.label}</div>
          </div>
        ))}
        <div className="chart-legend">
          {Object.entries(BAR_COLORS).map(([key, color]) => (
            <div className="legend-item" key={key}>
              <span className="legend-swatch" style={{ background: color }}></span>
              {key === 'low' ? 'Low Risk' : key === 'mod' ? 'Moderate' : 'High Risk'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function XaiBar({ width, gradient }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '0px 0px -40px 0px' });

  return (
    <div className="xai-impact-bar-container" ref={ref}>
      <div className="xai-impact-bar-bg">
        <div
          className="xai-impact-bar"
          style={{
            width: isInView ? `${width}%` : '0%',
            background: gradient || 'linear-gradient(90deg,var(--plum-700),var(--plum-500))',
            transition: 'width 0.7s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        ></div>
      </div>
    </div>
  );
}

export default function HealthInsights() {
  const { members } = useMember();
  const totalMembers = Math.max(members.length, 1);

  // Dynamic Overview Stat Cards
  const highCount = members.filter((m) => m.level === 'high').length;
  const modCount = members.filter((m) => m.level === 'moderate').length;
  const lowCount = members.filter((m) => m.level === 'low').length;
  const assessedCount = members.filter((m) => m.assessed || (m.lastAssessed && m.lastAssessed !== 'Never')).length;

  const overview = useMemo(() => {
    if (!members.length) return ANALYTICS_OVERVIEW;
    return [
      {
        label: 'High Risk Members',
        value: String(highCount),
        change: `${Math.round((highCount / totalMembers) * 100)}% of family`,
        icon: 'alertCircle',
        iconBg: 'rgba(196, 60, 60, 0.1)',
        iconColor: '#C43C3C',
        changeClass: highCount > 0 ? 'down' : 'up',
      },
      {
        label: 'Moderate Risk Members',
        value: String(modCount),
        change: `${Math.round((modCount / totalMembers) * 100)}% of family`,
        icon: 'trend',
        iconBg: 'rgba(212, 154, 42, 0.1)',
        iconColor: '#D49A2A',
        changeClass: 'neutral',
      },
      {
        label: 'Low Risk Members',
        value: String(lowCount),
        change: `${Math.round((lowCount / totalMembers) * 100)}% of family`,
        icon: 'heart',
        iconBg: 'rgba(46, 158, 106, 0.1)',
        iconColor: '#2E9E6A',
        changeClass: 'up',
      },
      {
        label: 'Total Assessed',
        value: String(assessedCount),
        change: `${Math.round((assessedCount / totalMembers) * 100)}% of family`,
        icon: 'users',
        iconBg: 'rgba(92, 42, 158, 0.1)',
        iconColor: '#5C2A9E',
        changeClass: 'up',
      },
    ];
  }, [members, highCount, modCount, lowCount, assessedCount, totalMembers]);

  // Dynamic Risk Breakdown by Disease
  const chartData = useMemo(() => {
    if (!members.length) return ANALYTICS_CHART;
    const diseases = ['Diabetes', 'Hypertension', 'CKD', 'CVD', 'Stroke'];
    return diseases.map((disease) => {
      let high = 0;
      let mod = 0;
      let low = 0;

      members.forEach((m) => {
        const diseaseScore = (m.scores && m.scores[disease.toLowerCase()]) || 0;
        if (diseaseScore >= 70 || m.level === 'high') {
          high += 1;
        } else if (diseaseScore >= 40 || m.level === 'moderate') {
          mod += 1;
        } else {
          low += 1;
        }
      });

      const len = members.length;
      return {
        label: disease,
        high: Math.round((high / len) * 100),
        mod: Math.round((mod / len) * 100),
        low: Math.round((low / len) * 100),
      };
    });
  }, [members]);

  // Dynamic Top Health Factors Across Family
  const topContributors = useMemo(() => {
    if (!members.length) return TOP_CONTRIBUTORS;

    let htnCount = 0;
    let dbCount = 0;
    let bmiCount = 0;
    let smokeCount = 0;
    let famCount = 0;

    members.forEach((m) => {
      if ((m.bp && m.bp !== '—') || (m.conditions || []).includes('Hypertension')) htnCount += 1;
      if ((m.hba1c && m.hba1c !== '—') || (m.glucose && m.glucose !== '—') || (m.conditions || []).includes('Diabetes')) dbCount += 1;
      const bmiVal = parseFloat(m.bmi);
      if (!isNaN(bmiVal) && bmiVal >= 25) bmiCount += 1;
      if (m.smoking && m.smoking !== 'Non-smoker') smokeCount += 1;
      if ((m.familyHistory || []).length > 0) famCount += 1;
    });

    const total = members.length;
    const list = [
      { name: 'Elevated Blood Pressure', count: htnCount, desc: 'Systolic ≥ 130 or Diastolic ≥ 80' },
      { name: 'Elevated HbA1c / Glucose', count: dbCount, desc: 'HbA1c ≥ 6.5% or Glucose ≥ 126 mg/dL' },
      { name: 'Elevated BMI / Overweight', count: bmiCount, desc: 'BMI ≥ 25.0 kg/m²' },
      { name: 'Family History Predisposition', count: famCount, desc: 'First-degree genetic risk factor' },
      { name: 'Smoking / Lifestyle Factors', count: smokeCount, desc: 'Active/past smoking or physical inactivity' },
    ];

    const activeList = list.filter((item) => item.count > 0);
    if (!activeList.length) return TOP_CONTRIBUTORS;

    return activeList.map((item) => ({
      name: item.name,
      value: `${item.count} family member${item.count > 1 ? 's' : ''}`,
      width: Math.max(Math.round((item.count / total) * 100), 25),
    }));
  }, [members]);

  return (
    <>
      <div className="page-header">
        <div className="page-title">Health Insights</div>
        <div className="page-subtitle">A bird&apos;s-eye view of risk across your family.</div>
      </div>

      <div className="analytics-overview stagger-children">
        {overview.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="assess-grid">
        <Reveal className="card card-lg">
          <div className="card-header">
            <div>
              <div className="card-title">Risk Levels by Condition</div>
              <div className="card-subtitle">Share of your family at each risk level</div>
            </div>
          </div>
          <RiskChart chartData={chartData} />
        </Reveal>

        <Reveal className="card card-lg" delay={0.1}>
          <div className="card-header">
            <div>
              <div className="card-title">Common Health Factors</div>
              <div className="card-subtitle">Frequent risk factors across your family</div>
            </div>
          </div>
          <div className="xai-section">
            {topContributors.map((c) => (
              <div className="xai-item" key={c.name}>
                <div className="xai-factor">
                  <div className="xai-factor-name">{c.name}</div>
                  <div className="xai-factor-value">{c.value}</div>
                </div>
                <XaiBar width={c.width} gradient="linear-gradient(90deg,var(--plum-700),var(--plum-500))" />
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </>
  );
}
