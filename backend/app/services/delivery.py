import logging
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.delivery import Delivery, DeliveryItem
from app.models.location import Location
from app.models.product import Product
from app.schemas.delivery import DeliveryCreate
from app.services.stock import change_stock, get_location_quantity


logger = logging.getLogger(__name__)


def _not_found(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


def _invalid_state(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)


def create_delivery(db: Session, data: DeliveryCreate, user_id: int) -> Delivery:
    location = db.get(Location, data.location_id)
    if location is None:
        raise _not_found("Location not found")
    if not location.is_active:
        raise _invalid_state("Location is inactive")
    for item in data.items:
        if db.get(Product, item.product_id) is None:
            raise _not_found(f"Product {item.product_id} not found")

    delivery = Delivery(
        customer=data.customer,
        location_id=data.location_id,
        created_by=user_id,
        status="draft",
        items=[DeliveryItem(product_id=item.product_id, quantity=item.quantity) for item in data.items],
    )
    db.add(delivery)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise _invalid_state("Delivery contains conflicting inventory items") from None
    db.refresh(delivery)
    return delivery


def list_deliveries(
    db: Session,
    *,
    status_filter: str | None = None,
    location_id: int | None = None,
) -> list[Delivery]:
    query = select(Delivery).order_by(Delivery.created_at.desc(), Delivery.id.desc())
    if status_filter is not None:
        query = query.where(Delivery.status == status_filter)
    if location_id is not None:
        query = query.where(Delivery.location_id == location_id)
    return list(db.scalars(query).all())


def get_delivery(db: Session, delivery_id: int, *, lock: bool = False) -> Delivery:
    query = select(Delivery).where(Delivery.id == delivery_id)
    if lock:
        query = query.with_for_update()
    delivery = db.scalar(query)
    if delivery is None:
        raise _not_found("Delivery not found")
    return delivery


def pick_delivery(db: Session, delivery_id: int) -> Delivery:
    delivery = get_delivery(db, delivery_id, lock=True)
    if delivery.status != "draft":
        raise _invalid_state("Only a draft delivery can be picked")
    items = db.scalars(
        select(DeliveryItem)
        .where(DeliveryItem.delivery_id == delivery_id)
        .order_by(DeliveryItem.product_id)
    ).all()
    for item in items:
        available = get_location_quantity(db, item.product_id, delivery.location_id)
        if available < item.quantity:
            raise _invalid_state("Insufficient stock to pick delivery")
    delivery.status = "picked"
    db.commit()
    db.refresh(delivery)
    return delivery


def pack_delivery(db: Session, delivery_id: int) -> Delivery:
    delivery = get_delivery(db, delivery_id, lock=True)
    if delivery.status != "picked":
        raise _invalid_state("Delivery must be picked before it can be packed")
    delivery.status = "packed"
    db.commit()
    db.refresh(delivery)
    return delivery


def validate_delivery(db: Session, delivery_id: int, user_id: int) -> Delivery:
    delivery = get_delivery(db, delivery_id, lock=True)
    if delivery.status != "packed":
        raise _invalid_state("Delivery must be packed before validation")

    items = db.scalars(
        select(DeliveryItem)
        .where(DeliveryItem.delivery_id == delivery_id)
        .order_by(DeliveryItem.product_id)
    ).all()
    for item in items:
        change_stock(
            db,
            product_id=item.product_id,
            location_id=delivery.location_id,
            quantity_change=-item.quantity,
            movement_type="delivery",
            reference_type="delivery",
            reference_id=delivery.id,
            created_by=user_id,
        )

    delivery.status = "done"
    delivery.validated_at = datetime.now(timezone.utc)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise _invalid_state("Delivery could not be validated") from None
    logger.info("Delivery validated: id=%s", delivery.id)
    db.refresh(delivery)
    return delivery


def cancel_delivery(db: Session, delivery_id: int) -> Delivery:
    delivery = get_delivery(db, delivery_id, lock=True)
    if delivery.status in {"done", "canceled"}:
        raise _invalid_state("Processed delivery cannot be canceled")
    delivery.status = "canceled"
    db.commit()
    db.refresh(delivery)
    return delivery
