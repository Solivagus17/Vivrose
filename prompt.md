# Prompt: Build the VivRose Backend (Python Flask)

You are a senior backend engineer. Build a complete REST API backend in **Python (Flask)** for **VivRose** — an AI-powered preventive healthcare platform for families. Below is everything you need to know about the frontend app you are serving, the exact data models it uses, the API surface required, and the quality bar for the deliverable.

---

## 1. Project Context

VivRose lets one family health manager account look after multiple family members (currently one account manages up to five: Self, Wife, Father, Mother, Son). The app provides:

- AI risk assessments per member (percentage risk scores for diseases like Diabetes, Hypertension, CVD, CKD, Stroke)
- Explainable AI (ranked impact factors behind each score)
- AI health summaries, key findings, lifestyle actions, action checklists
- Suggested check-ups, health alerts, and specialist referrals
- Past assessments history per member (snapshots that can be revisited)
- A chat assistant ("VivRose AI") that answers questions about the family's health
- A doctors/care-team directory with upcoming checkups
- A medicine course tracker
- A medical report library (with file upload)
- Family-level analytics and multilingual health education

The **frontend is a React SPA** (React 18 + React Router, Vite) that currently persists everything in **`localStorage`** (one key per resource, e.g. `vivrose.checkups.v1`, `vivrose.medical-reports.v1`). There is no backend today. Your job is to create the backend that the frontend will call instead.

### Important integration constraint

Match the **JSON field names and response shapes below exactly** so the frontend can swap its `localStorage` stores for `fetch()` calls with minimal changes. Use snake_case for database columns but return **camelCase JSON keys** matching the schemas below (set `SQLAlchemy` column names and serialize explicitly).

---

## 2. Tech Stack (use these)

- **Python 3.11+**
- **Flask** + `flask-cors` (CORS enabled for the Vite dev server)
- **Flask-SQLAlchemy** for ORM
- **Flask-Migrate** for migrations
- **JWT auth** (`flask-jwt-extended` or PyJWT)
- **SQLite** for development, with a clean path to switch to PostgreSQL in production
- **Pytest** for tests
- Data validation/serialization with **marshmallow** (or Pydantic if preferred)
- Password hashing with **werkzeug.security** (`generate_password_hash` / `check_password_hash`)

---

## 3. Data Models

