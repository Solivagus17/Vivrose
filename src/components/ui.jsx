import React from 'react';
import Icon from './Icon.jsx';

export function RiskBadge({ level }) {
  const label = level === 'high' ? 'High Risk' : level === 'moderate' ? 'Moderate' : 'Low Risk';
  return (
    <span className={`risk-badge ${level}`}>
      <span className={`risk-dot ${level}`}></span>
      {label}
    </span>
  );
}

export function RiskBadgeShort({ level }) {
  const label = level === 'high' ? 'High' : level === 'moderate' ? 'Moderate' : 'Low';
  return (
    <span className={`risk-badge ${level}`}>
      <span className={`risk-dot ${level}`}></span>
      {label}
    </span>
  );
}

export function RiskBar({ width, level, delay = 0 }) {
  const [animated, setAnimated] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setAnimated(true), delay + 100);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div className="risk-bar-container">
      <div
        className={`risk-bar ${level}`}
        style={{ width: animated ? `${width}%` : '0%', transitionDelay: `${delay}ms` }}
      ></div>
    </div>
  );
}

export function TrendLine({ points, color }) {
  return (
    <svg viewBox="0 0 40 16" aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export function StatCard({ icon, value, label, change, changeClass, iconBg, iconColor }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: iconBg, color: iconColor }}>
        <Icon name={icon} size="md" />
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      <span className={`stat-change ${changeClass}`}>{change}</span>
    </div>
  );
}

export function Avatar({ initials, background }) {
  return (
    <div className="patient-avatar" style={{ background }}>
      {initials}
    </div>
  );
}

export function Reveal({ children, className = '', delay = 0, style = {} }) {
  const [visible, setVisible] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
