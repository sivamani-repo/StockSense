from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

from app.models.ledger import StockLedger
from app.models.location import Location
from app.models.product import Product
from app.models.stock import StockLevel
from app.models.warehouse import Warehouse


VALID_MOVEMENTS = {
    "opening_balance",
    "receipt",
    "delivery",
    "transfer_in",
    "transfer_out",
    "adjustment",
}


def _conflict(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)


def ensure_default_location(db: Session) -> Location:
    location = db.scalar(
        select(Location)
        .where(Location.is_active.is_(True))
        .order_by(Location.id)
        .limit(1)
    )
    if location is not None:
        return location

    warehouse = db.scalar(
        select(Warehouse)
        .where(Warehouse.code == "MAIN")
        .with_for_update()
    )
    if warehouse is None:
        warehouse = Warehouse(name="Main Warehouse", code="MAIN")
        db.add(warehouse)
        db.flush()

    location = db.scalar(
        select(Location).where(
            Location.warehouse_id == warehouse.id,
            Location.code == "STOCK",
        )
    )
    if location is None:
        location = Location(
            warehouse_id=warehouse.id,
            name="Main Stock",
            code="STOCK",
        )
        db.add(location)
        db.flush()
    return location


def _record_movement(
    db: Session,
    *,
    product_id: int,
    location_id: int,
    movement_type: str,
    quantity_change: float,
    quantity_before: float,
    quantity_after: float,
    reference_type: str,
    reference_id: int,
    created_by: int | None,
) -> None:
    db.add(
        StockLedger(
            product_id=product_id,
            location_id=location_id,
            movement_type=movement_type,
            quantity_change=quantity_change,
            quantity_before=quantity_before,
            quantity_after=quantity_after,
            reference_type=reference_type,
            reference_id=reference_id,
            created_by=created_by,
        )
    )


def change_stock(
    db: Session,
    *,
    product_id: int,
    location_id: int,
    quantity_change: float,
    movement_type: str,
    reference_type: str,
    reference_id: int,
    created_by: int | None,
) -> tuple[float, float]:
    """Change one location balance; the caller commits the full business operation."""
    if movement_type not in VALID_MOVEMENTS:
        raise ValueError("Unsupported stock movement type")

    product = db.scalar(
        select(Product).where(Product.id == product_id).with_for_update()
    )
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    location = db.scalar(
        select(Location).where(Location.id == location_id).with_for_update()
    )
    if location is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found",
        )
    if not location.is_active:
        raise _conflict("Location is inactive")

    db.execute(
        pg_insert(StockLevel)
        .values(product_id=product_id, location_id=location_id, quantity=0)
        .on_conflict_do_nothing(index_elements=["product_id", "location_id"])
    )
    level = db.scalar(
        select(StockLevel)
        .where(
            StockLevel.product_id == product_id,
            StockLevel.location_id == location_id,
        )
        .with_for_update()
    )
    levels_total = db.scalar(
        select(func.coalesce(func.sum(StockLevel.quantity), 0)).where(
            StockLevel.product_id == product_id
        )
    )
    unallocated = product.stock - float(levels_total)
    if unallocated < -1e-6:
        raise _conflict("Product total stock does not match its location balances")
    if unallocated > 1e-6:
        before_allocation = level.quantity
        level.quantity += unallocated
        _record_movement(
            db,
            product_id=product_id,
            location_id=location_id,
            movement_type="opening_balance",
            quantity_change=unallocated,
            quantity_before=before_allocation,
            quantity_after=level.quantity,
            reference_type="product_opening_balance",
            reference_id=product_id,
            created_by=None,
        )

    quantity_before = float(level.quantity)
    quantity_after = quantity_before + quantity_change
    if quantity_after < -1e-6:
        raise _conflict("Insufficient stock")
    quantity_after = max(quantity_after, 0)
    level.quantity = quantity_after
    product.stock = float(product.stock) + quantity_change
    if product.stock < -1e-6:
        raise _conflict("Product total stock cannot be negative")
    product.stock = max(product.stock, 0)

    if quantity_change != 0:
        _record_movement(
            db,
            product_id=product_id,
            location_id=location_id,
            movement_type=movement_type,
            quantity_change=quantity_change,
            quantity_before=quantity_before,
            quantity_after=quantity_after,
            reference_type=reference_type,
            reference_id=reference_id,
            created_by=created_by,
        )
    return quantity_before, quantity_after


