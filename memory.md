# VivRose — Project Memory

> **Predict. Prevent. Prosper.**

---

## Project Overview

**VivRose** is an AI-powered family health platform: one account (Arjun Mehta) manages up to five family members (Self, Wife, Father, Mother, Son), with per-member AI risk assessments, health reports, a family overview, health insights, and education. Built on the original clinical CDSS engine.

### Target Conditions
- Diabetes Mellitus (Type 2)
- Hypertension
- Chronic Kidney Disease (CKD)
- Cardiovascular Disease (CVD)
- Stroke

### Core Capabilities
| Capability | Description |
|---|---|
| Risk Scoring | Multi-disease risk prediction with percentage scores |
| Clinical Insights | AI-generated clinical summary with executive-level reasoning |
| Explainable AI | Ranked impact factors explaining why the AI reached its conclusion |
| Missing Investigations | Recommended next tests based on data gaps |
| Referral Engine | Specialist referral suggestions with priority and timelines |
| Patient Education | Multilingual health education (English, Hindi, Gujarati) |
| Clinical Reports | Professional PDF-style reports for physician-patient sharing |

---

## Design System

### Brand Identity
- **Name:** VivRose
- **Tagline:** Predict. Prevent. Prosper.
- **Font:** Inter (Google Fonts) — weights 300-900
- **Aesthetic:** Premium healthcare meets modern productivity software

### Color Palette

#### Backgrounds (Warm Premium Gradient)
| Token | Hex | Usage |
|---|---|---|
| `--bg-cream` | `#FFFAF5` | Primary background start |
| `--bg-sand` | `#F8F0E6` | Mid gradient |
| `--bg-ivory` | `#FCF5EC` | Transition tone |
| `--bg-peach` | `#FEF2EB` | Late gradient |
| `--bg-rose` | `#FFF6F2` | End tone |

#### Primary Accent — Deep Teal
| Token | Hex |
|---|---|
| `--teal-900` | `#0A4F52` |
| `--teal-700` | `#0F6F73` |
| `--teal-500` | `#15959A` |
| `--teal-100` | `#DCF2F3` |

#### Secondary Accent — Muted Blue
| Token | Hex |
|---|---|
| `--blue-600` | `#4A7A94` |
| `--blue-500` | `#5B8FA8` |

#### Risk Colors
| Level | Color | Background |
|---|---|---|
| Low Risk | `#2E9E6A` (Soft Green) | `#E6F6EE` |
| Moderate Risk | `#D49A2A` (Warm Amber) | `#FDF3DE` |
| High Risk | `#C43C3C` (Muted Red) | `#FDE8E8` |

### Design Tokens
- **Border Radius:** 6px → 32px (xs → 3xl), 9999px (full/pill)
- **Shadows:** 6-level system (xs → 2xl) using subtle black opacity
- **Glass Effects:** `backdrop-filter: blur(48px) saturate(1.9)` with translucent white backgrounds
- **Transitions:** Fast (150ms), Base (250ms), Slow (400ms), Spring (500ms with bounce)
- **Icons:** Inline SVG symbol set (stroke-based, lucide-style) — no emoji, no icon library

---

## Architecture

### Tech Stack
- **React 18** — Component-based UI with hooks
- **Vite 5** — Fast build tool and dev server
- **CSS3** — Vanilla CSS with custom properties (no frameworks)
- **Frontend-only** — No backend, no API integrations

