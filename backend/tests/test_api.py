import os
os.environ["DATABASE_URL"] = os.environ.get("TEST_DATABASE_URL", "sqlite:///./test.db")
os.environ["SECRET_KEY"] = "test-secret"
from datetime import date, timedelta
import pytest
from fastapi.testclient import TestClient
from alembic import command
from alembic.config import Config
from sqlalchemy import text
from app.database import Base, engine
from app.main import app as fastapi_app
from app.utils.ratelimit import reset_limits
import app.models as _models  # noqa

c = TestClient(fastapi_app)


def wipe():
    Base.metadata.drop_all(engine)
    with engine.begin() as cx:
        cx.execute(text("DROP TABLE IF EXISTS alembic_version"))


@pytest.fixture(autouse=True)
def fresh():
    # The schema under test is built by the real Alembic migrations, not create_all.
    wipe()
    command.upgrade(Config("alembic.ini"), "head")
    reset_limits()


def signup(email="a@x.com", tz="UTC"):
    r = c.post("/api/auth/register", json={"name": "A", "email": email, "password": "password1", "confirm_password": "password1", "timezone": tz})
    assert r.status_code == 201
    return {"Authorization": "Bearer " + r.json()["access_token"]}


def test_auth_flow():
    signup()
    assert c.post("/api/auth/register", json={"name": "A", "email": "a@x.com", "password": "password1", "confirm_password": "password1"}).status_code == 409
    assert c.post("/api/auth/login", json={"email": "a@x.com", "password": "wrongpass"}).status_code == 401
    r = c.post("/api/auth/login", json={"email": "a@x.com", "password": "password1"})
    assert r.status_code == 200
    assert c.post("/api/auth/refresh", json={"refresh_token": r.json()["refresh_token"]}).status_code == 200
    assert c.post("/api/auth/refresh", json={"refresh_token": r.json()["access_token"]}).status_code == 401
    assert c.post("/api/auth/register", json={"name": "B", "email": "b@x.com", "password": "password1", "confirm_password": "nope1234"}).status_code == 422


def test_protected():
    assert c.get("/api/tasks").status_code == 401
    assert c.get("/api/tasks", headers={"Authorization": "Bearer junk"}).status_code == 401


def test_new_user_is_empty():
    assert c.get("/api/tasks", headers=signup()).json() == []


def test_task_lifecycle_and_overdue():
    h = signup()
    y = (date.today() - timedelta(days=2)).isoformat()
    t = c.post("/api/tasks", headers=h, json={"title": " DBMS test ", "category": "test", "priority": "high", "due_date": y}).json()
    assert t["title"] == "DBMS test" and t["effective_status"] == "overdue" and t["status"] == "todo"
    tom = (date.today() + timedelta(days=1)).isoformat()
    r = c.patch(f"/api/tasks/{t['id']}/reschedule", headers=h, json={"due_date": tom, "due_time": "18:00:00"}).json()
    assert r["effective_status"] == "todo"
    r = c.patch(f"/api/tasks/{t['id']}/complete", headers=h).json()
    assert r["status"] == "completed" and r["completed_at"]
    assert len(c.get("/api/tasks?status=completed&q=dbms", headers=h).json()) == 1
    assert c.delete(f"/api/tasks/{t['id']}", headers=h).status_code == 204
    assert c.get(f"/api/tasks/{t['id']}", headers=h).status_code == 404


def test_validation():
    h = signup()
    assert c.post("/api/tasks", headers=h, json={"title": "  "}).status_code == 422
    assert c.post("/api/tasks", headers=h, json={"title": "x", "priority": "urgent"}).status_code == 422
    assert c.post("/api/tasks", headers=h, json={"title": "x", "due_time": "09:00"}).status_code == 422


def test_user_isolation():
    a, b = signup("a@x.com"), signup("b@x.com")
    t = c.post("/api/tasks", headers=a, json={"title": "private"}).json()
    assert c.get("/api/tasks", headers=b).json() == []
    for call in (lambda: c.get(f"/api/tasks/{t['id']}", headers=b), lambda: c.delete(f"/api/tasks/{t['id']}", headers=b),
                 lambda: c.patch(f"/api/tasks/{t['id']}/complete", headers=b), lambda: c.post(f"/api/tasks/{t['id']}/subtasks", headers=b, json={"title": "x"})):
        assert call().status_code == 404


