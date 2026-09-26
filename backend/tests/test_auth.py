def signup(client, email="manager@example.com", password="StrongPass123"):
    return client.post(
        "/auth/signup",
        json={
            "name": "Inventory Manager",
            "email": email,
            "password": password,
            "role": "inventory_manager",
        },
    )


def login(client, email="manager@example.com", password="StrongPass123"):
    return client.post("/auth/login", json={"email": email, "password": password})


def test_signup_login_and_current_profile(client):
    response = signup(client)
    assert response.status_code == 201
    user = response.json()
    assert user["email"] == "manager@example.com"
    assert "hashed_password" not in user

    assert signup(client).status_code == 409
    token_response = login(client)
    assert token_response.status_code == 200
    token = token_response.json()["access_token"]

    profile = client.get("/users/me", headers={"Authorization": f"Bearer {token}"})
    assert profile.status_code == 200
    assert profile.json()["id"] == user["id"]


def test_invalid_login_and_unauthenticated_profile(client):
    signup(client)
    assert login(client, password="incorrect-password").status_code == 401
    assert client.get("/users/me").status_code == 401


def test_profile_update_cannot_change_role_or_password(client):
    signup(client)
    token = login(client).json()["access_token"]
    response = client.put(
        "/users/me",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": "Updated Name"},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Name"
    assert response.json()["role"] == "inventory_manager"
    assert "hashed_password" not in response.json()

    forbidden_update = client.put(
        "/users/me",
        headers={"Authorization": f"Bearer {token}"},
        json={"role": "warehouse_staff"},
    )
    assert forbidden_update.status_code == 422


def test_password_reset_changes_password_and_is_single_use(client):
    signup(client)
    request = client.post(
        "/auth/request-password-reset",
        json={"email": "manager@example.com"},
    )
    assert request.status_code == 202
    otp = request.json()["development_otp"]
    assert otp.isdigit() and len(otp) == 6

    reset = client.post(
        "/auth/reset-password",
        json={
            "email": "manager@example.com",
            "otp": otp,
            "new_password": "NewStrongPass456",
        },
    )
    assert reset.status_code == 200
    assert login(client).status_code == 401
    assert login(client, password="NewStrongPass456").status_code == 200
    assert client.post(
        "/auth/reset-password",
        json={
            "email": "manager@example.com",
            "otp": otp,
            "new_password": "AnotherStrongPass789",
        },
    ).status_code == 400


def test_password_reset_limits_attempts_and_throttles_requests(client):
    signup(client)
    request_url = "/auth/request-password-reset"
    request = client.post(request_url, json={"email": "manager@example.com"})
    otp = request.json()["development_otp"]

    throttled = client.post(request_url, json={"email": "manager@example.com"})
    assert throttled.status_code == 202
    assert throttled.json()["development_otp"] is None

    for _ in range(5):
        response = client.post(
            "/auth/reset-password",
            json={
                "email": "manager@example.com",
                "otp": "000000" if otp != "000000" else "000001",
                "new_password": "AnotherStrongPass789",
            },
        )
        assert response.status_code == 400

    blocked = client.post(
        "/auth/reset-password",
        json={
            "email": "manager@example.com",
            "otp": otp,
            "new_password": "AnotherStrongPass789",
        },
    )
    assert blocked.status_code == 400
