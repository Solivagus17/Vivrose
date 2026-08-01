# VivRose Backend

Flask API for VivRose — verifies Firebase ID tokens and serves the family health
account backed by Supabase (Postgres) tables.

## Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate            # Windows
python -m pip install -r requirements.txt

copy .env.example .env            # then fill in real values
flask --app run.py run --port 5000
```

## Auth model

- The React app signs the user in with **Firebase** (email/password or Google)
  and sends the Firebase **ID token** as `Authorization: Bearer <token>`.
- The backend verifies the token with `firebase-admin` and provisions a
  `profiles` + `households` row for the user on first request.
- Every query is scoped to that user's `household_id`.
- Dev shortcut: set `FIREBASE_ALLOW_UNVERIFIED=1` to accept any token
  (never enable in production).

## Endpoints (all under `/api`, all require the bearer token)

| Method | Path | Purpose |
|---|---|---|
| GET | `/auth/me` | Provision + return user / household |
| GET / POST | `/members`, `/members/bulk` | List / create / bulk-sync family members |
| PUT / DELETE | `/members/<id>` | Update / delete a member |
| GET | `/members/<id>/insights` | Past assessment snapshots for a member |
| POST | `/assessments` | Run the rule-based risk engine, save snapshot |
| POST | `/assistant/chat` | Rule-based chat reply using real data |
| GET / POST | `/insights` | List / store insight snapshots |
| GET / POST | `/doctors`, `/doctors/bulk` | Care team CRUD + bulk-sync |
| GET / POST | `/checkups`, `/checkups/bulk` | Checkups CRUD + bulk-sync |
| GET / POST | `/medicines`, `/medicines/bulk` | Medicines CRUD + bulk-sync |
| GET / POST | `/reports`, `/reports/bulk` | Reports CRUD + bulk-sync |
| POST | `/reports/upload` | Upload a report file to Supabase Storage |
| GET | `/dashboard` | Aggregate stats + alerts for the dashboard |

`bulk` endpoints reconcile: they upsert the sent list and delete rows in the
same household that aren't in it — this is how the frontend keeps its cache in
sync with the database.

## Tests

```bash
cd backend
python -m pytest -q
```
