from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    func,
)
from sqlalchemy.orm import relationship

from app.database import Base


class Product(Base):
    __tablename__ = "products"
    __table_args__ = (CheckConstraint("stock >= 0", name="ck_product_stock_nonnegative"),)

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    sku = Column(String(64), unique=True, nullable=False, index=True)
    category_id = Column(
        Integer,
        ForeignKey("categories.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    category = Column(String(120), nullable=False)
    unit = Column(String(32), nullable=False)
    stock = Column(Float, nullable=False, default=0, server_default="0")
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    category_record = relationship("Category", back_populates="products")