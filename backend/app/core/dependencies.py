from collections.abc import Generator
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.database import SessionLocal
from app.models.user import User

bearer_scheme = HTTPBearer(auto_error=False)


def get_db() -> Generator[Session, None, None]:
    """Provide a request-scoped database session and roll back failures."""
    db = SessionLocal()

    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme),
    ],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    """Resolve an active user from a validated bearer token."""
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None:
        raise unauthorized

    try:
        subject = decode_access_token(credentials.credentials).get("sub")
        user_id = int(subject)
    except (jwt.PyJWTError, TypeError, ValueError, RuntimeError):
        raise unauthorized from None

    user = db.scalar(select(User).where(User.id == user_id))
    if user is None or not user.is_active:
        raise unauthorized
    return user


def require_inventory_manager(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Restrict inventory configuration changes to managers."""
    if current_user.role != "inventory_manager":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inventory manager role required",
        )
    return current_user
