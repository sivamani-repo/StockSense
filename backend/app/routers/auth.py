import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_db
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


@router.post(
    "/signup",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create an account",
)
def signup(
    data: UserCreate,
    db: Annotated[Session, Depends(get_db)],
) -> UserResponse:
    """Register a user and return only safe profile fields."""
    return register_user(db, data)


@router.post(
    "/login",
    response_model=AccessTokenResponse,
    summary="Exchange credentials for an access token",
)
def login(
    data: LoginRequest,
    db: Annotated[Session, Depends(get_db)],
) -> AccessTokenResponse:
    """Authenticate a user and issue a signed bearer token."""
    user = authenticate_user(db, str(data.email), data.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        token = issue_access_token(user)
    except RuntimeError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(error),
        ) from None
    logger.info("User authenticated: id=%s", user.id)
    return AccessTokenResponse(access_token=token)


@router.post(
    "/request-password-reset",
    response_model=PasswordResetRequestResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Request a password-reset code",
)
def password_reset_request(
    data: PasswordResetRequest,
    db: Annotated[Session, Depends(get_db)],
) -> PasswordResetRequestResponse:
    """Issue a short-lived code without revealing account existence."""
    try:
        otp = request_password_reset(db, str(data.email))
    except RuntimeError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(error),
        ) from None

    logger.info("Password reset requested")
    development_otp = otp if settings.environment == "development" else None
    return PasswordResetRequestResponse(
        message="If the account exists, a reset code has been issued.",
        development_otp=development_otp,
    )


@router.post(
    "/reset-password",
    response_model=MessageResponse,
    summary="Reset a password with a one-time code",
)
def password_reset(
    data: PasswordResetConfirm,
    db: Annotated[Session, Depends(get_db)],
) -> MessageResponse:
    """Verify the one-time code and replace the stored password hash."""
    reset_password(db, str(data.email), data.otp, data.new_password)
    return MessageResponse(message="Password has been reset")
