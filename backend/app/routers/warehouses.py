from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, require_inventory_manager
from app.models.user import User
from app.models.warehouse import Warehouse
from app.schemas.warehouse import WarehouseCreate, WarehouseResponse, WarehouseUpdate
from app.services import master_data


router = APIRouter(prefix="/warehouses", tags=["Warehouses"])


@router.get("", response_model=list[WarehouseResponse], summary="List warehouses")
def list_warehouses(db: Annotated[Session, Depends(get_db)]) -> list[Warehouse]:
    return master_data.list_warehouses(db)


@router.post(
    "",
    response_model=WarehouseResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a warehouse",
)
def create_warehouse(
    data: WarehouseCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_inventory_manager)],
) -> Warehouse:
    return master_data.create_warehouse(db, data)


@router.get(
    "/{warehouse_id}",
    response_model=WarehouseResponse,
    summary="Get a warehouse",
)
def get_warehouse(
    warehouse_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> Warehouse:
    return master_data.get_warehouse(db, warehouse_id)


@router.put(
    "/{warehouse_id}",
    response_model=WarehouseResponse,
    summary="Update a warehouse",
)
def update_warehouse(
    warehouse_id: int,
    data: WarehouseUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_inventory_manager)],
) -> Warehouse:
    return master_data.update_warehouse(db, warehouse_id, data)


@router.delete(
    "/{warehouse_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an empty warehouse",
)
def delete_warehouse(
    warehouse_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_inventory_manager)],
) -> Response:
    master_data.delete_warehouse(db, warehouse_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