### File Structure
```
Tetrathon/
├── index.html            # Vite entry point
├── package.json          # Dependencies & scripts
├── vite.config.js        # Vite configuration
├── memory.md             # This file — project documentation
└── src/
    ├── main.jsx          # React root render
    ├── App.jsx           # Navigation state + app shell
    ├── styles/
    │   └── global.css    # Design system + all page styles
    ├── data/
    │   └── data.js       # Mock clinical data (patient, risks, alerts...)
    ├── lib/
    │   └── utils.js      # cn() classname joiner
    ├── hooks/
    │   └── useClickOutside.js
    └── components/
        ├── Icon.jsx              # SVG icon symbol set
        ├── Sidebar.jsx           # Frosted-glass translucent sidebar
        ├── LandingPage.jsx       # Hero landing screen
        ├── Dashboard.jsx         # Clinical overview
        ├── NewAssessment.jsx     # 6-step wizard + loading simulation
        ├── AiAssessment.jsx      # Risk showcase page
        ├── Patients.jsx          # Searchable patient table
        ├── RiskAnalytics.jsx     # Population analytics + chart
        ├── Reports.jsx           # PDF-style report preview
        ├── PatientEducation.jsx  # Multilingual education tabs
        ├── Settings.jsx          # Clinical/notification/AI config
        ├── core/                 # Motion primitives (motion/react based)
        │   ├── TextEffect.jsx
        │   ├── BorderTrail.jsx
        │   ├── InView.jsx
        │   ├── TextScramble.jsx
        │   └── ToolbarExpandable.jsx
        └── ui.jsx                # Shared primitives (RiskBar, Reveal...)
```

### Application Structure
The app is a single-page React application with client-side navigation state:

```
Landing Page (Full Screen)
  └── "Start Assessment" or "Open Dashboard"
        └── App Shell
              ├── Sidebar (fixed, frosted glass)
              └── Main Content Area
                    ├── Dashboard
                    ├── New Assessment (6-step wizard)
                    ├── AI Assessment Dashboard (showcase)
                    ├── Patients (table view)
                    ├── Risk Analytics
                    ├── Reports (PDF preview)
                    ├── Patient Education (multilingual)
                    └── Settings
```

---

## Mock Patient Data

### Primary Demo Patient
| Field | Value |
|---|---|
| Name | Rajesh Patel |
| Age | 52 years |
| Sex | Male |
| BMI | 32.0 (Obese Class I) |
| Blood Pressure | 165/100 mmHg |
| HbA1c | 8.4% |
| Smoking | Active Smoker |
| Family History | Diabetes (Father), Hypertension (Mother) |
| Known Conditions | Hypertension, Dyslipidemia |
| Medications | Amlodipine 5mg OD, Atorvastatin 20mg HS |
| Fasting Glucose | 168 mg/dL |
| Total Cholesterol | 242 mg/dL |
| Serum Creatinine | 1.3 mg/dL |

### AI-Generated Risk Scores
| Condition | Score | Level |
|---|---|---|
| Diabetes | 78% | HIGH |
| Hypertension | 82% | HIGH |
| CKD | 52% | MODERATE |
| CVD | 71% | HIGH |
| Stroke | 45% | MODERATE |

---

## Page Descriptions

### 1. Landing Page
Full-screen hero with animated gradient orbs, floating preview cards, and CTA buttons. Transitions into app shell.

### 2. Dashboard
Clinical overview with stat cards (total patients, high risk alerts, assessments, pending investigations), recent patients list, and clinical alerts feed.

### 3. New Assessment (Wizard)
6-step floating card wizard:
1. Demographics (name, age, sex, ethnicity)
2. Lifestyle (smoking, alcohol, exercise, diet, sleep, stress)
3. Symptoms (polyuria, polydipsia, chest pain, SOB, fatigue)
4. Medical History (conditions, family history, medications) — togglable tags
5. Vital Signs (BP, HR, weight, height, BMI, SpO₂)
6. Laboratory Results (HbA1c, glucose, lipids, creatinine)

Includes animated loading simulation before showing results.

### 4. AI Assessment Dashboard (Showcase Screen)
- Patient header card (teal gradient with metadata)
- 5 risk cards with animated progress bars and trend sparklines
- AI Clinical Summary (executive-style explanation)
- Explainable AI section (ranked impact bars)
- Missing Investigations (5 recommended tests with rationale)
- Early Warning Alerts (4 alert cards with severity)
- Referral Recommendations (3 specialist cards with priority)

### 5. Patients
Searchable patient table with live risk filtering, avatar badges, and clickable rows. `Ctrl+K` focuses search.

### 6. Risk Analytics
Population-level stats, animated bar chart, and top modifiable risk contributors.

### 7. Reports
PDF-style clinical report with VivRose branding, patient info, risk scores, AI summary, findings, investigations, referrals, and lifestyle recommendations. Print-ready.

### 8. Patient Education
Multilingual tabbed interface (English, Hindi, Gujarati) with disease explanation, diet, exercise, smoking cessation, warning signs, and follow-up guidance.

