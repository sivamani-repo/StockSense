from typing import Annotated

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, require_inventory_manager
from app.models.location import Location
from app.models.user import User
from app.schemas.location import LocationCreate, LocationResponse, LocationUpdate
from app.services import master_data


router = APIRouter(prefix="/locations", tags=["Locations"])


@router.get("", response_model=list[LocationResponse], summary="List locations")
def list_locations(
    db: Annotated[Session, Depends(get_db)],
    warehouse_id: int | None = Query(default=None, gt=0),
) -> list[Location]:
    return master_data.list_locations(db, warehouse_id)


@router.post(
    "",
    response_model=LocationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a warehouse location",
)
def create_location(
    data: LocationCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_inventory_manager)],
) -> Location:
    return master_data.create_location(db, data)


@router.get(
    "/{location_id}",
    response_model=LocationResponse,
    summary="Get a location",
)
def get_location(
    location_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> Location:
    return master_data.get_location(db, location_id)


@router.put(
    "/{location_id}",
    response_model=LocationResponse,
    summary="Update a location",
)
def update_location(
    location_id: int,
    data: LocationUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_inventory_manager)],
) -> Location:
    return master_data.update_location(db, location_id, data)


@router.delete(
    "/{location_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an unused location",
)
def delete_location(
    location_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_inventory_manager)],
) -> Response:
    master_data.delete_location(db, location_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
