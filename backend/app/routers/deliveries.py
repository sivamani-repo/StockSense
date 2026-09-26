from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.delivery import Delivery
from app.models.user import User
from app.schemas.delivery import DeliveryCreate, DeliveryResponse, DeliveryStatus
from app.services import delivery as delivery_service


router = APIRouter(prefix="/deliveries", tags=["Deliveries"])


@router.post("", response_model=DeliveryResponse, status_code=201, summary="Create a delivery")
def create_delivery(
    data: DeliveryCreate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> Delivery:
    return delivery_service.create_delivery(db, data, user.id)


@router.get("", response_model=list[DeliveryResponse], summary="List deliveries")
def list_deliveries(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
    status_filter: DeliveryStatus | None = Query(default=None, alias="status"),
    location_id: int | None = Query(default=None, gt=0),
) -> list[Delivery]:
    return delivery_service.list_deliveries(
        db,
        status_filter=status_filter,
        location_id=location_id,
    )


@router.get("/{delivery_id}", response_model=DeliveryResponse, summary="Get a delivery")
def get_delivery(
    delivery_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
) -> Delivery:
    return delivery_service.get_delivery(db, delivery_id)


@router.post(
    "/{delivery_id}/pick",
    response_model=DeliveryResponse,
    summary="Pick a delivery",
)
def pick_delivery(
    delivery_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
) -> Delivery:
    return delivery_service.pick_delivery(db, delivery_id)


@router.post(
    "/{delivery_id}/pack",
    response_model=DeliveryResponse,
    summary="Pack a picked delivery",
)
def pack_delivery(
    delivery_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
) -> Delivery:
    return delivery_service.pack_delivery(db, delivery_id)


@router.post(
    "/{delivery_id}/validate",
    response_model=DeliveryResponse,
    summary="Validate a delivery and decrease stock",
)
def validate_delivery(
    delivery_id: int,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> Delivery:
    return delivery_service.validate_delivery(db, delivery_id, user.id)


@router.post(
    "/{delivery_id}/cancel",
    response_model=DeliveryResponse,
    summary="Cancel an unprocessed delivery",
)
def cancel_delivery(
    delivery_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
) -> Delivery:
    return delivery_service.cancel_delivery(db, delivery_id)
