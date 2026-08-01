import base64
import json
import os
from functools import wraps

import firebase_admin
from firebase_admin import auth as fb_auth
from firebase_admin import credentials
from flask import current_app, g, request
from sqlalchemy.exc import IntegrityError

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
            base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
            alt_path = os.path.join(base_dir, cred_path)
            if os.path.exists(alt_path):
                cred_path = alt_path

    if cred_path and os.path.exists(cred_path):
        try:
            firebase_admin.initialize_app(credentials.Certificate(cred_path))
        except ValueError:
            pass  # already initialized
    else:
        try:
            firebase_admin.initialize_app()
        except ValueError:
            pass  # already initialized via ADC
    _initialized = True


def _is_dev_mode():
    return current_app.config.get('FIREBASE_ALLOW_UNVERIFIED', '0') == '1'


def _parse_token_claims(token):
    """Safely extract claims (uid, email, name) from a JWT token payload."""
    try:
        parts = (token or '').split('.')
        if len(parts) >= 2:
            payload = parts[1]
            payload += '=' * (-len(payload) % 4)
            data = json.loads(base64.b64decode(payload).decode('utf-8'))
            uid = data.get('sub') or data.get('user_id') or data.get('uid')
            if uid:
                return {
                    'uid': uid,
                    'email': data.get('email', ''),
                    'name': data.get('name') or (data.get('email', '').split('@')[0] if data.get('email') else 'Family Manager'),
                }
    except Exception:
        pass
    uid = (token or 'dev-user')[:64]
    return {'uid': uid, 'email': 'dev@vivrose.local', 'name': 'Dev User'}


def verify_token(token):
    """Return {uid, email, name} claims for a Firebase ID token.

    In dev mode (FIREBASE_ALLOW_UNVERIFIED=1), parses token claims without signature verification.
    In production mode, verifies token signature using Firebase Admin SDK.
    """
    if _is_dev_mode():
        return _parse_token_claims(token)

    _init_firebase()
    decoded = fb_auth.verify_id_token(token, check_revoked=True)
    return {
        'uid': decoded.get('uid'),
        'email': decoded.get('email', ''),
        'name': decoded.get('name', ''),
    }


def ensure_profile(uid, name, email):
    """Return the household_id for this Firebase uid, creating one on first sign-in.
    
    Handles concurrent request races gracefully via IntegrityError handling.
    """
    profile = Profile.query.filter_by(id=uid).first()
    if profile is not None:
        return profile.household_id

    # First sign-in: create a household and profile
    try:
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
        return household.id
    except IntegrityError:
        db.session.rollback()
        profile = Profile.query.filter_by(id=uid).first()
        if profile is not None:
            return profile.household_id
        raise


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
        except Exception as exc:
            return {'error': f'Authentication failed: {exc}'}, 401
        g.user = claims
        g.household_id = ensure_profile(
            claims['uid'], claims.get('name'), claims.get('email')
        )
        return fn(*args, **kwargs)
    return wrapper
