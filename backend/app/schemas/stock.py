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
