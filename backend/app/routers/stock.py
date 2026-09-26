"""Stock levels, ledger audit trail, and inventory summary router."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.ledger import StockLedger
from app.models.location import Location
from app.models.product import Product
from app.models.reorder_rule import ReorderRule
from app.models.stock import StockLevel
from app.models.user import User
from app.models.warehouse import Warehouse
from app.schemas.stock import DetailedStockLevel, ProductStockSummary, StockLedgerResponse


router = APIRouter(prefix="/stock", tags=["Stock & Ledger"])


@router.get("/levels", response_model=list[DetailedStockLevel], summary="Get detailed stock levels")
def get_stock_levels(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
    product_id: int | None = Query(default=None, gt=0),
    warehouse_id: int | None = Query(default=None, gt=0),
    location_id: int | None = Query(default=None, gt=0),
) -> list[DetailedStockLevel]:
    query = (
        select(
            StockLevel.id,
            StockLevel.product_id,
            Product.name.label("product_name"),
            Product.sku.label("product_sku"),
            Product.category.label("product_category"),
            Product.unit.label("product_unit"),
            StockLevel.location_id,
            Location.name.label("location_name"),
            Location.code.label("location_code"),
            Warehouse.id.label("warehouse_id"),
            Warehouse.name.label("warehouse_name"),
            StockLevel.quantity,
            StockLevel.updated_at,
        )
        .join(Product, StockLevel.product_id == Product.id)
        .join(Location, StockLevel.location_id == Location.id)
        .join(Warehouse, Location.warehouse_id == Warehouse.id)
    )

    if product_id is not None:
        query = query.where(StockLevel.product_id == product_id)
    if warehouse_id is not None:
        query = query.where(Warehouse.id == warehouse_id)
    if location_id is not None:
        query = query.where(StockLevel.location_id == location_id)

    query = query.order_by(Product.name, Location.name)
    rows = db.execute(query).mappings().all()

    return [
        DetailedStockLevel(
            id=r["id"],
            product_id=r["product_id"],
            product_name=r["product_name"],
            product_sku=r["product_sku"],
            product_category=r["product_category"],
            product_unit=r["product_unit"],
            location_id=r["location_id"],
            location_name=r["location_name"],
            location_code=r["location_code"],
            warehouse_id=r["warehouse_id"],
            warehouse_name=r["warehouse_name"],
            quantity=float(r["quantity"]),
            updated_at=r["updated_at"],
        )
        for r in rows
    ]


@router.get("/ledger", response_model=list[StockLedgerResponse], summary="Get stock movement audit ledger")
def get_stock_ledger(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
    product_id: int | None = Query(default=None, gt=0),
    location_id: int | None = Query(default=None, gt=0),
    movement_type: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> list[StockLedgerResponse]:
    query = (
        select(
            StockLedger.id,
            StockLedger.product_id,
            Product.name.label("product_name"),
            Product.sku.label("product_sku"),
            StockLedger.location_id,
            Location.name.label("location_name"),
            StockLedger.movement_type,
            StockLedger.quantity_change,
            StockLedger.quantity_before,
            StockLedger.quantity_after,
            StockLedger.reference_type,
            StockLedger.reference_id,
            StockLedger.created_by,
            User.name.label("created_by_name"),
            StockLedger.created_at,
        )
        .join(Product, StockLedger.product_id == Product.id)
        .join(Location, StockLedger.location_id == Location.id)
        .outerjoin(User, StockLedger.created_by == User.id)
    )

    if product_id is not None:
        query = query.where(StockLedger.product_id == product_id)
    if location_id is not None:
        query = query.where(StockLedger.location_id == location_id)
    if movement_type is not None:
        query = query.where(StockLedger.movement_type == movement_type)

    query = query.order_by(StockLedger.created_at.desc(), StockLedger.id.desc()).limit(limit).offset(offset)
    rows = db.execute(query).mappings().all()

    return [
        StockLedgerResponse(
            id=r["id"],
            product_id=r["product_id"],
            product_name=r["product_name"],
            product_sku=r["product_sku"],
            location_id=r["location_id"],
            location_name=r["location_name"],
            movement_type=r["movement_type"],
            quantity_change=float(r["quantity_change"]),
            quantity_before=float(r["quantity_before"]),
            quantity_after=float(r["quantity_after"]),
            reference_type=r["reference_type"],
            reference_id=r["reference_id"],
            created_by=r["created_by"],
            created_by_name=r["created_by_name"] or "System",
            created_at=r["created_at"],
        )
        for r in rows
    ]


@router.get("/summary", response_model=list[ProductStockSummary], summary="Get inventory summary across all products")
def get_inventory_summary(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
) -> list[ProductStockSummary]:
    products = db.scalars(select(Product).order_by(Product.name)).all()
    if not products:
        return []

    rules = db.scalars(select(ReorderRule).where(ReorderRule.location_id.is_(None))).all()
    rule_map = {r.product_id: r.minimum_quantity for r in rules}

    # Fetch all stock levels with location info
    levels_query = (
        select(
            StockLevel.product_id,
            StockLevel.quantity,
            Location.name.label("location_name"),
            Location.code.label("location_code"),
            Warehouse.name.label("warehouse_name"),
        )
        .join(Location, StockLevel.location_id == Location.id)
        .join(Warehouse, Location.warehouse_id == Warehouse.id)
    )
    level_rows = db.execute(levels_query).mappings().all()

    location_map: dict[int, list[dict]] = {}
    for row in level_rows:
        pid = row["product_id"]
        if pid not in location_map:
            location_map[pid] = []
        location_map[pid].append({
            "location_name": row["location_name"],
            "location_code": row["location_code"],
            "warehouse_name": row["warehouse_name"],
            "quantity": float(row["quantity"]),
        })

    results = []
    for p in products:
        stock_val = float(p.stock)
        min_qty = rule_map.get(p.id, 10.0)  # default low stock threshold 10 if no rule

        if stock_val <= 0:
            status = "out_of_stock"
        elif stock_val <= min_qty:
            status = "low_stock"
        else:
            status = "in_stock"

        results.append(
            ProductStockSummary(
                product_id=p.id,
                name=p.name,
                sku=p.sku,
                category=p.category,
                unit=p.unit,
                total_stock=stock_val,
                stock_status=status,
                min_quantity=min_qty,
                locations=location_map.get(p.id, []),
            )
        )

    return results
