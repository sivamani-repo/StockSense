"""Inventory adjustments router."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.adjustment import Adjustment
from app.models.user import User
from app.schemas.adjustment import AdjustmentCreate, AdjustmentResponse, AdjustmentStatus
from app.services import adjustment as adjustment_service


router = APIRouter(prefix="/adjustments", tags=["Adjustments"])


@router.post("", response_model=AdjustmentResponse, status_code=201, summary="Create an adjustment")
def create_adjustment(
    data: AdjustmentCreate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> Adjustment:
    return adjustment_service.create_adjustment(db, data, user.id)


@router.get("", response_model=list[AdjustmentResponse], summary="List adjustments")
def list_adjustments(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
    status_filter: AdjustmentStatus | None = Query(default=None, alias="status"),
    location_id: int | None = Query(default=None, gt=0),
) -> list[Adjustment]:
    return adjustment_service.list_adjustments(
        db, status_filter=status_filter, location_id=location_id
    )


@router.get("/{adjustment_id}", response_model=AdjustmentResponse, summary="Get an adjustment")
def get_adjustment(
    adjustment_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
) -> Adjustment:
    return adjustment_service.get_adjustment(db, adjustment_id)


@router.post(
    "/{adjustment_id}/apply",
    response_model=AdjustmentResponse,
    summary="Apply an adjustment and update stock",
)
def apply_adjustment(
    adjustment_id: int,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> Adjustment:
    return adjustment_service.apply_adjustment(db, adjustment_id, user.id)


@router.post(
    "/{adjustment_id}/cancel",
    response_model=AdjustmentResponse,
    summary="Cancel an unprocessed adjustment",
)
def cancel_adjustment(
    adjustment_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
) -> Adjustment:
    return adjustment_service.cancel_adjustment(db, adjustment_id)
