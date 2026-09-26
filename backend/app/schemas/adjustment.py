from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


AdjustmentStatus = Literal["draft", "done", "canceled"]


class AdjustmentItemCreate(BaseModel):
    product_id: int = Field(gt=0)
    counted_quantity: float = Field(ge=0)


class AdjustmentCreate(BaseModel):
    location_id: int = Field(gt=0)
    reason: str = Field(min_length=1, max_length=500)
    items: list[AdjustmentItemCreate] = Field(min_length=1)

    @field_validator("reason")
    @classmethod
    def strip_reason(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Reason must not be blank")
        return value

    @model_validator(mode="after")
    def reject_duplicate_products(self):
        product_ids = [item.product_id for item in self.items]
        if len(product_ids) != len(set(product_ids)):
            raise ValueError("An adjustment may include each product only once")
        return self


class AdjustmentItemResponse(BaseModel):
    id: int
    product_id: int
    counted_quantity: float
    previous_quantity: float | None
    difference: float | None

    model_config = ConfigDict(from_attributes=True)


class AdjustmentResponse(BaseModel):
    id: int
    location_id: int
    status: AdjustmentStatus
    reason: str
    created_by: int
    created_at: datetime
    completed_at: datetime | None
    items: list[AdjustmentItemResponse]

    model_config = ConfigDict(from_attributes=True)