### 9. Settings
Clinical thresholds, notification preferences, AI model configuration with working toggles, inputs, and segmented controls.

---

## Keyboard Shortcuts
| Shortcut | Action |
|---|---|
| `Ctrl + K` | Focus patient search |
| `Escape` | Return to Dashboard |

---

## Animations & Motion

Motion is powered by **motion (framer-motion successor, `motion/react`)** via custom primitives in `src/components/core/` — ported from the motion-primitives pattern and adapted to the vanilla-CSS design system (no Tailwind). `@` maps to `src` via `vite.config.js`.

### Core Primitives (`src/components/core/`)
| Primitive | What it does | Used in |
|---|---|---|
| `TextEffect` | Animates text per char/word/line with presets (`fade`, `blur`, `fade-in-blur`, `scale`, `slide`) | Landing hero title, Dashboard greeting, AiAssessment member name |
| `TextScramble` | Character-scramble reveal (used sparingly — 2 spots max) | Landing eyebrow, AiAssessment "AI Health Summary" label |
| `BorderTrail` | Glowing dot that traces the card border (mask-based, `offset-path`) | Landing hero card, AiAssessment AI summary card |
| `InView` | Scroll-triggered reveal via `useInView` + variants | Feature pills, Dashboard cards |
| `ToolbarExpandable` | Floating quick-actions bar (spring expand/collapse, `react-use-measure`) | AppShell (fixed bottom-right, all app pages) |

### Motion usage rules
- **TextScramble** is intentionally rare — it is loud and only used on the landing eyebrow and the AI summary label.
- `Reveal` (in `ui.jsx`) is now a thin wrapper over `InView`, so all existing scroll-reveal call sites are motion-powered.
- Custom components import `cn` from `@/lib/utils` and `Icon` from `../Icon.jsx` — the toolbar is fully wired to real routes (`ROUTES.*`) and `useMember`.

### Existing CSS animations (kept)
- **Page transitions:** Fade + translateY keyed remount of page components
- **Risk bars:** Width animation with cubic-bezier easing (1.2s)
- **Landing orbs:** 20s infinite floating animation
- **Hero cards:** 6s floating effect with staggered delays
- **Wizard steps:** React state transitions between steps
- **Loading simulation:** Sequential progress bar with status text
- **Hover effects:** Subtle elevation and scale for cards

---

## Demo Flow (Hackathon Presentation)

**Recommended sequence for maximum impact:**

1. **Landing Page** → Show the hero, floating cards, and tagline
2. **Dashboard** → Family overview: stat cards, family list, health alerts
3. **Family Members** → Card grid, search (Ctrl+K), risk filters
4. **"New Assessment"** → 6-step wizard, "This assessment is for" member chips
5. **Generate AI Assessment** → Loading animation → member-specific AI Insights
6. **Health Insights** → Family-level analytics
7. **Reports** → Per-member PDF-style report
8. **Health Education** → English / Hindi / Gujarati tabs

## Session Status (patient-family pivot)

- **Done & verified (build + smoke green):** `MemberProvider`/`useMember` (default `rajesh`), routes `family`=`/app/family` + `health`=`/app/health` replacing `patients`/`analytics`, `App.jsx` wrapped in provider, patient-side Sidebar (footer "Arjun Mehta — Family Health Manager"), `data.js` rewritten with `USER`, `FAMILY_MEMBERS` (5 profiles), `DASH_STATS`, `ALERTS`, `ANALYTICS_OVERVIEW`, `ANALYTICS_CHART`, `TOP_CONTRIBUTORS`; `Dashboard.jsx` family overview; `FamilyMembers.jsx` (replaces `Patients.jsx`); `HealthInsights.jsx` (replaces `RiskAnalytics.jsx`); `AiAssessment.jsx`, `Reports.jsx`, `NewAssessment.jsx` member-aware; `PatientEducation.jsx` + `Settings.jsx` + `LandingPage.jsx` patient-facing copy; orphaned `Patients.jsx`/`RiskAnalytics.jsx` deleted; smoke.mjs wraps in MemberProvider.
- **CSS added:** `.family-grid`, `.family-card` (+top/name/relation/meta/footer), `.f-label`, `.f-value`, `.assess-for*`, `.assess-chip` (wizard dots/line and `.referral-cards` already existed).
- **Icons:** no additions needed — `users`, `userPlus`, `sparkles`, `arrowLeft/Right`, `heart`, `droplet`, `dna`, `eye`, `search`, `check`, `printer` all already in `Icon.jsx`.
- **Old data exports gone:** `PATIENT`, `RISK_SCORES`, `XAI_FACTORS`, `INVESTIGATIONS`, `WARNINGS`, `REFERRALS`, `AI_SUMMARY`, `PATIENTS`, `REPORT_LISTS`, `REPORT_SUMMARY`.
- **Note:** `PatientEducation.jsx` body content is still father-specific (HbA1c 8.4% etc.); acceptable for demo, not data-driven.

