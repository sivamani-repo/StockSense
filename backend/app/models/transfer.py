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


class Transfer(Base):
    __tablename__ = "transfers"
    __table_args__ = (
        CheckConstraint(
            "status IN ('draft', 'waiting', 'ready', 'done', 'canceled')",
            name="ck_transfer_status",
        ),
        CheckConstraint("source_location_id != destination_location_id", name="ck_transfer_distinct_locations"),
    )

    id = Column(Integer, primary_key=True, index=True)
    source_location_id = Column(
        Integer,
        ForeignKey("locations.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    destination_location_id = Column(
        Integer,
        ForeignKey("locations.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    status = Column(String(20), nullable=False, default="draft", server_default="draft")
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    items = relationship("TransferItem", cascade="all, delete-orphan", lazy="selectin")


class TransferItem(Base):
    __tablename__ = "transfer_items"
    __table_args__ = (
        UniqueConstraint("transfer_id", "product_id", name="uq_transfer_item_product"),
        CheckConstraint("quantity > 0", name="ck_transfer_item_quantity_positive"),
    )

    id = Column(Integer, primary_key=True)
    transfer_id = Column(
        Integer,
        ForeignKey("transfers.id", ondelete="CASCADE"),
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
