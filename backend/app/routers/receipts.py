from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.receipt import Receipt
from app.models.user import User
from app.schemas.receipt import ReceiptCreate, ReceiptResponse, ReceiptStatus
from app.services import receipt as receipt_service


router = APIRouter(prefix="/receipts", tags=["Receipts"])


@router.post("", response_model=ReceiptResponse, status_code=201, summary="Create a receipt")
def create_receipt(
    data: ReceiptCreate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> Receipt:
    return receipt_service.create_receipt(db, data, user.id)


@router.get("", response_model=list[ReceiptResponse], summary="List receipts")
def list_receipts(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
    status_filter: ReceiptStatus | None = Query(default=None, alias="status"),
    location_id: int | None = Query(default=None, gt=0),
) -> list[Receipt]:
    return receipt_service.list_receipts(
        db,
        status_filter=status_filter,
        location_id=location_id,
    )


@router.get("/{receipt_id}", response_model=ReceiptResponse, summary="Get a receipt")
def get_receipt(
    receipt_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
) -> Receipt:
    return receipt_service.get_receipt(db, receipt_id)


@router.post(
    "/{receipt_id}/validate",
    response_model=ReceiptResponse,
    summary="Validate a receipt and increase stock",
)
def validate_receipt(
    receipt_id: int,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> Receipt:
    return receipt_service.validate_receipt(db, receipt_id, user.id)


@router.post(
    "/{receipt_id}/cancel",
    response_model=ReceiptResponse,
    summary="Cancel an unprocessed receipt",
)
def cancel_receipt(
    receipt_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
) -> Receipt:
    return receipt_service.cancel_receipt(db, receipt_id)
