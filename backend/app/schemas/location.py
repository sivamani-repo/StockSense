from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class LocationCreate(BaseModel):
    warehouse_id: int = Field(gt=0)
    name: str = Field(min_length=1, max_length=120)
    code: str = Field(min_length=1, max_length=40)

    @field_validator("name", "code")
    @classmethod
    def strip_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Field must not be blank")
        return value


class LocationUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    code: str | None = Field(default=None, min_length=1, max_length=40)
    is_active: bool | None = None

    @field_validator("name", "code")
    @classmethod
    def strip_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        if not value:
            raise ValueError("Field must not be blank")
        return value

    model_config = ConfigDict(extra="forbid")


class LocationResponse(BaseModel):
    id: int
    warehouse_id: int
    name: str
    code: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
