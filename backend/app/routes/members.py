from datetime import date

from flask import Blueprint, g, request

from ..db import db
from ..models import FamilyMember, InsightSnapshot
from ..security import require_user
from ..serializers import db_dict, serialize
from ..utils import gen_id

bp = Blueprint('members', __name__, url_prefix='/api/members')


def _initials(name):
    parts = [p for p in (name or '').split() if p]
    return ''.join(p[0].upper() for p in parts[:2]) or '?'


def _age(birth_date):
    if not birth_date:
        return None
    today = date.today()
    return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))


def _apply_derived(row, payload):
    row.initials = _initials(payload.get('name') or row.name)
    if row.birth_date:
        row.age = _age(row.birth_date)


def _scoped():
    return FamilyMember.query.filter_by(household_id=g.household_id)


@bp.get('')
@require_user
def _list():
    return [serialize(m) for m in _scoped().order_by(FamilyMember.created_at.desc()).all()]


@bp.post('')
@require_user
def _create():
    payload = request.get_json(silent=True) or {}
    row = FamilyMember(id=payload.get('id') or gen_id('member'), household_id=g.household_id,
                       **db_dict(FamilyMember, payload))
    _apply_derived(row, payload)
    db.session.add(row)
    db.session.commit()
    return serialize(row), 201


@bp.put('/<id>')
@require_user
def _update(id):
    row = _scoped().filter_by(id=id).first()
    if row is None:
        return {'error': 'Not found'}, 404
    payload = request.get_json(silent=True) or {}
    for key, value in db_dict(FamilyMember, payload).items():
        setattr(row, key, value)
    _apply_derived(row, payload)
    db.session.commit()
    return serialize(row)


@bp.delete('/<id>')
@require_user
def _delete(id):
    row = _scoped().filter_by(id=id).first()
    if row is None:
        return {'error': 'Not found'}, 404
    count = _scoped().count()
    if count <= 1:
        return {'error': 'At least one family member is required'}, 409
    db.session.delete(row)
    db.session.commit()
    return {'ok': True}


@bp.put('/bulk')
@require_user
def _bulk():
    items = request.get_json(silent=True) or []
    if not isinstance(items, list):
        return {'error': 'Expected a JSON array'}, 400
    present = []
    for item in items:
        data = db_dict(FamilyMember, item)
        row_id = item.get('id')
        row = _scoped().filter_by(id=row_id).first() if row_id else None
        if row is None:
            row = FamilyMember(id=row_id or gen_id('member'), household_id=g.household_id, **data)
            db.session.add(row)
        else:
            for key, value in data.items():
                setattr(row, key, value)
        _apply_derived(row, item)
        present.append(row.id)
    if present:
        _scoped().filter(FamilyMember.id.notin_(present)).delete(synchronize_session=False)
    db.session.commit()
    return [serialize(m) for m in _scoped().order_by(FamilyMember.created_at.desc()).all()]


@bp.get('/<id>/insights')
@require_user
def _insights(id):
    rows = (InsightSnapshot.query
            .filter_by(household_id=g.household_id, member_id=id)
            .order_by(InsightSnapshot.created_at.desc())
            .all())
    return [serialize(s) for s in rows]
