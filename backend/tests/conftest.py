import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker

TEST_DATABASE_URL = os.environ.get("TEST_DATABASE_URL")
if not TEST_DATABASE_URL:
    raise RuntimeError("Set TEST_DATABASE_URL to a dedicated PostgreSQL test database")

test_url = make_url(TEST_DATABASE_URL)
if test_url.drivername in {"postgres", "postgresql"}:
    test_url = test_url.set(drivername="postgresql+psycopg")
if (
    test_url.drivername != "postgresql+psycopg"
    or not (test_url.database or "").endswith("_test")
):
    raise RuntimeError(
        "TEST_DATABASE_URL must use psycopg and target a PostgreSQL database ending in _test"
    )
TEST_DATABASE_URL = test_url.render_as_string(hide_password=False)

os.environ["DATABASE_URL"] = TEST_DATABASE_URL

from app.core.config import settings
from app.core.dependencies import get_db
from app.database import Base
from app.main import app


@pytest.fixture
def client(monkeypatch):
    engine = create_engine(TEST_DATABASE_URL, pool_pre_ping=True)
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    monkeypatch.setattr(settings, "jwt_secret", "test-secret-with-at-least-32-bytes")
    monkeypatch.setattr(settings, "environment", "development")

    yield TestClient(app)

    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)
    engine.dispose()
