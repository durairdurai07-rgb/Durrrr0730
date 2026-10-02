from datetime import datetime, timedelta, timezone
import bcrypt, jwt
from app.config.settings import settings


def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode()[:72], bcrypt.gensalt()).decode()


def verify_password(pw: str, hashed: str) -> bool:
    return bcrypt.checkpw(pw.encode()[:72], hashed.encode())


def make_token(user_id: int, kind: str, version: int = 0) -> str:
    delta = timedelta(minutes=settings.access_token_minutes) if kind == "access" else timedelta(days=settings.refresh_token_days)
    payload = {"sub": str(user_id), "type": kind, "ver": version, "exp": datetime.now(timezone.utc) + delta}
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")


def read_token(token: str, kind: str) -> tuple[int, int] | None:
    try:
        p = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
    except jwt.PyJWTError:
        return None
    return (int(p["sub"]), int(p.get("ver", 0))) if p.get("type") == kind else None


def new_reset_token() -> tuple[str, str]:
    """Returns (raw token for the email link, sha256 hash stored in the DB)."""
    import hashlib, secrets
    raw = secrets.token_urlsafe(32)
    return raw, hashlib.sha256(raw.encode()).hexdigest()


def hash_reset_token(raw: str) -> str:
    import hashlib
    return hashlib.sha256(raw.encode()).hexdigest()
