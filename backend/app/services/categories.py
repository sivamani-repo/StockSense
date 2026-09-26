from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.product import Product
from app.schemas.category import CategoryCreate, CategoryUpdate


def create_category(db: Session, data: CategoryCreate) -> Category:
    if db.scalar(select(Category.id).where(Category.name == data.name)) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Category name already exists",
        )
    category = Category(name=data.name, description=data.description)
    db.add(category)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Category name already exists",
        ) from None
    db.refresh(category)
    return category


def list_categories(db: Session) -> list[Category]:
    return list(db.scalars(select(Category).order_by(Category.name)).all())


def get_category(db: Session, category_id: int) -> Category:
    category = db.get(Category, category_id)
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )
    return category


def update_category(
    db: Session,
    category_id: int,
    data: CategoryUpdate,
) -> Category:
    category = get_category(db, category_id)
    duplicate = db.scalar(
        select(Category.id).where(
            Category.name == data.name,
            Category.id != category_id,
        )
    )
    if duplicate is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Category name already exists",
        )

    category.name = data.name
    category.description = data.description
    db.query(Product).filter(Product.category_id == category.id).update(
        {Product.category: data.name},
        synchronize_session=False,
    )
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Category name already exists",
        ) from None
    db.refresh(category)
    return category


def delete_category(db: Session, category_id: int) -> None:
    category = get_category(db, category_id)
    has_products = db.scalar(
        select(Product.id).where(Product.category_id == category_id).limit(1)
    )
    if has_products is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Category is used by one or more products",
        )
    db.delete(category)
    db.commit()
