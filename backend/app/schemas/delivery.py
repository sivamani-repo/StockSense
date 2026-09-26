from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


DeliveryStatus = Literal[
    "draft",
    "waiting",
    "ready",
    "picked",
    "packed",
    "done",
    "canceled",
]


class DeliveryItemCreate(BaseModel):
    product_id: int = Field(gt=0)
    quantity: float = Field(gt=0)


class DeliveryCreate(BaseModel):
    customer: str = Field(min_length=1, max_length=160)
    location_id: int = Field(gt=0)
    items: list[DeliveryItemCreate] = Field(min_length=1)

    @field_validator("customer")
    @classmethod
    def strip_customer(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Customer must not be blank")
        return value

    @model_validator(mode="after")
    def reject_duplicate_products(self):
        product_ids = [item.product_id for item in self.items]
        if len(product_ids) != len(set(product_ids)):
            raise ValueError("A delivery may include each product only once")
        return self


class DeliveryItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: float

    model_config = ConfigDict(from_attributes=True)


class DeliveryResponse(BaseModel):
    id: int
    customer: str
    location_id: int
    status: DeliveryStatus
    created_by: int
    created_at: datetime
    validated_at: datetime | None
    items: list[DeliveryItemResponse]

    model_config = ConfigDict(from_attributes=True)
