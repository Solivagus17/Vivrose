from flask import Blueprint, g, request

from ..db import db
from ..models import FamilyMember, InsightSnapshot
from ..security import require_user
from ..serializers import db_dict, serialize
from ..services import risk_engine
from ..utils import gen_id, to_snake

bp = Blueprint('assessments', __name__, url_prefix='/api/assessments')


@bp.post('')
@require_user
def _assess():
    payload = request.get_json(silent=True) or {}
    data = payload.get('data') or {}
    member_id = payload.get('memberId')
    if not member_id:
        return {'error': 'memberId is required'}, 400

    result = risk_engine.compute(data)
    result['id'] = member_id

    row = FamilyMember.query.filter_by(household_id=g.household_id, id=member_id).first()
    if row is None:
        row = FamilyMember(id=member_id, household_id=g.household_id)
        db.session.add(row)

    for col, value in db_dict(FamilyMember, data).items():
        if col != 'id':
            setattr(row, col, value)
    for key, value in result.items():
        if key in ('id', 'householdId'):
            continue
        col = key if hasattr(row, key) else to_snake(key)
        if hasattr(row, col):
            setattr(row, col, value)

    db.session.flush()

    snapshot = InsightSnapshot(
        id=gen_id('ins'),
        household_id=g.household_id,
        member_id=member_id,
        member_name=result.get('name') or row.name,
        member_initials=result.get('initials') or row.initials,
        snapshot=serialize(row),
    )
    db.session.add(snapshot)
    db.session.commit()
    return serialize(row), 201