Define these tables with the exact fields shown (camelCase shown is the API shape; DB column names are the snake_case equivalent). All resources belong to a family (via the authenticated user's household) unless noted.

### User / Family Manager
- `id` (string UUID), `name`, `email` (unique), `passwordHash`
- One manager creates a `household`; all members/doctors/medicines/etc. belong to that household.
- `id` values in the UI are short strings like `rajesh`, `doc-seed-1`, `chk-seed-1`. Generate short, unique, human-friendly IDs server-side (prefix convention from the frontend, below).

### Member
Frontend reference (see `src/data/data.js` + `createFamilyMember`): `id, initials, name, relation, age, birthDate, birthLocation, sex, avatar, level, risk, status, lastAssessed, assessed, location, bmi, bmiClass, bp, hba1c, smoking, conditions, medications, familyHistory, glucose, cholesterol, creatinine, scores, factors, checkups, warnings, recommendations, summary, reportSummary, findings, checkupList, recommendationList, lifestyle`

Notes:
- `initials`, `age`, and `avatar` are **derived**, not stored: `initials` from name, `age` computed from `birthDate`, `avatar` derived from risk level color.
- `relation` is free text (e.g. "Father", "Sister").
- `scores`: array of `{ label, score, level ('low'|'moderate'|'high'), trend, trendLabel, points, color }`.
- `factors`: array of `{ name, value, width, gradient, impact ('low'|'moderate'|'high'), impactLabel }`.
- `checkups` (suggested tests): array of `{ icon, name, rationale }`.
- `warnings`: array of `{ level, icon, title, desc }`.
- `recommendations` (referrals): array of `{ icon, specialty, reason, priority, priorityClass, timeline }`.
- `findings`, `checkupList`, `recommendationList`, `lifestyle`: string arrays.
- `summary` / `reportSummary`: HTML strings.

Store `scores`, `factors`, `checkups`, `warnings`, `recommendations`, and the string arrays as **JSON** columns (or a serialized text column) to keep the API shape 1:1.

### InsightSnapshot (past assessments)
`id, memberId, memberName, memberInitials, createdAt (ISO datetime), member (full member JSON snapshot)`

Created whenever an assessment runs, so the UI can show history per member.

### Doctor
`id, name, specialty, hospital, phone, email, city, notes`

Specialties come from a fixed list (General Physician, Cardiologist, Endocrinologist, Dermatologist, ENT Specialist, Gastroenterologist, Gynecologist, Nephrologist, Neurologist, Nutritionist / Dietitian, Oncologist, Ophthalmologist, Orthopedist, Pediatrician, Physiotherapist, Psychiatrist, Pulmonologist, Urologist, Dentist, Other).

### Checkup
`id, doctorId, doctorName, purpose, date (YYYY-MM-DD), time (HH:MM), location, notes, status ('Scheduled'|'Completed'|'Cancelled')`

### Medicine
`id, name, purpose, dosage, frequency, timing, prescribedBy, startDate (YYYY-MM-DD), endDate (YYYY-MM-DD or ''), status ('Active'|'Completed'|'Discontinued'), remark`

Frequency from a fixed list: `Once Daily (OD), Twice Daily (BD), Three Times Daily (TDS), Four Times Daily (QID), Every Other Day, Once Weekly, As Needed (PRN)`.

### Report
`id, fileName, fileSize, type, date (YYYY-MM-DD), hospital, doctor, purpose, remark` + a stored file blob/path (see File Uploads below).

Report types from a fixed list: `Blood Test, Urine Test, Imaging / Radiology, ECG / Cardiac, Pathology / Biopsy, Prescription, Specialist Consultation, Discharge Summary, Vaccination Record, Other`.

### Dashboard & Analytics (read-only endpoints)
The dashboard needs: family size, high-risk member count, assessments count, pending check-ups, health alerts list, per-member latest stats. Family-level analytics endpoints should return trend/aggregate data (e.g., number of members per risk level, top contributing risk factors across the family).

---

## 4. API Endpoints

Prefix everything under `/api`. Return JSON. Standard error shape: `{ "error": "message" }` with the appropriate HTTP status (400/401/403/404/409).

### Auth
- `POST /api/auth/register` — create family manager account + household (body: name, email, password)
- `POST /api/auth/login` — returns `{ "token": "<jwt>", "user": {...} }`
- `GET /api/auth/me` — current user + household info (JWT protected)

### Members
- `GET /api/members` — list all members in the household
- `POST /api/members` — create (body: name, relation, sex, birthDate, birthLocation, location)
- `GET /api/members/<id>`
- `PUT /api/members/<id>` — update profile fields; recompute derived fields (`initials`, `age`)
- `DELETE /api/members/<id>` — 409 if it's the last member (UI enforces minimum 1)
- `GET /api/members/<id>/insights` — list InsightSnapshots for a member, newest first

### Assessments
- `POST /api/assessments` — body: `{ memberId, data: {...form inputs...} }`. Runs the assessment engine (Section 5), stores an InsightSnapshot, and returns the full generated member profile (same shape as the `member` object above, including `scores`, `factors`, `summary`, `findings`, etc.).

### Chat Assistant
- `POST /api/assistant/chat` — body: `{ message }`. Returns `{ "reply": "..." }`. The reply should reference real family data (member risk levels, vitals, top scores). See Section 5.

### Doctors
- `GET /api/doctors`, `POST /api/doctors`, `GET /api/doctors/<id>`, `PUT /api/doctors/<id>`, `DELETE /api/doctors/<id>`

### Checkups
- `GET /api/checkups` (support `?status=Scheduled` filter and `?doctorId=` filter)
- `POST /api/checkups`, `GET /api/checkups/<id>`, `PUT /api/checkups/<id>`, `DELETE /api/checkups/<id>`

### Medicines
- `GET /api/medicines`, `POST /api/medicines`, `GET /api/medicines/<id>`, `PUT /api/medicines/<id>`, `DELETE /api/medicines/<id>`

### Reports
- `GET /api/reports`, `GET /api/reports/<id>`, `PUT /api/reports/<id>`, `DELETE /api/reports/<id>`
- `POST /api/reports/upload` — `multipart/form-data`: file + metadata fields. Store the file, save the record, return the created report.

### Dashboard & Analytics
- `GET /api/dashboard` — stats + alerts
- `GET /api/analytics/family` — aggregate analytics

---

## 5. AI / Rule-Based Engines (simulate, don't fake)

There is no external ML API. Implement **deterministic, explainable rule-based engines in Python** that produce results consistent with the frontend's current mock data:

1. **Risk assessment engine** — given a member's demographics, lifestyle, symptoms, history, vitals, and labs, compute:
   - `scores` (per disease, 0–100) with `level` thresholds (low < 30, moderate 30–60, high > 60), `trend`, `trendLabel`, sparkline `points`, and `color`
   - `factors` ranked by impact with normalized `width` (0–100)
   - `summary` (HTML), `findings`, `lifestyle` actions, `checkupList`, `recommendationList`
   - `checkups` (suggested tests with rationale), `warnings` (with severity), `recommendations` (referrals with priority + timeline)
   - Document the scoring rules clearly in code (weighted points per risk factor per disease). Results must be stable (same input → same output).

2. **Chat assistant** — a rule-based responder that parses the user's message (keyword + member-name matching) and answers using real data from the database: e.g. "Who has the highest risk?", "What's the diabetes picture?", "Tell me about Rajesh", "Any check-ups due?". Return the reply string only.

3. **Derived fields** — `age` from `birthDate`, `initials` from name, risk-level `avatar`.

---

## 6. Seed Data

On first run, seed the database with the same demo household the frontend uses today (see `src/data/data.js` — members Arjun, Kavya, Rajesh, Sunita, Aarav) plus seed doctors, checkups, medicines, reports, and one InsightSnapshot per member. This keeps the demo flow working end-to-end.

---

## 7. Project Structure (deliver this layout)

```
backend/
├── app/
│   ├── __init__.py          # create_app factory (Flask, CORS, JWT, blueprints)
│   ├── config.py            # env-driven config (SQLite default)
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # marshmallow/pydantic serializers
│   ├── auth.py              # register/login/me routes + JWT helpers
│   ├── routes/
│   │   ├── members.py
│   │   ├── assessments.py
│   │   ├── assistant.py
│   │   ├── doctors.py
│   │   ├── checkups.py
│   │   ├── medicines.py
│   │   ├── reports.py
│   │   └── analytics.py
│   ├── services/
│   │   ├── risk_engine.py   # scoring + summary generation
│   │   ├── assistant.py     # chat responder
│   │   └── seed.py          # seed data
│   └── utils.py             # id generation, derived-field helpers, error handlers
├── tests/                   # pytest suite
├── requirements.txt
├── .env.example
├── run.py                   # dev runner
└── README.md                # how to run, env vars, API summary
```

---

## 8. Requirements & Quality Bar

- **Auth**: All endpoints except `register`/`login` require a valid JWT. Every query is scoped to the authenticated household — never return another household's data.
- **Validation**: Reject invalid input with clear 400 messages (bad dates, unknown status values, unknown specialty/type/frequency values, empty required fields, future birth dates).
- **Security**: hash passwords, never log secrets, protect uploads from path traversal (store files with safe random names under an uploads dir), limit upload size.
- **Error handling**: consistent `{ "error": "..." }` shape; global error handlers for 400/404/500.
- **Tests**: pytest covering auth (register/login/protected routes), full CRUD for each resource, household isolation (a second user cannot see the first's data), the assessment engine (deterministic, valid score ranges), chat responder (known keywords), and upload (valid + oversized/invalid file).
- **Docs**: a short README with setup, env vars, and the endpoint list; keep the frontend contract in mind — list the JSON response shapes.

## 9. Deliverables

1. The full Flask backend implementing everything above.
2. Passing test suite (`pytest`).
3. README with run instructions and API documentation.
4. A note in the README describing how the frontend would connect (base URL `/api`, JWT in `Authorization: Bearer <token>` header).

## Acceptance Criteria

- `flask run` boots the API; seed data is present on first run.
- Register → login → create a member → run an assessment → chat → CRUD doctors/checkups/medicines/reports all work end-to-end via `curl` or the test suite.
- Risk scores are computed by documented rules, are stable, and stay within 0–100.
- No cross-household data leakage (tested).
- All JSON keys match the frontend schemas in Section 3.
