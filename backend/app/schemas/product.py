from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    sku: str = Field(min_length=1, max_length=64)
    category: str = Field(min_length=1, max_length=120)
    category_id: int | None = Field(default=None, gt=0)
    location_id: int | None = Field(default=None, gt=0)
    unit: str = Field(min_length=1, max_length=32)
    stock: float = Field(default=0, ge=0)

    @field_validator("name", "sku", "category", "unit")
    @classmethod
    def strip_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Field must not be blank")
        return value


class ProductUpdate(ProductCreate):
    pass


class ProductResponse(BaseModel):
    id: int
    name: str
    sku: str
    category: str
    category_id: int
    unit: str
    stock: float
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)