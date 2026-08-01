import React, { useRef } from 'react';
import { useInView } from 'motion/react';
import { StatCard, Reveal } from './ui.jsx';
import { ANALYTICS_OVERVIEW, ANALYTICS_CHART, TOP_CONTRIBUTORS } from '../data/data.js';
import { useMember } from '../memberContext.jsx';

const BAR_COLORS = { low: '#2E9E6A', mod: '#D49A2A', high: '#C43C3C' };
const LEVEL_ORDER = ['high', 'moderate', 'low'];

function RiskChart() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '0px 0px -80px 0px' });

  return (
    <div className="chart-wrap" ref={ref}>
      <div className="analytics-chart">
        {ANALYTICS_CHART.map((item, i) => (
          <div className="chart-group" key={item.label}>
            <div className="chart-bars">
              {Object.entries(BAR_COLORS).map(([key, color], j) => (
                <div
                  key={key}
                  className="chart-bar"
                  style={{
                    background: color,
                    height: isInView ? `${(item[key] / 100) * 140}px` : '0px',
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
  const overview = ANALYTICS_OVERVIEW.map((s, i) => {
    const count = members.filter((m) => m.level === LEVEL_ORDER[i]).length;
    const pct = Math.round((count / Math.max(members.length, 1)) * 100);
    return { ...s, value: String(count), change: `${pct}% of family` };
  });

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
          <RiskChart />
        </Reveal>

        <Reveal className="card card-lg" delay={0.1}>
          <div className="card-header">
            <div>
              <div className="card-title">Common Health Factors</div>
              <div className="card-subtitle">Frequent risk factors across your family</div>
            </div>
          </div>
          <div className="xai-section">
            {TOP_CONTRIBUTORS.map((c) => (
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