def create_opening_balance(
    db: Session,
    *,
    product: Product,
    quantity: float,
    location_id: int | None = None,
) -> Location:
    location = db.get(Location, location_id) if location_id is not None else None
    if location_id is not None and location is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found",
        )
    if location is None:
        location = ensure_default_location(db)
    change_stock(
        db,
        product_id=product.id,
        location_id=location.id,
        quantity_change=quantity,
        movement_type="opening_balance",
        reference_type="product_opening_balance",
        reference_id=product.id,
        created_by=None,
    )
    return location


def reconcile_product_total(
    db: Session,
    *,
    product: Product,
    desired_total: float,
    location_id: int | None = None,
    created_by: int | None = None,
) -> None:
    """Adjust a legacy product total through location balances and ledger rows."""
    difference = desired_total - float(product.stock)
    if abs(difference) < 1e-6:
        return

    if difference > 0:
        location = db.get(Location, location_id) if location_id is not None else None
        if location_id is not None and location is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Location not found",
            )
        if location is None:
            location = ensure_default_location(db)
        change_stock(
            db,
            product_id=product.id,
            location_id=location.id,
            quantity_change=difference,
            movement_type="adjustment",
            reference_type="product_update",
            reference_id=product.id,
            created_by=created_by,
        )
        return

    remaining = -difference
    if location_id is not None:
        change_stock(
            db,
            product_id=product.id,
            location_id=location_id,
            quantity_change=-remaining,
            movement_type="adjustment",
            reference_type="product_update",
            reference_id=product.id,
            created_by=created_by,
        )
        return

    levels = db.scalars(
        select(StockLevel)
        .where(StockLevel.product_id == product.id, StockLevel.quantity > 0)
        .order_by(StockLevel.location_id)
        .with_for_update()
    ).all()
    for level in levels:
        quantity = min(remaining, float(level.quantity))
        if quantity <= 0:
            continue
        change_stock(
            db,
            product_id=product.id,
            location_id=level.location_id,
            quantity_change=-quantity,
            movement_type="adjustment",
            reference_type="product_update",
            reference_id=product.id,
            created_by=created_by,
        )
        remaining -= quantity
        if remaining < 1e-6:
            return

    location = ensure_default_location(db)
    change_stock(
        db,
        product_id=product.id,
        location_id=location.id,
        quantity_change=-remaining,
        movement_type="adjustment",
        reference_type="product_update",
        reference_id=product.id,
        created_by=created_by,
    )


def get_location_quantity(db: Session, product_id: int, location_id: int) -> float:
    quantity = db.scalar(
        select(StockLevel.quantity).where(
            StockLevel.product_id == product_id,
            StockLevel.location_id == location_id,
        )
    )
    return float(quantity or 0)


def set_location_quantity(
    db: Session,
    *,
    product_id: int,
    location_id: int,
    counted_quantity: float,
    reference_type: str,
    reference_id: int,
    created_by: int | None,
) -> tuple[float, float]:
    """Apply a physical count while holding the product row lock."""
    product = db.scalar(
        select(Product).where(Product.id == product_id).with_for_update()
    )
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    quantity_before = get_location_quantity(db, product_id, location_id)
    difference = counted_quantity - quantity_before
    change_stock(
        db,
        product_id=product_id,
        location_id=location_id,
        quantity_change=difference,
        movement_type="adjustment",
        reference_type=reference_type,
        reference_id=reference_id,
        created_by=created_by,
    )
    return quantity_before, difference


def get_total_quantity(db: Session, product_id: int) -> float:
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    return float(product.stock)
