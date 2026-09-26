def manager_headers(client):
    client.post(
        "/auth/signup",
        json={
            "name": "Inventory Manager",
            "email": "manager@example.com",
            "password": "StrongPass123",
            "role": "inventory_manager",
        },
    )
    token = client.post(
        "/auth/login",
        json={"email": "manager@example.com", "password": "StrongPass123"},
    ).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_category_references_and_warehouse_locations(client):
    headers = manager_headers(client)
    category = client.post(
        "/categories",
        headers=headers,
        json={"name": "Components", "description": "Inventory parts"},
    )
    assert category.status_code == 201
    category_id = category.json()["id"]
    assert client.post(
        "/categories",
        headers=headers,
        json={"name": "Components"},
    ).status_code == 409

    product = client.post(
        "/products",
        json={
            "name": "Bearing",
            "sku": "BEARING-01",
            "category": "Components",
            "category_id": category_id,
            "unit": "each",
            "stock": 0,
        },
    )
    assert product.status_code == 201
    assert client.delete(f"/categories/{category_id}", headers=headers).status_code == 409

    assert client.post(
        "/locations",
        headers=headers,
        json={"warehouse_id": 99999, "name": "Rack", "code": "R-1"},
    ).status_code == 404
    warehouse = client.post(
        "/warehouses",
        headers=headers,
        json={"name": "Main Warehouse", "code": "MAIN"},
    )
    assert warehouse.status_code == 201
    warehouse_id = warehouse.json()["id"]
    location_payload = {"warehouse_id": warehouse_id, "name": "Rack A", "code": "A"}
    location = client.post("/locations", headers=headers, json=location_payload)
    assert location.status_code == 201
    assert client.post("/locations", headers=headers, json=location_payload).status_code == 409

    assert client.post(
        "/reorder-rules",
        headers=headers,
        json={
            "product_id": product.json()["id"],
            "location_id": location.json()["id"],
            "minimum_quantity": 3,
            "maximum_quantity": 20,
            "reorder_quantity": 10,
        },
    ).status_code == 201
