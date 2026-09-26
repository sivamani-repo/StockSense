def product_payload(**overrides):
    payload = {
        "name": "Steel Rod",
        "sku": "STEEL-001",
        "category": "Metals",
        "unit": "kg",
        "stock": 12,
    }
    payload.update(overrides)
    return payload


def test_product_crud_search_and_legacy_fields(client):
    created = client.post("/products", json=product_payload())
    assert created.status_code == 201
    product = created.json()
    assert product["name"] == "Steel Rod"
    assert product["sku"] == "STEEL-001"
    assert product["category"] == "Metals"
    assert product["unit"] == "kg"
    assert product["stock"] == 12
    assert product["category_id"] > 0

    product_id = product["id"]
    assert client.get("/products").json()[0]["id"] == product_id
    assert client.get(f"/products/{product_id}").status_code == 200
    assert client.get("/products/search?sku=STEEL").json()[0]["id"] == product_id

    updated = client.put(
        f"/products/{product_id}",
        json=product_payload(name="Steel Rod XL", stock=15),
    )
    assert updated.status_code == 200
    assert updated.json()["name"] == "Steel Rod XL"
    assert updated.json()["stock"] == 15

    assert client.post("/products", json=product_payload(name="Duplicate")).status_code == 409
    assert client.delete(f"/products/{product_id}").status_code == 200
    assert client.get(f"/products/{product_id}").status_code == 404


def test_product_rejects_invalid_stock_and_missing_category(client):
    assert client.post("/products", json=product_payload(stock=-1)).status_code == 422
    assert client.post(
        "/products",
        json=product_payload(category_id=987654),
    ).status_code == 404
