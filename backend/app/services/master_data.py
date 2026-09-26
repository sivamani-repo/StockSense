from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.location import Location
from app.models.product import Product
from app.models.reorder_rule import ReorderRule
from app.models.warehouse import Warehouse
from app.schemas.location import LocationCreate, LocationUpdate
from app.schemas.reorder_rule import ReorderRuleCreate
from app.schemas.warehouse import WarehouseCreate, WarehouseUpdate


def _not_found(entity: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"{entity} not found",
    )


def _duplicate(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)


def list_warehouses(db: Session) -> list[Warehouse]:
    return list(db.scalars(select(Warehouse).order_by(Warehouse.name)).all())


def get_warehouse(db: Session, warehouse_id: int) -> Warehouse:
    warehouse = db.get(Warehouse, warehouse_id)
    if warehouse is None:
        raise _not_found("Warehouse")
    return warehouse


def create_warehouse(db: Session, data: WarehouseCreate) -> Warehouse:
    if db.scalar(select(Warehouse.id).where(Warehouse.code == data.code)) is not None:
        raise _duplicate("Warehouse code already exists")
    warehouse = Warehouse(**data.model_dump())
    db.add(warehouse)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise _duplicate("Warehouse code already exists") from None
    db.refresh(warehouse)
    return warehouse


def update_warehouse(
    db: Session,
    warehouse_id: int,
    data: WarehouseUpdate,
) -> Warehouse:
    warehouse = get_warehouse(db, warehouse_id)
    duplicate = db.scalar(
        select(Warehouse.id).where(
            Warehouse.code == data.code,
            Warehouse.id != warehouse_id,
        )
    )
    if duplicate is not None:
        raise _duplicate("Warehouse code already exists")
    for field, value in data.model_dump().items():
        setattr(warehouse, field, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise _duplicate("Warehouse code already exists") from None
    db.refresh(warehouse)
    return warehouse


def delete_warehouse(db: Session, warehouse_id: int) -> None:
    warehouse = get_warehouse(db, warehouse_id)
    if db.scalar(select(Location.id).where(Location.warehouse_id == warehouse_id).limit(1)):
        raise _duplicate("Warehouse still contains locations")
    db.delete(warehouse)
    db.commit()


def list_locations(db: Session, warehouse_id: int | None = None) -> list[Location]:
    query = select(Location).order_by(Location.warehouse_id, Location.name)
    if warehouse_id is not None:
        query = query.where(Location.warehouse_id == warehouse_id)
    return list(db.scalars(query).all())


def get_location(db: Session, location_id: int) -> Location:
    location = db.get(Location, location_id)
    if location is None:
        raise _not_found("Location")
    return location


def create_location(db: Session, data: LocationCreate) -> Location:
    if db.get(Warehouse, data.warehouse_id) is None:
        raise _not_found("Warehouse")
    duplicate = db.scalar(
        select(Location.id).where(
            Location.warehouse_id == data.warehouse_id,
            Location.code == data.code,
        )
    )
    if duplicate is not None:
        raise _duplicate("Location code already exists in this warehouse")
    location = Location(**data.model_dump())
    db.add(location)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise _duplicate("Location code already exists in this warehouse") from None
    db.refresh(location)
    return location


def update_location(
    db: Session,
    location_id: int,
    data: LocationUpdate,
) -> Location:
    location = get_location(db, location_id)
    changes = data.model_dump(exclude_unset=True)
    code = changes.get("code", location.code)
    duplicate = db.scalar(
        select(Location.id).where(
            Location.warehouse_id == location.warehouse_id,
            Location.code == code,
            Location.id != location_id,
        )
    )
    if duplicate is not None:
        raise _duplicate("Location code already exists in this warehouse")
    for field, value in changes.items():
        setattr(location, field, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise _duplicate("Location code already exists in this warehouse") from None
    db.refresh(location)
    return location


def delete_location(db: Session, location_id: int) -> None:
    location = get_location(db, location_id)
    db.delete(location)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise _duplicate("Location is referenced by inventory records") from None


def list_reorder_rules(db: Session) -> list[ReorderRule]:
    return list(db.scalars(select(ReorderRule).order_by(ReorderRule.product_id)).all())


def save_reorder_rule(
    db: Session,
    data: ReorderRuleCreate,
    rule_id: int | None = None,
) -> ReorderRule:
    if db.get(Product, data.product_id) is None:
        raise _not_found("Product")
    if data.location_id is not None and db.get(Location, data.location_id) is None:
        raise _not_found("Location")

    duplicate_query = select(ReorderRule.id).where(
        ReorderRule.product_id == data.product_id,
        ReorderRule.id != (rule_id or 0),
    )
    if data.location_id is None:
        duplicate_query = duplicate_query.where(ReorderRule.location_id.is_(None))
    else:
        duplicate_query = duplicate_query.where(
            ReorderRule.location_id == data.location_id
        )
    if db.scalar(duplicate_query) is not None:
        raise _duplicate("A reorder rule already exists for this product and location")

    rule = db.get(ReorderRule, rule_id) if rule_id is not None else None
    if rule_id is not None and rule is None:
        raise _not_found("Reorder rule")
    if rule is None:
        rule = ReorderRule()
        db.add(rule)
    for field, value in data.model_dump().items():
        setattr(rule, field, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise _duplicate("A reorder rule already exists for this product and location") from None
    db.refresh(rule)
    return rule


def delete_reorder_rule(db: Session, rule_id: int) -> None:
    rule = db.get(ReorderRule, rule_id)
    if rule is None:
        raise _not_found("Reorder rule")
    db.delete(rule)
    db.commit()
