from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


StockStatus = Literal["in_stock", "low_stock", "out_of_stock"]


class StockLevelResponse(BaseModel):
    id: int
    product_id: int
    location_id: int
    quantity: float
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DetailedStockLevel(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_sku: str
    product_category: str
    product_unit: str
    location_id: int
    location_name: str
    location_code: str
    warehouse_id: int
    warehouse_name: str
    quantity: float
    updated_at: datetime


class StockLedgerResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_sku: str
    location_id: int
    location_name: str
    movement_type: str
    quantity_change: float
    quantity_before: float
    quantity_after: float
    reference_type: str
    reference_id: int
    created_by: int | None
    created_by_name: str | None
    created_at: datetime


class ProductStockSummary(BaseModel):
    product_id: int
    name: str
    sku: str
    category: str
    unit: str
    total_stock: float
    stock_status: StockStatus
    min_quantity: float | None = None
    locations: list[dict]
