from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


ReceiptStatus = Literal["draft", "waiting", "ready", "done", "canceled"]


class ReceiptItemCreate(BaseModel):
    product_id: int = Field(gt=0)
    quantity: float = Field(gt=0)


class ReceiptCreate(BaseModel):
    supplier: str = Field(min_length=1, max_length=160)
    location_id: int = Field(gt=0)
    items: list[ReceiptItemCreate] = Field(min_length=1)

    @field_validator("supplier")
    @classmethod
    def strip_supplier(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Supplier must not be blank")
        return value

    @model_validator(mode="after")
    def reject_duplicate_products(self):
        product_ids = [item.product_id for item in self.items]
        if len(product_ids) != len(set(product_ids)):
            raise ValueError("A receipt may include each product only once")
        return self


class ReceiptItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: float

    model_config = ConfigDict(from_attributes=True)


class ReceiptResponse(BaseModel):
    id: int
    supplier: str
    location_id: int
    status: ReceiptStatus
    created_by: int
    created_at: datetime
    validated_at: datetime | None
    items: list[ReceiptItemResponse]

    model_config = ConfigDict(from_attributes=True)
