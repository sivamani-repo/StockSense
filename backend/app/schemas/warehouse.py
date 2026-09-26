from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class WarehouseCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    code: str = Field(min_length=1, max_length=40)
    address: str | None = Field(default=None, max_length=500)

    @field_validator("name", "code")
    @classmethod
    def strip_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Field must not be blank")
        return value


class WarehouseUpdate(WarehouseCreate):
    is_active: bool = True


class WarehouseResponse(BaseModel):
    id: int
    name: str
    code: str
    address: str | None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
