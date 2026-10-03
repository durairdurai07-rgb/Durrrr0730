from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.utils.security import read_token

bearer = HTTPBearer(auto_error=False)


def current_user(db: Session = Depends(get_db)) -> User:
    user = db.get(User, 1)
    if not user:
        user = User(
            name="Personal Workspace",
            email="workspace@local.com",
            password_hash="dummy",
            timezone="UTC"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user
