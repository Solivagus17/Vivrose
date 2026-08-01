from flask import Blueprint, g, request

from ..db import db
from ..security import require_user
from ..serializers import db_dict, serialize
from ..utils import gen_id


def crud_blueprint(name, model, id_prefix, url_prefix):
    """Standard per-household CRUD + bulk-sync blueprint for one resource."""
    bp = Blueprint(name, __name__, url_prefix=url_prefix)

    def _scoped():
        return model.query.filter_by(household_id=g.household_id)

    @bp.get('')
    @require_user
    def _list():
        rows = _scoped().order_by(model.created_at.desc()).all()
        return [serialize(r) for r in rows]

    @bp.post('')
    @require_user
    def _create():
        payload = request.get_json(silent=True) or {}
        data = db_dict(model, payload)
        row_id = payload.get('id') or gen_id(id_prefix)
        row = model(id=row_id, household_id=g.household_id, **data)
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
        for key, value in db_dict(model, payload).items():
            setattr(row, key, value)
        db.session.commit()
        return serialize(row)

    @bp.delete('/<id>')
    @require_user
    def _delete(id):
        row = _scoped().filter_by(id=id).first()
        if row is None:
            return {'error': 'Not found'}, 404
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
            data = db_dict(model, item)
            row_id = item.get('id')
            row = _scoped().filter_by(id=row_id).first() if row_id else None
            if row is None:
                row = model(id=row_id or gen_id(id_prefix), household_id=g.household_id, **data)
                db.session.add(row)
            else:
                for key, value in data.items():
                    setattr(row, key, value)
            present.append(row.id)
        if present:
            _scoped().filter(model.id.notin_(present)).delete(synchronize_session=False)
        db.session.commit()
        rows = _scoped().order_by(model.created_at.desc()).all()
        return [serialize(r) for r in rows]

    return bp
