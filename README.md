# VivRose

> **Predict. Prevent. Prosper.** — AI-powered preventive healthcare platform for families.

VivRose is a frontend-only React single-page application. One family health manager account can manage multiple family members — with AI-generated risk scores, explainable health insights, check-up suggestions, alerts, specialist referrals, printable health reports, and multilingual health education.

> **Note:** This is a demo build. All clinical data and "AI" output are mocked (`src/data/data.js`) — there is no backend, no API, and no persistence (members added at runtime are lost on refresh).

---

## Prerequisites

- **Node.js 18+** (Vite 5 requirement)
- **npm** (bundled with Node)

Check your versions:

```bash
node -v
npm -v
```

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Vite starts the dev server at **http://localhost:5173** (the app uses a hash router, so any URL works without server configuration).

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Build a production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run smoke` | Run the SSR smoke test across all pages |

---

## Verification

```bash
# Production build
npm run build

# SSR smoke test (renders every page; fails on empty/small renders)
npm run smoke
```

Recommended after any change: `npm run build` then `npm run smoke`.

---

## Using the App

### Demo flow
1. **Landing page** — hero screen; click **"Start with My Family"** or **"Take a Health Assessment"**.
2. **Dashboard** (`#/app`) — family overview with stats, member list, and alerts.
3. **Family Members** (`#/app/family`) — searchable card grid; **Add Member** opens a modal (date of birth auto-calculates age, plus birth location and current residence; relation is free text) and the pencil icon edits a member.
4. **VivRose AI** (`#/app/ai-assistant`) — a chat assistant in the sidebar (gradient button above Overview) that answers questions about family risk scores, vitals, and next steps.
5. **AI Assessment** (`#/app/assessment`) — 6-step wizard; pick who the assessment is for, then **Fetch from Report** to auto-fill from their stored profile, or enter data manually. **Generate AI Assessment** runs the simulated AI analysis.
6. **AI Insights** (`#/app/insights/past`) — the selected member's risk scores, AI summary, explainable factors, check-ups, alerts, and referrals. See the full history of past generated assessments for any family member and switch between them.
7. **Generate AI Report** (`#/app/generate-report`) — print-ready clinical report for the selected member (**Print** → save as PDF).
8. **Reports** (`#/app/reports`) — medical report library with search and a type-filter dropdown; **Upload Report** (`#/app/reports/upload`) and **edit** (`#/app/reports/:id/edit`) pages categorize each report by type, date, hospital/clinic, doctor, purpose, and remark.
9. **Doctors** (`#/app/doctors`) — manage the family's care team; **Add Doctor** (`#/app/doctors/add`) and **edit** (`#/app/doctors/:id/edit`) record specialty, hospital/clinic, phone, email, city, and notes.
10. **Medicines** (`#/app/medicines`) — track medicine courses with dosage, frequency, timing, prescribed doctor, and status; **Add Medicine** (`#/app/medicines/add`) and **edit** (`#/app/medicines/:id/edit`) manage course details.
10. **Upcoming Checkups** (on `#/app/doctors`) — schedule checkups per doctor (purpose, date, time, location, notes, status) with **Add Checkup** (`#/app/checkups/add`) and **edit** (`#/app/checkups/:id/edit`) pages, per-row complete/delete, and Scheduled/Completed/Cancelled filters.
11. **Health Insights** (`#/app/health`) — family-level analytics.
12. **Health Education** (`#/app/education`) — tabs in English / हिन्दी / ગુજરાતી.

### Keyboard shortcuts
| Shortcut | Action |
|---|---|
| `Ctrl + K` | Focus member search (Family Members) |
| `Escape` | Return to Dashboard |

---

## Project Structure

```
Tetrathon/
├── index.html               # Vite entry HTML
├── package.json             # Scripts & dependencies
├── vite.config.js           # Vite configuration
├── memory.md                # Project memory / design-system reference
├── ARCHITECTURE.md          # Codebase architecture documentation
├── scripts/
│   └── smoke.mjs            # SSR smoke test
└── src/
    ├── main.jsx             # Entry: createRoot + HashRouter
    ├── App.jsx              # Route table (wrapped in MemberProvider)
    ├── routes.js            # Centralized route paths
    ├── memberContext.jsx    # Family member list + active-member state
    ├── layout/
    │   └── AppShell.jsx     # Sidebar + routed page frame
    ├── components/          # Pages + shared UI primitives (ui.jsx, Icon.jsx)
    ├── data/
    │   └── data.js          # All mock data + profile builder
    └── styles/
        └── global.css       # Design system + all page styles
```

See **`ARCHITECTURE.md`** for a full walkthrough of the codebase.

---

## Tech Stack

- **React 18** + React Router 7 (HashRouter)
- **Vite 5** (build tool & dev server)
- **Vanilla CSS** with custom properties (no UI framework)
- **Inline SVG icons** (no icon library)
