import bcrypt

from app import models
from app.main import authenticate_user, create_access_token


def test_authenticate_user_success(db):
    hashed = bcrypt.hashpw(b"secret", bcrypt.gensalt()).decode()
    user = models.Login(name="User", email="user@example.com", password_hash=hashed)
    db.add(user)
    db.commit()

    authenticated = authenticate_user(db, "user@example.com", "secret")
    assert authenticated is not None
    assert authenticated.email == "user@example.com"


def test_create_access_token():
    token = create_access_token({"sub": "user@example.com"})
    assert isinstance(token, str)

