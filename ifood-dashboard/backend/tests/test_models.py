from app import models


def test_create_login(db):
    user = models.Login(name="Test", email="test@example.com", password_hash="hash")
    db.add(user)
    db.commit()

    stored = db.query(models.Login).filter_by(email="test@example.com").first()
    assert stored is not None
    assert stored.name == "Test"