def test_subtasks():
    h = signup()
    t = c.post("/api/tasks", headers=h, json={"title": "Hackathon"}).json()
    s = c.post(f"/api/tasks/{t['id']}/subtasks", headers=h, json={"title": "Demo"}).json()
    assert c.patch(f"/api/tasks/{t['id']}/subtasks/{s['id']}/toggle", headers=h).json()["completed"] is True
    assert c.get(f"/api/tasks/{t['id']}", headers=h).json()["subtasks"][0]["completed"] is True


def test_migrations_roundtrip():
    cfg = Config("alembic.ini")
    command.downgrade(cfg, "base")
    from sqlalchemy import inspect
    assert "tasks" not in inspect(engine).get_table_names()
    command.upgrade(cfg, "head")
    assert {"users", "tasks", "subtasks", "password_reset_tokens"} <= set(inspect(engine).get_table_names())


def test_password_reset_flow(monkeypatch):
    sent = []
    monkeypatch.setattr("app.routes.auth.send_email", lambda to, subj, body: sent.append((to, body)))
    h = signup("r@x.com")
    # unknown email gets the same answer and sends nothing
    assert c.post("/api/auth/forgot-password", json={"email": "nobody@x.com"}).status_code == 202
    assert sent == []
    assert c.post("/api/auth/forgot-password", json={"email": "r@x.com"}).status_code == 202
    assert len(sent) == 1
    token = sent[0][1].split("token=")[1].split()[0]
    bad = {"token": "x" * 20, "password": "newpassword1", "confirm_password": "newpassword1"}
    assert c.post("/api/auth/reset-password", json=bad).status_code == 400
    good = {"token": token, "password": "newpassword1", "confirm_password": "newpassword1"}
    assert c.post("/api/auth/reset-password", json={**good, "confirm_password": "mismatch123"}).status_code == 422
    assert c.post("/api/auth/reset-password", json=good).status_code == 200
    assert c.post("/api/auth/reset-password", json=good).status_code == 400  # single use
    assert c.get("/api/tasks", headers=h).status_code == 401  # old session revoked
    assert c.post("/api/auth/login", json={"email": "r@x.com", "password": "password1"}).status_code == 401
    assert c.post("/api/auth/login", json={"email": "r@x.com", "password": "newpassword1"}).status_code == 200


def test_expired_reset_token(monkeypatch):
    from datetime import timedelta
    from sqlalchemy import update
    from app.database import SessionLocal
    from app.models import PasswordResetToken, now
    sent = []
    monkeypatch.setattr("app.routes.auth.send_email", lambda to, subj, body: sent.append(body))
    signup("e@x.com")
    c.post("/api/auth/forgot-password", json={"email": "e@x.com"})
    with SessionLocal() as db:
        db.execute(update(PasswordResetToken).values(expires_at=now() - timedelta(minutes=1)))
        db.commit()
    token = sent[0].split("token=")[1].split()[0]
    r = c.post("/api/auth/reset-password", json={"token": token, "password": "newpassword1", "confirm_password": "newpassword1"})
    assert r.status_code == 400


def test_logout_revokes_tokens():
    r = c.post("/api/auth/register", json={"name": "A", "email": "l@x.com", "password": "password1", "confirm_password": "password1"}).json()
    h = {"Authorization": "Bearer " + r["access_token"]}
    assert c.post("/api/auth/logout", headers=h).status_code == 204
    assert c.get("/api/auth/me", headers=h).status_code == 401
    assert c.post("/api/auth/refresh", json={"refresh_token": r["refresh_token"]}).status_code == 401


def test_login_rate_limit():
    for _ in range(10):
        c.post("/api/auth/login", json={"email": "z@x.com", "password": "whatever1"})
    assert c.post("/api/auth/login", json={"email": "z@x.com", "password": "whatever1"}).status_code == 429
