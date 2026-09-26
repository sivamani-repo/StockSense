from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse, summary="Get the current profile")
def get_profile(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    """Return the authenticated user's safe profile fields."""
    return current_user


@router.put("/me", response_model=UserResponse, summary="Update the current profile")
def update_profile(
    data: UserUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Update only editable profile fields for the authenticated user."""
    changes = data.model_dump(exclude_unset=True)
    if "email" in changes and changes["email"] is not None:
        changes["email"] = str(changes["email"]).lower()
        duplicate = db.scalar(
            select(User.id).where(
                User.email == changes["email"],
                User.id != current_user.id,
            )
        )
        if duplicate is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )

    for field, value in changes.items():
        if value is not None:
            setattr(current_user, field, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        ) from None
    db.refresh(current_user)
    return current_user
