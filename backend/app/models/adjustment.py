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


class Adjustment(Base):
    __tablename__ = "adjustments"
    __table_args__ = (
        CheckConstraint(
            "status IN ('draft', 'done', 'canceled')",
            name="ck_adjustment_status",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(
        Integer,
        ForeignKey("locations.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    status = Column(String(20), nullable=False, default="draft", server_default="draft")
    reason = Column(String(500), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    items = relationship("AdjustmentItem", cascade="all, delete-orphan", lazy="selectin")


class AdjustmentItem(Base):
    __tablename__ = "adjustment_items"
    __table_args__ = (
        UniqueConstraint("adjustment_id", "product_id", name="uq_adjustment_item_product"),
        CheckConstraint("counted_quantity >= 0", name="ck_adjustment_counted_nonnegative"),
    )

    id = Column(Integer, primary_key=True)
    adjustment_id = Column(
        Integer,
        ForeignKey("adjustments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    product_id = Column(
        Integer,
        ForeignKey("products.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    counted_quantity = Column(Float, nullable=False)
    previous_quantity = Column(Float, nullable=True)
    difference = Column(Float, nullable=True)
