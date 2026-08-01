import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import { ROUTES } from '../routes.js';

const FLOAT_CARD_ICON_COLOR = {
  plumBg: 'var(--plum-100)',
  plum: 'var(--plum-700)',
  redBg: 'var(--risk-high-bg)',
  red: 'var(--risk-high)',
  goldBg: 'var(--gold-100)',
  gold: 'var(--gold-600)',
};

const FEATURES = [
  { icon: 'target', label: 'Family Risk Scores' },
  { icon: 'brain', label: 'Plain-Language Insights' },
  { icon: 'flask', label: 'Check-up Suggestions' },
  { icon: 'clipboard', label: 'Doctor Recommendations' },
  { icon: 'book', label: 'Health Education' },
];

function MiniRiskRow({ label, width, pct, color }) {
  return (
    <div>
      <div style={{ fontSize: '0.6875rem', color: 'var(--gray-400)', marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 80, height: 4, background: 'rgba(0,0,0,0.06)', borderRadius: 9, overflow: 'hidden' }}>
          <div style={{ width, height: '100%', background: color, borderRadius: 9 }}></div>
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--risk-high)' }}>{pct}%</span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="landing-page">
      <div className="landing-bg">
        <div className="landing-orb"></div>
        <div className="landing-orb"></div>
        <div className="landing-orb"></div>
      </div>

      <nav className="landing-nav">
        <div className="landing-logo">
          <div className="logo-mark">V</div>
          <span>VivRose</span>
        </div>
        <div className="landing-nav-links">
          <a href="#features">How it works</a>
          <a href="#">For Families</a>
          <a href="#">Health AI</a>
          <a href="#">About</a>
          <button className="btn btn-primary" onClick={() => navigate(ROUTES.dashboard)}>
            Open App
          </button>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-eyebrow">
              <span className="pulse-dot"></span>
              AI-Powered Family Health Assistant
            </div>
            <h1 className="hero-title">
              Your Family&apos;s Health, <span className="gradient-text">Before It&apos;s a Problem</span>
            </h1>
            <p className="hero-desc">
              VivRose watches for the early signs of diabetes, heart disease, and more — for every member of your
              family. One account, one dashboard, plain-language guidance.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-lg" onClick={() => navigate(ROUTES.dashboard)}>
                <Icon name="sparkle" size="md" />
                Start with My Family
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => navigate(ROUTES.assessment)}>
                Take a Health Assessment
                <Icon name="arrowRight" size="md" />
              </button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-cards">
              <div className="hero-float-card">
                <div className="float-card-header">
                  <div
                    className="float-card-icon"
                    style={{ background: FLOAT_CARD_ICON_COLOR.plumBg, color: FLOAT_CARD_ICON_COLOR.plum }}
                  >
                    <Icon name="shield" size="md" />
                  </div>
                  <span className="float-card-title">Father&apos;s Risk Profile</span>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <MiniRiskRow label="Diabetes" width="78%" pct={78} color="linear-gradient(90deg,#C43C3C,#E06060)" />
                  <MiniRiskRow label="CVD" width="71%" pct={71} color="linear-gradient(90deg,#C43C3C,#E06060)" />
                  <MiniRiskRow label="Stroke" width="45%" pct={45} color="linear-gradient(90deg,#D49A2A,#E8B74A)" />
                </div>
              </div>

              <div className="hero-float-card">
                <div className="float-card-header">
                  <div
                    className="float-card-icon"
                    style={{ background: FLOAT_CARD_ICON_COLOR.redBg, color: FLOAT_CARD_ICON_COLOR.red }}
                  >
                    <Icon name="warning" size="md" />
                  </div>
                  <span className="float-card-title">Health Alert</span>
                </div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gray-800)', marginBottom: 2 }}>
                  Blood Sugar Needs Attention
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>HbA1c 8.4% — book a doctor visit</div>
              </div>

              <div className="hero-float-card">
                <div className="float-card-header">
                  <div
                    className="float-card-icon"
                    style={{ background: FLOAT_CARD_ICON_COLOR.goldBg, color: FLOAT_CARD_ICON_COLOR.gold }}
                  >
                    <Icon name="sparkles" size="md" />
                  </div>
                  <span className="float-card-title">AI Insight</span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--gray-600)', lineHeight: 1.5 }}>
                  3 check-ups suggested for your father — kidney function, full lipid panel, and an eye check.
                </div>
              </div>

              <div className="hero-float-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    className="float-card-icon"
                    style={{ background: FLOAT_CARD_ICON_COLOR.plumBg, color: FLOAT_CARD_ICON_COLOR.plum }}
                  >
                    <Icon name="stethoscope" size="md" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gray-800)' }}>
                      Doctor: Endocrinologist
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>Recommended for your father — within 2 weeks</div>
                  </div>
                  <span className="risk-badge high" style={{ marginLeft: 'auto' }}>
                    Urgent
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="landing-features" id="features">
        {FEATURES.map((f) => (
          <div className="feature-pill" key={f.label}>
            <div className="feature-pill-icon">
              <Icon name={f.icon} size="md" />
            </div>
            <span className="feature-pill-text">{f.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
