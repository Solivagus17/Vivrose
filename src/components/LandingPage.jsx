import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import { TextEffect } from './core/TextEffect.jsx';
import { TextScramble } from './core/TextScramble.jsx';
import { InView } from './core/InView.jsx';
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

const PILL_REVEAL = {
  variants: {
    hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
  },
  viewOptions: { margin: '0px 0px -40px 0px' },
};

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
      <div className="landing-bg"></div>

      <nav className="landing-nav">
        <div className="landing-logo">
          <div className="logo-mark">S</div>
          <span>ShushrutAI</span>
        </div>
        <div className="landing-nav-links">
          <a href="#features">How it works</a>
          <a href="#">For Families</a>
          <a href="#">Health AI</a>
          <a href="#">About</a>
          <button className="btn btn-primary" onClick={() => navigate(ROUTES.login)}>
            Open App
          </button>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-eyebrow">
              <span className="pulse-dot"></span>
              <TextScramble as="span" duration={1.2} speed={0.05}>
                AI-Powered Family Health Assistant
              </TextScramble>
            </div>
            <h1 className="hero-title">
              <TextEffect per="char" preset="fade-in-blur" as="span" speedReveal={1.4}>
                Your family&apos;s health,
              </TextEffect>{' '}
              <TextEffect per="char" preset="fade" as="span" className="gradient-text" delay={0.35}>
                before it&apos;s a problem
              </TextEffect>
            </h1>
            <p className="hero-desc">
              ShushrutAI watches for the early signs of diabetes, heart disease, and more — for every member of your
              family. One account, one dashboard, plain-language guidance.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-lg" onClick={() => navigate(ROUTES.login)}>
                <Icon name="sparkle" size="md" />
                Start with My Family
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => navigate(ROUTES.login)}>
                Take a Health Assessment
                <Icon name="arrowRight" size="md" />
              </button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-cards">
              {/* Card 1 — Full-width risk overview */}
              <div className="hero-float-card">
                <div className="float-card-header">
                  <div
                    className="float-card-icon"
                    style={{ background: FLOAT_CARD_ICON_COLOR.plumBg, color: FLOAT_CARD_ICON_COLOR.plum }}
                  >
                    <Icon name="shield" size="md" />
                  </div>
                  <span className="float-card-title">Father&apos;s Risk Profile</span>
                  <span className="risk-badge high" style={{ marginLeft: 'auto' }}>High Risk</span>
                </div>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  <MiniRiskRow label="Diabetes" width="78%" pct={78} color="linear-gradient(90deg,#C43C3C,#E06060)" />
                  <MiniRiskRow label="Cardiovascular" width="71%" pct={71} color="linear-gradient(90deg,#C43C3C,#E06060)" />
                  <MiniRiskRow label="Stroke" width="45%" pct={45} color="linear-gradient(90deg,#D49A2A,#E8B74A)" />
                  <MiniRiskRow label="Kidney" width="38%" pct={38} color="linear-gradient(90deg,#D49A2A,#E8B74A)" />
                </div>
                <div style={{ marginTop: 10, fontSize: '0.7rem', color: 'var(--gray-400)', borderTop: '1px solid var(--gray-100)', paddingTop: 8 }}>
                  Last assessed: 3 days ago &nbsp;·&nbsp; BMI 28.4 &nbsp;·&nbsp; Age 54
                </div>
              </div>

              {/* Card 2 — Health Alert */}
              <div className="hero-float-card">
                <div className="float-card-header">
                  <div
                    className="float-card-icon"
                    style={{ background: FLOAT_CARD_ICON_COLOR.redBg, color: FLOAT_CARD_ICON_COLOR.red }}
                  >
                    <Icon name="warning" size="md" />
                  </div>
                  <span className="float-card-title">Health Alerts</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-800)' }}>🔴 HbA1c 8.4% — above safe range</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Fasting glucose: 148 mg/dL</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>LDL Cholesterol: 162 mg/dL</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--risk-high)', fontWeight: 600, marginTop: 2 }}>Book a doctor visit soon</div>
                </div>
              </div>

              {/* Card 3 — AI Insight */}
              <div className="hero-float-card">
                <div className="float-card-header">
                  <div
                    className="float-card-icon"
                    style={{ background: FLOAT_CARD_ICON_COLOR.goldBg, color: FLOAT_CARD_ICON_COLOR.gold }}
                  >
                    <Icon name="sparkles" size="md" />
                  </div>
                  <span className="float-card-title">AI Insights</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div style={{ fontSize: '0.775rem', color: 'var(--gray-700)', lineHeight: 1.45 }}>✦ Kidney function test — overdue by 6 months</div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--gray-700)', lineHeight: 1.45 }}>✦ Full lipid panel — high priority</div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--gray-700)', lineHeight: 1.45 }}>✦ Diabetic eye screening — annual due</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--gold-600)', fontWeight: 600, marginTop: 2 }}>3 check-ups recommended</div>
                </div>
              </div>

              {/* Card 4 — Doctor Recommendation */}
              <div className="hero-float-card">
                <div className="float-card-header">
                  <div
                    className="float-card-icon"
                    style={{ background: FLOAT_CARD_ICON_COLOR.plumBg, color: FLOAT_CARD_ICON_COLOR.plum }}
                  >
                    <Icon name="stethoscope" size="md" />
                  </div>
                  <span className="float-card-title">Doctor Recommendations</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-800)' }}>Endocrinologist</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>Diabetes management — within 2 wks</div>
                    </div>
                    <span className="risk-badge high">Urgent</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--gray-100)', paddingTop: 6 }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-800)' }}>Cardiologist</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>Heart risk review — within 1 month</div>
                    </div>
                    <span className="risk-badge moderate">Soon</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="landing-features" id="features">
        {FEATURES.map((f, i) => (
          <InView
            key={f.label}
            as="div"
            className="feature-pill"
            {...PILL_REVEAL}
            transition={{ duration: 0.45, delay: i * 0.08, ease: 'easeOut' }}
          >
            <div className="feature-pill-icon">
              <Icon name={f.icon} size="md" />
            </div>
            <span className="feature-pill-text">{f.label}</span>
          </InView>
        ))}
      </div>
    </div>
  );
}
