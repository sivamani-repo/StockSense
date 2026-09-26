from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.product import Product
from app.models.reorder_rule import ReorderRule
from app.schemas.product import ProductCreate, ProductUpdate
from app.services.stock import create_opening_balance, reconcile_product_total


def _resolve_category(
	db: Session,
	category_name: str,
	category_id: int | None,
) -> Category:
	if category_id is not None:
		category = db.get(Category, category_id)
		if category is None:
			raise HTTPException(
				status_code=status.HTTP_404_NOT_FOUND,
				detail="Category not found",
			)
		return category

	category = db.scalar(select(Category).where(Category.name == category_name))
	if category is None:
		category = Category(name=category_name)
		db.add(category)
		db.flush()
	return category


def create_product(db: Session, data: ProductCreate) -> Product:
	if db.scalar(select(Product.id).where(Product.sku == data.sku)) is not None:
		raise HTTPException(
			status_code=status.HTTP_409_CONFLICT,
			detail="SKU already exists",
		)

	try:
		category = _resolve_category(db, data.category, data.category_id)
		product = Product(
			name=data.name,
			sku=data.sku,
			category=category.name,
			category_id=category.id,
			unit=data.unit,
			stock=0,
		)
		db.add(product)
		db.flush()
		if data.stock > 0:
			create_opening_balance(
				db,
				product=product,
				quantity=data.stock,
				location_id=data.location_id,
			)
		db.commit()
	except IntegrityError:
		db.rollback()
		raise HTTPException(
			status_code=status.HTTP_409_CONFLICT,
			detail="SKU or category already exists",
		) from None
	db.refresh(product)
	return product


def list_products(
	db: Session,
	*,
	name: str | None = None,
	sku: str | None = None,
	category: str | None = None,
	category_id: int | None = None,
	stock_status: str | None = None,
) -> list[Product]:
	query = select(Product)
	if name:
		query = query.where(Product.name.ilike(f"%{name.strip()}%"))
	if sku:
		query = query.where(Product.sku.ilike(f"%{sku.strip()}%"))
	if category:
		query = query.where(Product.category.ilike(f"%{category.strip()}%"))
	if category_id is not None:
		query = query.where(Product.category_id == category_id)

	low_stock = (
		select(ReorderRule.id)
		.where(
			ReorderRule.product_id == Product.id,
			ReorderRule.location_id.is_(None),
			Product.stock <= ReorderRule.minimum_quantity,
		)
		.exists()
	)
	if stock_status == "out_of_stock":
		query = query.where(Product.stock <= 0)
	elif stock_status == "low_stock":
		query = query.where(Product.stock > 0, low_stock)
	elif stock_status == "in_stock":
		query = query.where(Product.stock > 0, ~low_stock)
	return list(db.scalars(query.order_by(Product.name, Product.id)).all())


def get_product(db: Session, product_id: int) -> Product:
	product = db.get(Product, product_id)
	if product is None:
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail="Product not found",
		)
	return product


def update_product(db: Session, product_id: int, data: ProductUpdate) -> Product:
	product = get_product(db, product_id)
	duplicate = db.scalar(
		select(Product.id).where(
			Product.sku == data.sku,
			Product.id != product_id,
		)
	)
	if duplicate is not None:
		raise HTTPException(
			status_code=status.HTTP_409_CONFLICT,
			detail="SKU already exists",
		)

	try:
		category = _resolve_category(db, data.category, data.category_id)
		product.name = data.name
		product.sku = data.sku
		product.category = category.name
		product.category_id = category.id
		product.unit = data.unit
		reconcile_product_total(
			db,
			product=product,
			desired_total=data.stock,
			location_id=data.location_id,
		)
		db.commit()
	except IntegrityError:
		db.rollback()
		raise HTTPException(
			status_code=status.HTTP_409_CONFLICT,
			detail="SKU or category already exists",
		) from None
	db.refresh(product)
	return product


def delete_product(db: Session, product_id: int) -> None:
	product = get_product(db, product_id)
	db.delete(product)
	try:
		db.commit()
	except IntegrityError:
		db.rollback()
		raise HTTPException(
			status_code=status.HTTP_409_CONFLICT,
			detail="Product is referenced by inventory records",
		) from None
