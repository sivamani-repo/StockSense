"""Internal transfers router."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.transfer import Transfer
from app.models.user import User
from app.schemas.transfer import TransferCreate, TransferResponse, TransferStatus
from app.services import transfer as transfer_service


router = APIRouter(prefix="/transfers", tags=["Internal Transfers"])


@router.post("", response_model=TransferResponse, status_code=201, summary="Create a transfer")
def create_transfer(
    data: TransferCreate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> Transfer:
    return transfer_service.create_transfer(db, data, user.id)


@router.get("", response_model=list[TransferResponse], summary="List transfers")
def list_transfers(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
    status_filter: TransferStatus | None = Query(default=None, alias="status"),
    location_id: int | None = Query(default=None, gt=0),
) -> list[Transfer]:
    return transfer_service.list_transfers(
        db, status_filter=status_filter, location_id=location_id
    )


@router.get("/{transfer_id}", response_model=TransferResponse, summary="Get a transfer")
def get_transfer(
    transfer_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
) -> Transfer:
    return transfer_service.get_transfer(db, transfer_id)


@router.post(
    "/{transfer_id}/validate",
    response_model=TransferResponse,
    summary="Validate a transfer and move stock",
)
def validate_transfer(
    transfer_id: int,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> Transfer:
    return transfer_service.validate_transfer(db, transfer_id, user.id)


@router.post(
    "/{transfer_id}/cancel",
    response_model=TransferResponse,
    summary="Cancel an unprocessed transfer",
)
def cancel_transfer(
    transfer_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
) -> Transfer:
    return transfer_service.cancel_transfer(db, transfer_id)
