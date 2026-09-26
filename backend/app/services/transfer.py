"""Transfer service: create, list, validate, cancel internal transfers."""

import logging
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.location import Location
from app.models.product import Product
from app.models.transfer import Transfer, TransferItem
from app.schemas.transfer import TransferCreate
from app.services.stock import change_stock


logger = logging.getLogger(__name__)


def _not_found(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


def _invalid_state(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)


def create_transfer(db: Session, data: TransferCreate, user_id: int) -> Transfer:
    src = db.get(Location, data.source_location_id)
    if src is None:
        raise _not_found("Source location not found")
    if not src.is_active:
        raise _invalid_state("Source location is inactive")
    dst = db.get(Location, data.destination_location_id)
    if dst is None:
        raise _not_found("Destination location not found")
    if not dst.is_active:
        raise _invalid_state("Destination location is inactive")
    for item in data.items:
        if db.get(Product, item.product_id) is None:
            raise _not_found(f"Product {item.product_id} not found")

    transfer = Transfer(
        source_location_id=data.source_location_id,
        destination_location_id=data.destination_location_id,
        created_by=user_id,
        status="draft",
        items=[
            TransferItem(product_id=item.product_id, quantity=item.quantity)
            for item in data.items
        ],
    )
    db.add(transfer)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise _invalid_state("Transfer contains conflicting items") from None
    db.refresh(transfer)
    return transfer


def list_transfers(
    db: Session,
    *,
    status_filter: str | None = None,
    location_id: int | None = None,
) -> list[Transfer]:
    query = select(Transfer).order_by(Transfer.created_at.desc(), Transfer.id.desc())
    if status_filter is not None:
        query = query.where(Transfer.status == status_filter)
    if location_id is not None:
        query = query.where(
            (Transfer.source_location_id == location_id)
            | (Transfer.destination_location_id == location_id)
        )
    return list(db.scalars(query).all())


def get_transfer(db: Session, transfer_id: int, *, lock: bool = False) -> Transfer:
    query = select(Transfer).where(Transfer.id == transfer_id)
    if lock:
        query = query.with_for_update()
    transfer = db.scalar(query)
    if transfer is None:
        raise _not_found("Transfer not found")
    return transfer


def validate_transfer(db: Session, transfer_id: int, user_id: int) -> Transfer:
    transfer = get_transfer(db, transfer_id, lock=True)
    if transfer.status not in {"draft", "waiting", "ready"}:
        raise _invalid_state("Transfer cannot be validated in its current state")

    items = db.scalars(
        select(TransferItem)
        .where(TransferItem.transfer_id == transfer_id)
        .order_by(TransferItem.product_id)
    ).all()
    for item in items:
        # Subtract from source
        change_stock(
            db,
            product_id=item.product_id,
            location_id=transfer.source_location_id,
            quantity_change=-item.quantity,
            movement_type="transfer_out",
            reference_type="transfer",
            reference_id=transfer.id,
            created_by=user_id,
        )
        # Add to destination
        change_stock(
            db,
            product_id=item.product_id,
            location_id=transfer.destination_location_id,
            quantity_change=item.quantity,
            movement_type="transfer_in",
            reference_type="transfer",
            reference_id=transfer.id,
            created_by=user_id,
        )

    transfer.status = "done"
    transfer.completed_at = datetime.now(timezone.utc)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise _invalid_state("Transfer could not be validated") from None
    logger.info("Transfer validated: id=%s", transfer.id)
    db.refresh(transfer)
    return transfer


def cancel_transfer(db: Session, transfer_id: int) -> Transfer:
    transfer = get_transfer(db, transfer_id, lock=True)
    if transfer.status in {"done", "canceled"}:
        raise _invalid_state("Processed transfer cannot be canceled")
    transfer.status = "canceled"
    db.commit()
    db.refresh(transfer)
    return transfer
