import os

os.environ['FIREBASE_ALLOW_UNVERIFIED'] = '1'
os.environ['DATABASE_URL'] = 'sqlite:///:memory:'

import pytest  # noqa: E402

from app import create_app  # noqa: E402
from app.db import db as _db  # noqa: E402


@pytest.fixture()
def app():
    app = create_app()
    app.config['TESTING'] = True
    with app.app_context():
        _db.create_all()
    yield app
    with app.app_context():
        _db.session.remove()
        _db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


def auth(token='test-user-1'):
    return {'Authorization': f'Bearer {token}'}