## Session Status (motion primitives)

- **Done & verified (build + smoke green):** Installed `motion@12.43` + `react-use-measure` (needs `--legacy-peer-deps` due to the vite 8 / plugin-react peer gap). Added `@` alias → `src` in `vite.config.js` and `scripts/smoke.mjs`. Created `src/lib/utils.js` (`cn`), `src/hooks/useClickOutside.js`, and `src/components/core/` with `TextEffect`, `BorderTrail`, `InView`, `TextScramble`, `ToolbarExpandable`.
- **Integration:** Landing hero title = per-char `fade-in-blur` + per-char gradient `fade`; landing eyebrow = `TextScramble`; first hero float-card = `BorderTrail`; feature pills = per-pill `InView` stagger (their old CSS entrance animation was removed). Dashboard greeting = per-word `slide`; dashboard cards = `InView` stagger. AiAssessment member name = per-char `blur`; "AI Health Summary" label = `TextScramble`; AI summary card = `BorderTrail`. `Reveal` in `ui.jsx` is now an `InView` wrapper (no API change). `AppShell` mounts `ToolbarExpandable` (fixed bottom-right; Profile/Alerts/Reports/Education quick actions wired to routes).
- **Notes/gotchas:** `TextEffect` requires a plain-string child (pass a built `greeting` string, not JSX expressions). `BorderTrail` is invisible inside `overflow:hidden` cards (mask is clipped), so it lives on `.hero-float-card` and `.ai-summary-card` only. TextScramble intentionally used exactly twice. Landing hero float cards now use a non-overlapping **bento grid** (`.hero-cards` = 2-col grid; cards 1 & 4 span both columns, cards 2 & 3 tucked left/right) instead of absolute `top/left/right` offsets — cards can no longer collide, even during the staggered float animation (amplitude 6px, 20px gaps).
- **CSS added:** motion utilities (`.sr-only`, `.inline-block`, `.whitespace-pre`, `.block`, `.hidden`, `.overflow-hidden`), `.mp-trail-dot` gradient, and the `.mp-toolbar*` block (frosted-glass floating toolbar); `.mp-toolbar` hidden on print.

---

## Design Decisions

1. **Warm gradient backgrounds** instead of flat white — creates a premium, calming healthcare feel
2. **Translucent frosted glass sidebar** — `rgba(255,255,255,0.38)` with 48px blur; lighter and more airy than the original
3. **No pie charts or speedometers** — used elegant progress bars and impact bars instead
4. **Risk colors only for risk communication** — teal accent for everything else
5. **Large cards with generous spacing** — avoids clinical dashboard clutter
6. **Inline SVG icons** — replace emoji with a lightweight stroke-based symbol set for a professional, consistent look
7. **Component-driven structure** — one page per component, mock data centralized in `src/data/data.js`
8. **Pre-filled form data** — wizard comes pre-populated for smooth demo flow

---

## Future Enhancements (Post-Hackathon)

- [ ] Backend API integration (Flask/FastAPI + ML models)
- [ ] Real risk prediction using trained models (XGBoost/LGBM)
- [ ] SHAP-based explainability (replace mock XAI data)
- [ ] PDF export with jsPDF or server-side generation
- [ ] User authentication and role-based access
- [ ] Real-time data sync and patient management
- [ ] Mobile-responsive design
- [ ] Dark mode toggle
- [ ] Voice input for assessments
- [ ] Integration with FHIR/HL7 health data standards
