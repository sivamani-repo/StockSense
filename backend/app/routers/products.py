from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate
from app.services import product as product_service


router = APIRouter(prefix="/products", tags=["Products"])


@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a product",
)
def create_product(
    data: ProductCreate,
    db: Annotated[Session, Depends(get_db)],
) -> Product:
    """Create a product with a unique SKU and category relation."""
    return product_service.create_product(db, data)


@router.get("", response_model=list[ProductResponse], summary="List products")
def list_products(
    db: Annotated[Session, Depends(get_db)],
) -> list[Product]:
    """Return products in stable name order."""
    return product_service.list_products(db)


@router.get(
    "/search",
    response_model=list[ProductResponse],
    summary="Search and filter products",
)
def search_products(
    db: Annotated[Session, Depends(get_db)],
    name: str | None = Query(default=None, min_length=1),
    sku: str | None = Query(default=None, min_length=1),
    category: str | None = Query(default=None, min_length=1),
    category_id: int | None = Query(default=None, gt=0),
    stock_status: Literal["in_stock", "low_stock", "out_of_stock"] | None = None,
) -> list[Product]:
    """Filter products using a single set of optional search criteria."""
    return product_service.list_products(
        db,
        name=name,
        sku=sku,
        category=category,
        category_id=category_id,
        stock_status=stock_status,
    )


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Get a product",
)
def get_product(
    product_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> Product:
    """Return a product by its ID."""
    return product_service.get_product(db, product_id)


@router.put(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Update a product",
)
def update_product(
    product_id: int,
    data: ProductUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> Product:
    """Replace editable product fields and preserve the existing API shape."""
    return product_service.update_product(db, product_id, data)


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a product",
)
def delete_product(
    product_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> dict[str, int | str]:
    """Delete a product unless inventory records still reference it."""
    product_service.delete_product(db, product_id)
    return {"message": "Product deleted successfully", "id": product_id}
