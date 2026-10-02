# MY DAY — Plan it. Remember it. Finish it.

Full-stack personal task and deadline manager.
React + TypeScript + Vite + Tailwind  →  FastAPI  →  SQLAlchemy  →  PostgreSQL

## Run it locally
1. Database:   docker compose up -d db
2. Backend:    cd backend && python -m venv .venv && source .venv/bin/activate
               pip install -r requirements.txt && cp .env.example .env
               (edit .env: set SECRET_KEY with `openssl rand -hex 32`; DATABASE_URL matches docker-compose)
               alembic upgrade head && uvicorn app.main:app --reload
3. Frontend:   cd frontend && npm install && npm run dev      → http://localhost:5173

Production build:  cd frontend && npm run build   (static files in dist/)
Tests:             cd backend && python -m pytest -q
Details: backend/README.md and frontend/README.md.

## What works today
Register, login, logout (revokes sessions), forgot/reset password, tasks (CRUD, complete, reschedule,
subtasks, duplicate, search/filter/sort), dashboard, Today, Upcoming, Completed, light/dark/system theme,
responsive layout. Database changes go through Alembic migrations.

## Not built yet
Reminders and notifications, calendar, projects/homework/studies/exams/hackathons/events,
analytics, focus mode, settings/profile, export/import, attachments, activity history.
