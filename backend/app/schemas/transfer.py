from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


TransferStatus = Literal["draft", "waiting", "ready", "done", "canceled"]


class TransferItemCreate(BaseModel):
    product_id: int = Field(gt=0)
    quantity: float = Field(gt=0)


class TransferCreate(BaseModel):
    source_location_id: int = Field(gt=0)
    destination_location_id: int = Field(gt=0)
    items: list[TransferItemCreate] = Field(min_length=1)

    @model_validator(mode="after")
    def validate_locations_and_items(self):
        if self.source_location_id == self.destination_location_id:
            raise ValueError("Source and destination locations must differ")
        product_ids = [item.product_id for item in self.items]
        if len(product_ids) != len(set(product_ids)):
            raise ValueError("A transfer may include each product only once")
        return self


class TransferItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: float

    model_config = ConfigDict(from_attributes=True)


class TransferResponse(BaseModel):
    id: int
    source_location_id: int
    destination_location_id: int
    status: TransferStatus
    created_by: int
    created_at: datetime
    completed_at: datetime | None
    items: list[TransferItemResponse]

    model_config = ConfigDict(from_attributes=True)
