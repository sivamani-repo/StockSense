"""Seed script to populate StockSense with realistic demo inventory data."""

import logging
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.database import Base, SessionLocal, engine
from app.models.category import Category
from app.models.delivery import Delivery, DeliveryItem
from app.models.location import Location
from app.models.product import Product
from app.models.receipt import Receipt, ReceiptItem
from app.models.reorder_rule import ReorderRule
from app.models.stock import StockLevel
from app.models.transfer import Transfer, TransferItem
from app.models.adjustment import Adjustment, AdjustmentItem
from app.models.user import User
from app.models.warehouse import Warehouse
from app.services.stock import change_stock, ensure_default_location

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def seed_database():
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        # 1. Users
        logger.info("Seeding users...")
        admin_user = db.scalar(select(User).where(User.email == "admin@stocksense.com"))
        if not admin_user:
            admin_user = User(
                name="Alex Mercer",
                email="admin@stocksense.com",
                hashed_password=hash_password("AdminPass123!"),
                role="inventory_manager",
                is_active=True,
            )
            db.add(admin_user)

        staff_user = db.scalar(select(User).where(User.email == "staff@stocksense.com"))
        if not staff_user:
            staff_user = User(
                name="Jordan Blake",
                email="staff@stocksense.com",
                hashed_password=hash_password("StaffPass123!"),
                role="warehouse_staff",
                is_active=True,
            )
            db.add(staff_user)
        db.flush()

        # 2. Warehouses & Locations
        logger.info("Seeding warehouses and locations...")
        main_wh = db.scalar(select(Warehouse).where(Warehouse.code == "MAIN"))
        if not main_wh:
            main_wh = Warehouse(name="Central Distribution Hub", code="MAIN")
            db.add(main_wh)
            db.flush()

        east_wh = db.scalar(select(Warehouse).where(Warehouse.code == "EAST"))
        if not east_wh:
            east_wh = Warehouse(name="East Coast Fulfillment", code="EAST")
            db.add(east_wh)
            db.flush()

        loc_stock = db.scalar(select(Location).where(Location.warehouse_id == main_wh.id, Location.code == "STOCK"))
        if not loc_stock:
            loc_stock = Location(warehouse_id=main_wh.id, name="Main Stock Floor", code="STOCK")
            db.add(loc_stock)

        loc_rack_a = db.scalar(select(Location).where(Location.warehouse_id == main_wh.id, Location.code == "RACK-A1"))
        if not loc_rack_a:
            loc_rack_a = Location(warehouse_id=main_wh.id, name="Pallet Rack A-01", code="RACK-A1")
            db.add(loc_rack_a)

        loc_recv = db.scalar(select(Location).where(Location.warehouse_id == main_wh.id, Location.code == "RECV"))
        if not loc_recv:
            loc_recv = Location(warehouse_id=main_wh.id, name="Inbound Receiving Bay", code="RECV")
            db.add(loc_recv)

        loc_disp = db.scalar(select(Location).where(Location.warehouse_id == main_wh.id, Location.code == "DISP"))
        if not loc_disp:
            loc_disp = Location(warehouse_id=main_wh.id, name="Outbound Dispatch Dock", code="DISP")
            db.add(loc_disp)

        loc_east = db.scalar(select(Location).where(Location.warehouse_id == east_wh.id, Location.code == "EAST-ZN1"))
        if not loc_east:
            loc_east = Location(warehouse_id=east_wh.id, name="East Zone Primary", code="EAST-ZN1")
            db.add(loc_east)
        db.flush()

        # 3. Categories
        logger.info("Seeding categories...")
        cat_names = ["Electronics", "Office Supplies", "Industrial Hardware", "Furniture", "Packaging"]
        cat_map = {}
        for name in cat_names:
            c = db.scalar(select(Category).where(Category.name == name))
            if not c:
                c = Category(name=name)
                db.add(c)
                db.flush()
            cat_map[name] = c

        # 4. Products
        logger.info("Seeding products...")
        demo_products = [
            ("Ergonomic Executive Chair", "FUR-001", "Furniture", "pcs", 42.0),
            ("Standing Desk Pro 60in", "FUR-002", "Furniture", "pcs", 6.0),  # Low stock
            ("Mechanical RGB Keyboard", "ELE-101", "Electronics", "pcs", 85.0),
            ("27-inch 4K IPS Monitor", "ELE-102", "Electronics", "pcs", 14.0),
            ("Precision Wireless Mouse", "ELE-103", "Electronics", "pcs", 0.0),  # Out of stock
            ("Industrial Laser Scanner", "IND-201", "Industrial Hardware", "pcs", 24.0),
            ("Heavy Duty Pallet Straps", "IND-202", "Industrial Hardware", "rolls", 120.0),
            ("Recycled Shipping Box (M)", "PKG-301", "Packaging", "boxes", 450.0),
            ("Bubble Cushion Wrap 100m", "PKG-302", "Packaging", "rolls", 4.0),  # Low stock
            ("High Yield Black Toner", "OFF-401", "Office Supplies", "cartridges", 22.0),
        ]

        prod_map = {}
        for name, sku, cat, unit, stock_val in demo_products:
            p = db.scalar(select(Product).where(Product.sku == sku))
            if not p:
                p = Product(
                    name=name,
                    sku=sku,
                    category=cat,
                    category_id=cat_map[cat].id,
                    unit=unit,
                    stock=0,
                )
                db.add(p)
                db.flush()
                # Record opening stock
                if stock_val > 0:
                    change_stock(
                        db,
                        product_id=p.id,
                        location_id=loc_stock.id,
                        quantity_change=stock_val,
                        movement_type="opening_balance",
                        reference_type="product_opening_balance",
                        reference_id=p.id,
                        created_by=admin_user.id,
                    )
            prod_map[sku] = p
        db.flush()

        # 5. Reorder Rules
        logger.info("Seeding reorder rules...")
        rule_configs = [
            ("FUR-002", 10.0, 50.0, 20.0),
            ("ELE-103", 15.0, 100.0, 40.0),
            ("PKG-302", 10.0, 80.0, 25.0),
            ("ELE-102", 10.0, 40.0, 15.0),
        ]
        for sku, min_q, max_q, reorder_q in rule_configs:
            pid = prod_map[sku].id
            existing = db.scalar(select(ReorderRule).where(ReorderRule.product_id == pid, ReorderRule.location_id.is_(None)))
            if not existing:
                db.add(
                    ReorderRule(
                        product_id=pid,
                        location_id=None,
                        minimum_quantity=min_q,
                        maximum_quantity=max_q,
                        reorder_quantity=reorder_q,
                    )
                )

        # 6. Sample Receipt (1 done, 1 draft)
        logger.info("Seeding sample receipts...")
        if not db.scalar(select(Receipt).limit(1)):
            rec1 = Receipt(
                supplier="Global Tech Components Ltd",
                location_id=loc_stock.id,
                status="done",
                created_by=admin_user.id,
            )
            db.add(rec1)
            db.flush()
            db.add(ReceiptItem(receipt_id=rec1.id, product_id=prod_map["ELE-101"].id, quantity=30))
            db.add(ReceiptItem(receipt_id=rec1.id, product_id=prod_map["ELE-102"].id, quantity=10))

            rec2 = Receipt(
                supplier="ErgoWork Industrial Imports",
                location_id=loc_stock.id,
                status="draft",
                created_by=staff_user.id,
            )
            db.add(rec2)
            db.flush()
            db.add(ReceiptItem(receipt_id=rec2.id, product_id=prod_map["FUR-002"].id, quantity=25))
            db.add(ReceiptItem(receipt_id=rec2.id, product_id=prod_map["ELE-103"].id, quantity=50))

        # 7. Sample Delivery (1 done, 1 ready, 1 draft)
        logger.info("Seeding sample deliveries...")
        if not db.scalar(select(Delivery).limit(1)):
            del1 = Delivery(
                customer="Acme Corporation HQ",
                location_id=loc_stock.id,
                status="done",
                created_by=admin_user.id,
            )
            db.add(del1)
            db.flush()
            db.add(DeliveryItem(delivery_id=del1.id, product_id=prod_map["FUR-001"].id, quantity=5))

            del2 = Delivery(
                customer="Hyperion Dynamics",
                location_id=loc_stock.id,
                status="ready",
                created_by=staff_user.id,
            )
            db.add(del2)
            db.flush()
            db.add(DeliveryItem(delivery_id=del2.id, product_id=prod_map["ELE-101"].id, quantity=10))

            del3 = Delivery(
                customer="Vanguard Logistics",
                location_id=loc_stock.id,
                status="draft",
                created_by=staff_user.id,
            )
            db.add(del3)
            db.flush()
            db.add(DeliveryItem(delivery_id=del3.id, product_id=prod_map["IND-201"].id, quantity=4))

        # 8. Sample Transfer (1 done, 1 draft)
        logger.info("Seeding sample transfers...")
        if not db.scalar(select(Transfer).limit(1)):
            trf1 = Transfer(
                source_location_id=loc_stock.id,
                destination_location_id=loc_rack_a.id,
                status="done",
                created_by=admin_user.id,
            )
            db.add(trf1)
            db.flush()
            db.add(TransferItem(transfer_id=trf1.id, product_id=prod_map["IND-202"].id, quantity=20))

            trf2 = Transfer(
                source_location_id=loc_stock.id,
                destination_location_id=loc_disp.id,
                status="draft",
                created_by=staff_user.id,
            )
            db.add(trf2)
            db.flush()
            db.add(TransferItem(transfer_id=trf2.id, product_id=prod_map["PKG-301"].id, quantity=50))

        # 9. Sample Adjustment (1 done, 1 draft)
        logger.info("Seeding sample adjustments...")
        if not db.scalar(select(Adjustment).limit(1)):
            adj1 = Adjustment(
                location_id=loc_stock.id,
                status="done",
                reason="Cycle count – office supplies shelf",
                created_by=admin_user.id,
            )
            db.add(adj1)
            db.flush()
            db.add(AdjustmentItem(adjustment_id=adj1.id, product_id=prod_map["OFF-401"].id, counted_quantity=22))

            adj2 = Adjustment(
                location_id=loc_stock.id,
                status="draft",
                reason="Quarterly physical inventory check",
                created_by=staff_user.id,
            )
            db.add(adj2)
            db.flush()
            db.add(AdjustmentItem(adjustment_id=adj2.id, product_id=prod_map["FUR-001"].id, counted_quantity=40))

        db.commit()
        logger.info("Database successfully seeded with realistic inventory demo data!")
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
