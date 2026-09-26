from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    func,
)

from app.database import Base


class StockLedger(Base):
    __tablename__ = "stock_ledger"
    __table_args__ = (
        CheckConstraint(
            "movement_type IN ('opening_balance', 'receipt', 'delivery', 'transfer_in', 'transfer_out', 'adjustment')",
            name="ck_ledger_movement_type",
        ),
        CheckConstraint("quantity_before >= 0", name="ck_ledger_before_nonnegative"),
        CheckConstraint("quantity_after >= 0", name="ck_ledger_after_nonnegative"),
        Index("ix_ledger_product_created", "product_id", "created_at"),
        Index("ix_ledger_location_created", "location_id", "created_at"),
    )

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(
        Integer,
        ForeignKey("products.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    location_id = Column(
        Integer,
        ForeignKey("locations.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    movement_type = Column(String(32), nullable=False)
    quantity_change = Column(Float, nullable=False)
    quantity_before = Column(Float, nullable=False)
    quantity_after = Column(Float, nullable=False)
    reference_type = Column(String(32), nullable=False)
    reference_id = Column(Integer, nullable=False)
    created_by = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
