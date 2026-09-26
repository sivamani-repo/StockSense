from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, require_inventory_manager
from app.models.category import Category
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate
from app.services import categories as category_service


router = APIRouter(prefix="/categories", tags=["Categories"])


@router.post(
    "",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a category",
)
def create_category(
    data: CategoryCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_inventory_manager)],
) -> Category:
    return category_service.create_category(db, data)


@router.get("", response_model=list[CategoryResponse], summary="List categories")
def list_categories(db: Annotated[Session, Depends(get_db)]) -> list[Category]:
    return category_service.list_categories(db)


@router.get(
    "/{category_id}",
    response_model=CategoryResponse,
    summary="Get a category",
)
def get_category(
    category_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> Category:
    return category_service.get_category(db, category_id)


@router.put(
    "/{category_id}",
    response_model=CategoryResponse,
    summary="Update a category",
)
def update_category(
    category_id: int,
    data: CategoryUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_inventory_manager)],
) -> Category:
    return category_service.update_category(db, category_id, data)


@router.delete(
    "/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an unused category",
)
def delete_category(
    category_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_inventory_manager)],
) -> Response:
    category_service.delete_category(db, category_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
