import logging
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.location import Location
from app.models.product import Product
from app.models.receipt import Receipt, ReceiptItem
from app.schemas.receipt import ReceiptCreate
from app.services.stock import change_stock


logger = logging.getLogger(__name__)


def _not_found(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


def _invalid_state(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)


def create_receipt(db: Session, data: ReceiptCreate, user_id: int) -> Receipt:
    location = db.get(Location, data.location_id)
    if location is None:
        raise _not_found("Location not found")
    if not location.is_active:
        raise _invalid_state("Location is inactive")
    for item in data.items:
        if db.get(Product, item.product_id) is None:
            raise _not_found(f"Product {item.product_id} not found")

    receipt = Receipt(
        supplier=data.supplier,
        location_id=data.location_id,
        created_by=user_id,
        status="draft",
        items=[ReceiptItem(product_id=item.product_id, quantity=item.quantity) for item in data.items],
    )
    db.add(receipt)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise _invalid_state("Receipt contains conflicting inventory items") from None
    db.refresh(receipt)
    return receipt


def list_receipts(
    db: Session,
    *,
    status_filter: str | None = None,
    location_id: int | None = None,
) -> list[Receipt]:
    query = select(Receipt).order_by(Receipt.created_at.desc(), Receipt.id.desc())
    if status_filter is not None:
        query = query.where(Receipt.status == status_filter)
    if location_id is not None:
        query = query.where(Receipt.location_id == location_id)
    return list(db.scalars(query).all())


def get_receipt(db: Session, receipt_id: int, *, lock: bool = False) -> Receipt:
    query = select(Receipt).where(Receipt.id == receipt_id)
    if lock:
        query = query.with_for_update()
    receipt = db.scalar(query)
    if receipt is None:
        raise _not_found("Receipt not found")
    return receipt


def validate_receipt(db: Session, receipt_id: int, user_id: int) -> Receipt:
    receipt = get_receipt(db, receipt_id, lock=True)
    if receipt.status not in {"draft", "waiting", "ready"}:
        raise _invalid_state("Receipt cannot be validated in its current state")

    items = db.scalars(
        select(ReceiptItem)
        .where(ReceiptItem.receipt_id == receipt_id)
        .order_by(ReceiptItem.product_id)
    ).all()
    for item in items:
        change_stock(
            db,
            product_id=item.product_id,
            location_id=receipt.location_id,
            quantity_change=item.quantity,
            movement_type="receipt",
            reference_type="receipt",
            reference_id=receipt.id,
            created_by=user_id,
        )

    receipt.status = "done"
    receipt.validated_at = datetime.now(timezone.utc)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise _invalid_state("Receipt could not be validated") from None
    logger.info("Receipt validated: id=%s", receipt.id)
    db.refresh(receipt)
    return receipt


def cancel_receipt(db: Session, receipt_id: int) -> Receipt:
    receipt = get_receipt(db, receipt_id, lock=True)
    if receipt.status not in {"draft", "waiting", "ready"}:
        raise _invalid_state("Only an unprocessed receipt can be canceled")
    receipt.status = "canceled"
    db.commit()
    db.refresh(receipt)
    return receipt
