from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, UniqueConstraint, func

from app.database import Base


class Location(Base):
    __tablename__ = "locations"
    __table_args__ = (
        UniqueConstraint("warehouse_id", "code", name="uq_location_warehouse_code"),
    )

    id = Column(Integer, primary_key=True, index=True)
    warehouse_id = Column(
        Integer,
        ForeignKey("warehouses.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    name = Column(String(120), nullable=False)
    code = Column(String(40), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True, server_default="true")
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
