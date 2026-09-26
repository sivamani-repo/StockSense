from pydantic import BaseModel


class ProductCreate(BaseModel):
    name: str
    sku: str
    category: str
    unit: str
    stock: float = 0


class ProductResponse(ProductCreate):
    id: int

    class Config:
        from_attributes = True