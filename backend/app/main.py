from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy.orm import Session

from app.database import Base, SessionLocal, engine
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductResponse


app = FastAPI(
    title="StockSense API",
    description="Backend API for the StockSense Inventory Management System",
    version="1.0.0",
)

# Create database tables
Base.metadata.create_all(bind=engine)


def get_db():
    """Provide a database session for each request."""
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@app.get("/")
def root():
    """Health check endpoint."""
    return {"message": "StockSense API is running"}


# -------------------------------------------------------------------
# PRODUCT CRUD
# -------------------------------------------------------------------

@app.post(
    "/products",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
):
    """Create a new product."""
    existing_product = (
        db.query(Product)
        .filter(Product.sku == product.sku)
        .first()
    )

    if existing_product:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="SKU already exists",
        )

    new_product = Product(**product.model_dump())

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product


@app.get(
    "/products",
    response_model=list[ProductResponse],
)
def get_products(db: Session = Depends(get_db)):
    """Return all products."""
    return db.query(Product).all()


@app.get(
    "/products/{product_id}",
    response_model=ProductResponse,
)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
):
    """Return a product by ID."""
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    return product


@app.put(
    "/products/{product_id}",
    response_model=ProductResponse,
)
def update_product(
    product_id: int,
    product_data: ProductCreate,
    db: Session = Depends(get_db),
):
    """Update an existing product."""
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    existing_sku = (
        db.query(Product)
        .filter(
            Product.sku == product_data.sku,
            Product.id != product_id,
        )
        .first()
    )

    if existing_sku:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="SKU already exists",
        )

    product.name = product_data.name
    product.sku = product_data.sku
    product.category = product_data.category
    product.unit = product_data.unit
    product.stock = product_data.stock

    db.commit()
    db.refresh(product)

    return product


@app.delete(
    "/products/{product_id}",
    status_code=status.HTTP_200_OK,
)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
):
    """Delete a product by ID."""
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    db.delete(product)
    db.commit()

    return {
        "message": "Product deleted successfully",
        "id": product_id,
    }