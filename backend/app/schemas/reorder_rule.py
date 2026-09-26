from pydantic import BaseModel, ConfigDict, Field, model_validator


class ReorderRuleCreate(BaseModel):
    product_id: int = Field(gt=0)
    location_id: int | None = Field(default=None, gt=0)
    minimum_quantity: float = Field(ge=0)
    maximum_quantity: float | None = Field(default=None, gt=0)
    reorder_quantity: float = Field(gt=0)

    @model_validator(mode="after")
    def validate_quantity_range(self):
        if (
            self.maximum_quantity is not None
            and self.maximum_quantity < self.minimum_quantity
        ):
            raise ValueError("Maximum quantity cannot be lower than the minimum")
        return self


class ReorderRuleResponse(ReorderRuleCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)
