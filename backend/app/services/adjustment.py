"""Adjustment service: create, list, apply, cancel inventory adjustments."""

import logging
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.adjustment import Adjustment, AdjustmentItem
from app.models.location import Location
from app.models.product import Product
from app.schemas.adjustment import AdjustmentCreate
from app.services.stock import set_location_quantity


logger = logging.getLogger(__name__)


def _not_found(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


def _invalid_state(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)


def create_adjustment(db: Session, data: AdjustmentCreate, user_id: int) -> Adjustment:
    location = db.get(Location, data.location_id)
    if location is None:
        raise _not_found("Location not found")
    if not location.is_active:
        raise _invalid_state("Location is inactive")
    for item in data.items:
        if db.get(Product, item.product_id) is None:
            raise _not_found(f"Product {item.product_id} not found")

    adjustment = Adjustment(
        location_id=data.location_id,
        reason=data.reason,
        created_by=user_id,
        status="draft",
        items=[
            AdjustmentItem(
                product_id=item.product_id,
                counted_quantity=item.counted_quantity,
            )
            for item in data.items
        ],
    )
    db.add(adjustment)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise _invalid_state("Adjustment contains conflicting items") from None
    db.refresh(adjustment)
    return adjustment


def list_adjustments(
    db: Session,
    *,
    status_filter: str | None = None,
    location_id: int | None = None,
) -> list[Adjustment]:
    query = select(Adjustment).order_by(
        Adjustment.created_at.desc(), Adjustment.id.desc()
    )
    if status_filter is not None:
        query = query.where(Adjustment.status == status_filter)
    if location_id is not None:
        query = query.where(Adjustment.location_id == location_id)
    return list(db.scalars(query).all())


def get_adjustment(
    db: Session, adjustment_id: int, *, lock: bool = False
) -> Adjustment:
    query = select(Adjustment).where(Adjustment.id == adjustment_id)
    if lock:
        query = query.with_for_update()
    adjustment = db.scalar(query)
    if adjustment is None:
        raise _not_found("Adjustment not found")
    return adjustment


def apply_adjustment(db: Session, adjustment_id: int, user_id: int) -> Adjustment:
    adjustment = get_adjustment(db, adjustment_id, lock=True)
    if adjustment.status != "draft":
        raise _invalid_state("Adjustment cannot be applied in its current state")

    items = db.scalars(
        select(AdjustmentItem)
        .where(AdjustmentItem.adjustment_id == adjustment_id)
        .order_by(AdjustmentItem.product_id)
    ).all()
    for item in items:
        previous, difference = set_location_quantity(
            db,
            product_id=item.product_id,
            location_id=adjustment.location_id,
            counted_quantity=item.counted_quantity,
            reference_type="adjustment",
            reference_id=adjustment.id,
            created_by=user_id,
        )
        item.previous_quantity = previous
        item.difference = difference

    adjustment.status = "done"
    adjustment.completed_at = datetime.now(timezone.utc)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise _invalid_state("Adjustment could not be applied") from None
    logger.info("Adjustment applied: id=%s", adjustment.id)
    db.refresh(adjustment)
    return adjustment


def cancel_adjustment(db: Session, adjustment_id: int) -> Adjustment:
    adjustment = get_adjustment(db, adjustment_id, lock=True)
    if adjustment.status in {"done", "canceled"}:
        raise _invalid_state("Processed adjustment cannot be canceled")
    adjustment.status = "canceled"
    db.commit()
    db.refresh(adjustment)
    return adjustment
