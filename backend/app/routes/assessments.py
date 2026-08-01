from datetime import datetime, timezone
from flask import Blueprint, g, request

from ..db import db
from ..models import FamilyMember, InsightSnapshot
from ..security import require_user
from ..serializers import db_dict, serialize
from ..services import groq_service, risk_engine
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

    # 1. Deterministic baseline risk scoring
    baseline_result = risk_engine.compute(data)
    baseline_result['id'] = member_id

    # 2. AI Analysis using Groq API (llama-3.1-8b-instant)
    ai_result = groq_service.analyze_health(data, baseline_result)

    row = FamilyMember.query.filter_by(household_id=g.household_id, id=member_id).first()
    if row is None:
        row = FamilyMember(id=member_id, household_id=g.household_id)
        db.session.add(row)

    # 3. Map user input fields
    for col, value in db_dict(FamilyMember, data).items():
        if col != 'id':
            setattr(row, col, value)

    # 4. Map calculated & AI-generated fields
    for key, value in ai_result.items():
        if key in ('id', 'householdId'):
            continue
        col = key if hasattr(row, key) else to_snake(key)
        if hasattr(row, col):
            setattr(row, col, value)

    row.assessed = datetime.now(timezone.utc)
    row.last_assessed = 'Just now'

    db.session.flush()

    # 5. Save report snapshot in Supabase Postgres (insight_snapshots)
    snapshot = InsightSnapshot(
        id=gen_id('ins'),
        household_id=g.household_id,
        member_id=member_id,
        member_name=ai_result.get('name') or row.name,
        member_initials=ai_result.get('initials') or row.initials,
        snapshot=serialize(row),
    )
    db.session.add(snapshot)
    db.session.commit()

    return serialize(row), 201
