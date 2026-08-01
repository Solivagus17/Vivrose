import React, { useEffect, useState } from 'react';
import { StatCard } from './ui.jsx';
import { ANALYTICS_OVERVIEW, ANALYTICS_CHART, TOP_CONTRIBUTORS } from '../data/data.js';
import { useMember } from '../memberContext.jsx';

const BAR_COLORS = { low: '#2E9E6A', mod: '#D49A2A', high: '#C43C3C' };
const LEVEL_ORDER = ['high', 'moderate', 'low'];

function RiskChart() {
  const [heights, setHeights] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setHeights(
        ANALYTICS_CHART.map((c) => [
          (c.low / 100) * 140,
          (c.mod / 100) * 140,
          (c.high / 100) * 140,
        ])
      );
    }, 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="chart-wrap">
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
                    height: heights ? `${heights[i][j]}px` : 0,
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
        <div className="card card-lg">
          <div className="card-header">
            <div>
              <div className="card-title">Risk Levels by Condition</div>
              <div className="card-subtitle">Share of your family at each risk level</div>
            </div>
          </div>
          <RiskChart />
        </div>

        <div className="card card-lg">
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
                <div className="xai-impact-bar-container">
                  <div className="xai-impact-bar-bg">
                    <div
                      className="xai-impact-bar"
                      style={{
                        width: `${c.width}%`,
                        background: 'linear-gradient(90deg,var(--plum-700),var(--plum-500))',
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
