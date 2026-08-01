from flask import Blueprint, g

from ..db import db
from ..models import Household, InsightSnapshot, Profile
from ..security import require_user
from ..serializers import serialize
from ..utils import gen_id

bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@bp.get('/me')
@require_user
def me():
    profile = Profile.query.filter_by(id=g.user['uid']).first()
    household = Household.query.filter_by(id=g.household_id).first()
    return {
        'user': {
            'id': g.user['uid'],
            'name': g.user.get('name') or (profile.name if profile else 'Family Manager'),
            'email': g.user.get('email') or (profile.email if profile else ''),
        },
        'householdId': g.household_id,
        'householdName': household.name if household else 'My Family',
    }
