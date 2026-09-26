import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.models.password_reset import PasswordResetToken
from app.models.user import User
from app.schemas.user import UserCreate

MAX_RESET_ATTEMPTS = 5
RESET_REQUEST_COOLDOWN_SECONDS = 60


def register_user(db: Session, data: UserCreate) -> User:
    email = str(data.email).lower()
    if db.scalar(select(User.id).where(User.email == email)) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user = User(
        name=data.name,
        email=email,
        hashed_password=hash_password(data.password),
        role=data.role,
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        ) from None
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = db.scalar(select(User).where(User.email == email.lower()))
    if user is None or not user.is_active:
        return None
    return user if verify_password(password, user.hashed_password) else None


def issue_access_token(user: User) -> str:
    return create_access_token(str(user.id))


def _otp_digest(user_id: int, otp: str) -> str:
    secret = settings.jwt_secret
    if len(secret.encode("utf-8")) < 32:
        raise RuntimeError("JWT_SECRET must contain at least 32 bytes")
    return hmac.new(
        secret.encode("utf-8"),
        f"{user_id}:{otp}".encode(),
        hashlib.sha256,
    ).hexdigest()


def request_password_reset(db: Session, email: str) -> str | None:
    user = db.scalar(select(User).where(User.email == email.lower()))
    if user is None or not user.is_active:
        return None

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    latest = db.scalar(
        select(PasswordResetToken)
        .where(PasswordResetToken.user_id == user.id)
        .order_by(PasswordResetToken.created_at.desc())
        .limit(1)
    )
    if latest and latest.created_at:
        created_at = latest.created_at.replace(tzinfo=None)
        if (now - created_at).total_seconds() < RESET_REQUEST_COOLDOWN_SECONDS:
            return None

    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.used_at.is_(None),
    ).update({PasswordResetToken.used_at: now}, synchronize_session=False)

    otp = f"{secrets.randbelow(1_000_000):06d}"
    token = PasswordResetToken(
        user_id=user.id,
        otp_hash=_otp_digest(user.id, otp),
        expires_at=now + timedelta(minutes=settings.otp_expiry_minutes),
        created_at=now,
    )
    db.add(token)
    db.commit()
    return otp


def reset_password(db: Session, email: str, otp: str, new_password: str) -> None:
    user = db.scalar(select(User).where(User.email == email.lower()))
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    token = None
    if user is not None:
        token = db.scalar(
            select(PasswordResetToken)
            .where(PasswordResetToken.user_id == user.id)
            .order_by(PasswordResetToken.created_at.desc())
            .limit(1)
        )

    if (
        user is None
        or token is None
        or token.used_at is not None
        or token.attempts >= MAX_RESET_ATTEMPTS
        or token.expires_at.replace(tzinfo=None) <= now
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset code",
        )

    if not hmac.compare_digest(token.otp_hash, _otp_digest(user.id, otp)):
        token.attempts += 1
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset code",
        )

    user.hashed_password = hash_password(new_password)
    token.used_at = now
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.id != token.id,
        PasswordResetToken.used_at.is_(None),
    ).update({PasswordResetToken.used_at: now}, synchronize_session=False)
    db.commit()
