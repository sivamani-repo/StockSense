"""Dashboard KPIs and analytics router for inventory overview."""

from typing import Annotated, Any

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.models.adjustment import Adjustment
from app.models.category import Category
from app.models.delivery import Delivery
from app.models.ledger import StockLedger
from app.models.location import Location
from app.models.product import Product
from app.models.receipt import Receipt
from app.models.reorder_rule import ReorderRule
from app.models.transfer import Transfer
from app.models.user import User
from app.models.warehouse import Warehouse


router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", summary="Get inventory dashboard statistics and KPIs")
def get_dashboard_stats(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
) -> dict[str, Any]:
    # 1. Product & stock counts
    total_products = db.scalar(select(func.count(Product.id))) or 0
    total_stock_units = db.scalar(select(func.coalesce(func.sum(Product.stock), 0))) or 0

    # 2. Warehouses & locations
    total_warehouses = db.scalar(select(func.count(Warehouse.id))) or 0
    total_locations = db.scalar(select(func.count(Location.id))) or 0

    # 3. Pending operations
    pending_receipts = db.scalar(
        select(func.count(Receipt.id)).where(Receipt.status == "draft")
    ) or 0
    pending_deliveries = db.scalar(
        select(func.count(Delivery.id)).where(Delivery.status.in_(["draft", "waiting", "ready"]))
    ) or 0
    pending_transfers = db.scalar(
        select(func.count(Transfer.id)).where(Transfer.status == "draft")
    ) or 0
    pending_adjustments = db.scalar(
        select(func.count(Adjustment.id)).where(Adjustment.status == "draft")
    ) or 0

    # 4. Completed operations count
    completed_receipts = db.scalar(
        select(func.count(Receipt.id)).where(Receipt.status == "done")
    ) or 0
    completed_deliveries = db.scalar(
        select(func.count(Delivery.id)).where(Delivery.status == "done")
    ) or 0
    completed_transfers = db.scalar(
        select(func.count(Transfer.id)).where(Transfer.status == "done")
    ) or 0
    completed_adjustments = db.scalar(
        select(func.count(Adjustment.id)).where(Adjustment.status == "done")
    ) or 0

    # 5. Low stock & out of stock computation
    products = db.scalars(select(Product)).all()
    rules = db.scalars(select(ReorderRule).where(ReorderRule.location_id.is_(None))).all()
    rule_map = {r.product_id: r.minimum_quantity for r in rules}

    low_stock_list = []
    out_of_stock_count = 0
    low_stock_count = 0

    for p in products:
        stock_val = float(p.stock)
        min_qty = rule_map.get(p.id, 10.0)

        if stock_val <= 0:
            out_of_stock_count += 1
            low_stock_list.append({
                "id": p.id,
                "name": p.name,
                "sku": p.sku,
                "category": p.category,
                "stock": stock_val,
                "min_stock": min_qty,
                "unit": p.unit,
                "status": "out_of_stock",
            })
        elif stock_val <= min_qty:
            low_stock_count += 1
            low_stock_list.append({
                "id": p.id,
                "name": p.name,
                "sku": p.sku,
                "category": p.category,
                "stock": stock_val,
                "min_stock": min_qty,
                "unit": p.unit,
                "status": "low_stock",
            })

    # Sort low stock items with lowest stock first
    low_stock_list.sort(key=lambda x: x["stock"])

    # 6. Category breakdown
    categories = db.scalars(select(Category)).all()
    cat_summary = []
    for c in categories:
        p_count = db.scalar(select(func.count(Product.id)).where(Product.category_id == c.id)) or 0
        total_p_stock = db.scalar(
            select(func.coalesce(func.sum(Product.stock), 0)).where(Product.category_id == c.id)
        ) or 0
        cat_summary.append({
            "id": c.id,
            "name": c.name,
            "product_count": p_count,
            "total_stock": float(total_p_stock),
        })

    # 7. Recent stock ledger movements (top 10)
    recent_query = (
        select(
            StockLedger.id,
            Product.name.label("product_name"),
            Product.sku.label("product_sku"),
            Location.name.label("location_name"),
            StockLedger.movement_type,
            StockLedger.quantity_change,
            StockLedger.quantity_before,
            StockLedger.quantity_after,
            StockLedger.reference_type,
            StockLedger.reference_id,
            StockLedger.created_at,
            User.name.label("user_name"),
        )
        .join(Product, StockLedger.product_id == Product.id)
        .join(Location, StockLedger.location_id == Location.id)
        .outerjoin(User, StockLedger.created_by == User.id)
        .order_by(StockLedger.created_at.desc(), StockLedger.id.desc())
        .limit(10)
    )
    recent_rows = db.execute(recent_query).mappings().all()
    recent_activities = [
        {
            "id": r["id"],
            "product_name": r["product_name"],
            "product_sku": r["product_sku"],
            "location_name": r["location_name"],
            "movement_type": r["movement_type"],
            "quantity_change": float(r["quantity_change"]),
            "quantity_before": float(r["quantity_before"]),
            "quantity_after": float(r["quantity_after"]),
            "reference_type": r["reference_type"],
            "reference_id": r["reference_id"],
            "user_name": r["user_name"] or "System",
            "created_at": r["created_at"].isoformat() if r["created_at"] else None,
        }
        for r in recent_rows
    ]

    return {
        "kpis": {
            "total_products": total_products,
            "total_stock_units": float(total_stock_units),
            "out_of_stock_count": out_of_stock_count,
            "low_stock_count": low_stock_count,
            "total_warehouses": total_warehouses,
            "total_locations": total_locations,
            "pending_receipts": pending_receipts,
            "pending_deliveries": pending_deliveries,
            "pending_transfers": pending_transfers,
            "pending_adjustments": pending_adjustments,
            "completed_receipts": completed_receipts,
            "completed_deliveries": completed_deliveries,
            "completed_transfers": completed_transfers,
            "completed_adjustments": completed_adjustments,
        },
        "low_stock_items": low_stock_list[:8],
        "category_distribution": cat_summary,
        "recent_activities": recent_activities,
    }
