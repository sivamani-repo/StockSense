from sqlalchemy import Column, Float, ForeignKey, Index, Integer, text

from app.database import Base


class ReorderRule(Base):
    __tablename__ = "reorder_rules"
    __table_args__ = (
        Index(
            "uq_reorder_rule_product_global",
            "product_id",
            unique=True,
            postgresql_where=text("location_id IS NULL"),
        ),
        Index(
            "uq_reorder_rule_product_location",
            "product_id",
            "location_id",
            unique=True,
            postgresql_where=text("location_id IS NOT NULL"),
        ),
    )

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(
        Integer,
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    location_id = Column(
        Integer,
        ForeignKey("locations.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    minimum_quantity = Column(Float, nullable=False)
    maximum_quantity = Column(Float, nullable=True)
    reorder_quantity = Column(Float, nullable=False)
