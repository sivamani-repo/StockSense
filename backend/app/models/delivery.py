from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship

from app.database import Base


class Delivery(Base):
    __tablename__ = "deliveries"
    __table_args__ = (
        CheckConstraint(
            "status IN ('draft', 'waiting', 'ready', 'picked', 'packed', 'done', 'canceled')",
            name="ck_delivery_status",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    customer = Column(String(160), nullable=False)
    location_id = Column(
        Integer,
        ForeignKey("locations.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    status = Column(String(20), nullable=False, default="draft", server_default="draft")
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    validated_at = Column(DateTime(timezone=True), nullable=True)
    items = relationship("DeliveryItem", cascade="all, delete-orphan", lazy="selectin")


class DeliveryItem(Base):
    __tablename__ = "delivery_items"
    __table_args__ = (
        UniqueConstraint("delivery_id", "product_id", name="uq_delivery_item_product"),
        CheckConstraint("quantity > 0", name="ck_delivery_item_quantity_positive"),
    )

    id = Column(Integer, primary_key=True)
    delivery_id = Column(
        Integer,
        ForeignKey("deliveries.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    product_id = Column(
        Integer,
        ForeignKey("products.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    quantity = Column(Float, nullable=False)
