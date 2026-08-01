from flask import Blueprint, g, request

from ..db import db
from ..models import InsightSnapshot
from ..security import require_user
from ..serializers import serialize
from ..utils import gen_id

bp = Blueprint('insights', __name__, url_prefix='/api/insights')


@bp.get('')
@require_user
def _list():
    rows = (InsightSnapshot.query
            .filter_by(household_id=g.household_id)
            .order_by(InsightSnapshot.created_at.desc())
            .all())
    return [serialize(s) for s in rows]


@bp.post('')
@require_user
def _create():
    payload = request.get_json(silent=True) or {}
    member = payload.get('member') or payload.get('snapshot') or {}
    row = InsightSnapshot(
        id=payload.get('id') or gen_id('ins'),
        household_id=g.household_id,
        member_id=payload.get('memberId'),
        member_name=payload.get('memberName') or member.get('name') or '',
        member_initials=payload.get('memberInitials') or member.get('initials') or '',
        snapshot=member,
    )
    db.session.add(row)
    db.session.commit()
    return serialize(row), 201
