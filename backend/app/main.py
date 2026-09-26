import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database import Base, engine
from app.routers import (
    adjustments,
    auth,
    categories,
    dashboard,
    deliveries,
    locations,
    products,
    receipts,
    reorder_rules,
    stock,
    transfers,
    users,
    warehouses,
)


logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    """Initialize database tables before serving requests."""
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized")
    yield


app = FastAPI(
    title=settings.app_name,
    description=settings.app_description,
    version=settings.app_version,
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(dashboard.router)
app.include_router(products.router)
app.include_router(categories.router)
app.include_router(receipts.router)
app.include_router(deliveries.router)
app.include_router(transfers.router)
app.include_router(adjustments.router)
app.include_router(stock.router)
app.include_router(warehouses.router)
app.include_router(locations.router)
app.include_router(reorder_rules.router)


@app.get("/")
def root():
    """Return a basic API welcome message."""
    return {"message": "StockSense API is running"}


@app.get("/health", tags=["Health"])
def health_check() -> dict[str, str]:
    """Report that the API process is available."""
    return {"status": "ok"}