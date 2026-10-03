# MY DAY — backend

    docker compose up -d db              # from repo root, or use any PostgreSQL 14+
    python -m venv .venv && source .venv/bin/activate
    pip install -r requirements.txt
    cp .env.example .env                 # set DATABASE_URL and SECRET_KEY (openssl rand -hex 32)
    alembic upgrade head                 # creates the schema
    uvicorn app.main:app --reload        # API docs at /docs

New migration after changing models:  alembic revision --autogenerate -m "describe change"

## Tests
    python -m pytest -q                                              # SQLite
    TEST_DATABASE_URL=postgresql+psycopg://user:pw@localhost/test_db python -m pytest -q   # PostgreSQL
Tests build the schema with the real Alembic migrations (and test downgrade/upgrade).
Use a throwaway database for TEST_DATABASE_URL: the tests drop all tables.

## Auth behaviour
- Logout and password reset revoke all existing sessions (token_version).
- Password reset: the link is emailed (EMAIL_BACKEND=smtp) or only logged (console, dev). Links are single-use, expire after RESET_TOKEN_MINUTES, and only a hash is stored.
- Rate limits (login, register, forgot/reset) are in-memory per process. Use Redis if you run several workers.

## Not built yet
Reminders/notifications worker, calendar API, projects/homework/studies/exams/hackathons/events,
analytics, focus sessions, import/export, attachments, profile/settings endpoints, activity history.
