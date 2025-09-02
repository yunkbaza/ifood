from app import models


def test_register_login_and_access_protected_route(client, db):
    # create a unit to satisfy foreign key if needed
    unit = models.Unidade(nome="Loja Teste")
    db.add(unit)
    db.commit()

    response = client.post(
        "/auth/register",
        json={
            "name": "User",
            "email": "user@example.com",
            "password": "secret",
            "id_unidade": unit.id,
        },
    )
    assert response.status_code == 200

    login_resp = client.post(
        "/auth/login", json={"email": "user@example.com", "password": "secret"}
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]

    lojas_resp = client.get(
        "/lojas", headers={"Authorization": f"Bearer {token}"}
    )
    assert lojas_resp.status_code == 200

