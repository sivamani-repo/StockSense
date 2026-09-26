"""Authentication router: signup, login, Google OAuth, password reset."""

import logging
import os
import secrets
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.security import hash_password
from app.models.user import User
from app.schemas.auth import (
    AccessTokenResponse,
    LoginRequest,
    MessageResponse,
    PasswordResetConfirm,
    PasswordResetRequest,
    PasswordResetRequestResponse,
)
from app.schemas.user import UserCreate, UserResponse
from app.services.auth import (
    authenticate_user,
    issue_access_token,
    register_user,
    request_password_reset,
    reset_password,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])

GOOGLE_CLIENT_ID = os.getenv(
    "GOOGLE_CLIENT_ID",
    "1073703705473-lgshslpelhvlaq23tm9garub7eoiimdo.apps.googleusercontent.com",
)


# ------------------------------------------------------------------
# Email / Password
# ------------------------------------------------------------------


class GoogleAuthRequest:
    """Body for /auth/google."""

    def __init__(self, id_token: str):
        self.id_token = id_token


from pydantic import BaseModel


class GoogleAuthBody(BaseModel):
    id_token: str


@router.post(
    "/signup",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
def signup(
    data: UserCreate,
    db: Annotated[Session, Depends(get_db)],
) -> User:
    return register_user(db, data)


@router.post(
    "/login",
    response_model=AccessTokenResponse,
    summary="Authenticate with email and password",
)
def login(
    data: LoginRequest,
    db: Annotated[Session, Depends(get_db)],
) -> AccessTokenResponse:
    user = authenticate_user(db, str(data.email), data.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    token = issue_access_token(user)
    return AccessTokenResponse(access_token=token)


# ------------------------------------------------------------------
# Google OAuth
# ------------------------------------------------------------------


@router.post(
    "/google",
    response_model=AccessTokenResponse,
    summary="Sign in or register with a verified Google account",
)
def google_auth(
    data: GoogleAuthBody,
    db: Annotated[Session, Depends(get_db)],
) -> AccessTokenResponse:
    """Verify a Google ID token, find-or-create the user, and issue a StockSense JWT."""
    try:
        import httpx

        resp = httpx.get(
            f"https://oauth2.googleapis.com/tokeninfo?id_token={data.id_token}",
            timeout=10,
        )
        if resp.status_code != 200:
            raise ValueError("Token verification failed")
        payload = resp.json()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Google token",
        ) from None

    if payload.get("aud") != GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token audience mismatch",
        )

    email = payload.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account did not provide an email address",
        )

    if not payload.get("email_verified", "false") in ("true", True):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google email address is not verified",
        )

    google_sub = payload.get("sub")
    name = payload.get("name") or email.split("@", 1)[0]

    user = db.query(User).filter(User.email == email).first()

    if user is None:
        user = User(
            name=name,
            email=email,
            hashed_password=hash_password(secrets.token_urlsafe(32)),
            google_id=google_sub,
            is_active=True,
        )
        db.add(user)
        try:
            db.commit()
        except Exception:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Could not create account, please try again",
            ) from None
        db.refresh(user)
    else:
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account has been disabled",
            )
        if not user.google_id:
            user.google_id = google_sub
            db.commit()
            db.refresh(user)

    try:
        token = issue_access_token(user)
    except RuntimeError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(error),
        ) from None

    logger.info("Google user authenticated: id=%s", user.id)
    return AccessTokenResponse(access_token=token)


# ------------------------------------------------------------------
# Password Reset
# ------------------------------------------------------------------


@router.post(
    "/request-password-reset",
    response_model=PasswordResetRequestResponse,
    summary="Request an OTP for password reset",
)
def request_reset(
    data: PasswordResetRequest,
    db: Annotated[Session, Depends(get_db)],
) -> PasswordResetRequestResponse:
    from app.core.config import settings

    otp = request_password_reset(db, str(data.email))
    response = PasswordResetRequestResponse(
        message="If that email exists, an OTP has been sent."
    )
    if otp is not None and settings.environment == "development":
        response.development_otp = otp
    return response


@router.post(
    "/reset-password",
    response_model=MessageResponse,
    summary="Reset password using OTP",
)
def confirm_reset(
    data: PasswordResetConfirm,
    db: Annotated[Session, Depends(get_db)],
) -> MessageResponse:
    reset_password(db, str(data.email), data.otp, data.new_password)
    return MessageResponse(message="Password has been reset successfully")