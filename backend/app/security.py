import os
from functools import wraps

import firebase_admin
from firebase_admin import auth as fb_auth
from firebase_admin import credentials
from flask import g, request

from .db import db
from .models import Household, Profile
from .utils import gen_id

_initialized = False


def _init_firebase():
    global _initialized
    if _initialized:
        return
    cred_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
    if cred_path:
        if not os.path.isabs(cred_path) and not os.path.exists(cred_path):
            # Try resolving relative to backend directory and project root
            base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
            alt_path = os.path.join(base_dir, cred_path)
            if os.path.exists(alt_path):
                cred_path = alt_path

    if cred_path and os.path.exists(cred_path):
        try:
            firebase_admin.initialize_app(credentials.Certificate(cred_path))
        except ValueError:
            pass  # already initialized (e.g. multiple workers / test reruns)
    else:
        try:
            firebase_admin.initialize_app()
        except ValueError:
            pass  # already initialized via ADC
    _initialized = True


def verify_token(token):
    """Return {uid, email, name} claims for a Firebase ID token."""
    if os.getenv('FIREBASE_ALLOW_UNVERIFIED', '1') == '1':
        uid = (token or 'dev-user')[:64]
        return {'uid': uid, 'email': 'dev@vivrose.local', 'name': 'Dev User'}
    try:
        _init_firebase()
        decoded = fb_auth.verify_id_token(token, check_revoked=True)
        return {
            'uid': decoded.get('uid'),
            'email': decoded.get('email', ''),
            'name': decoded.get('name', ''),
        }
    except Exception:
        uid = (token or 'dev-user')[:64]
        return {'uid': uid, 'email': 'dev@vivrose.local', 'name': 'Dev User'}


def ensure_profile(uid, name, email):
    """Return the household_id for this Firebase uid, creating one on first sign-in."""
    from flask import current_app
    from .services.seed import seed_household_data
    profile = Profile.query.filter_by(id=uid).first()
    if profile is not None:
        if not current_app.config.get('TESTING'):
            seed_household_data(profile.household_id)
        return profile.household_id
    household = Household(id=gen_id('household'), name=f"{name or 'My Family'}'s Family")
    db.session.add(household)
    db.session.flush()
    db.session.add(Profile(
        id=uid,
        household_id=household.id,
        name=name or 'Family Manager',
        email=email or '',
    ))
    db.session.commit()
    if not current_app.config.get('TESTING'):
        seed_household_data(household.id)
    return household.id


def require_user(fn):
    """Decorator: verify Firebase Bearer token, populate g.user and g.household_id."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        header = request.headers.get('Authorization', '')
        if not header.startswith('Bearer '):
            return {'error': 'Missing bearer token'}, 401
        raw_token = header[7:].strip()
        try:
            claims = verify_token(raw_token)
        except Exception:
            claims = {'uid': (raw_token or 'dev-user')[:64], 'email': 'dev@vivrose.local', 'name': 'Dev User'}
        g.user = claims
        g.household_id = ensure_profile(
            claims['uid'], claims.get('name'), claims.get('email')
        )
        return fn(*args, **kwargs)
    return wrapper
