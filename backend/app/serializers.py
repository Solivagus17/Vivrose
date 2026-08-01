from datetime import date, datetime

from .models import (
    Checkup, Doctor, FamilyMember, InsightSnapshot, Medicine, Report,
)
from .utils import to_camel

API_OVERRIDES = {
    Doctor: {},
    FamilyMember: {},
    Medicine: {'prescribed_by': 'prescribedBy', 'start_date': 'startDate', 'end_date': 'endDate'},
    Checkup: {'doctor_id': 'doctorId', 'doctor_name': 'doctorName'},
    Report: {'report_type': 'type'},
    InsightSnapshot: {
        'member_id': 'memberId',
        'member_name': 'memberName',
        'member_initials': 'memberInitials',
        'snapshot': 'member',
    },
}

EXCLUDE = ('household_id', 'updated_at')

DATE_COLS = {'birth_date', 'date', 'start_date', 'end_date'}


def _value(v):
    if isinstance(v, (datetime, date)):
        return v.isoformat()
    if v is None or isinstance(v, (str, int, float, bool, list, dict)):
        return v
    return str(v)


def serialize(obj):
    overrides = API_OVERRIDES.get(type(obj), {})
    data = {}
    for col in obj.__table__.columns.keys():
        if col in EXCLUDE:
            continue
        key = overrides.get(col, to_camel(col))
        data[key] = _value(getattr(obj, col))
    return data


def parse_date(value):
    if not value:
        return None
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    return date.fromisoformat(str(value)[:10])


def parse_datetime(value):
    if not value:
        return None
    if isinstance(value, datetime):
        return value
    return datetime.fromisoformat(str(value).replace('Z', '+00:00'))


def db_dict(model, payload):
    """Map an API (camelCase) dict onto the model's snake_case column names."""
    overrides = API_OVERRIDES.get(model, {})
    data = {}
    for col in model.__table__.columns.keys():
        if col in EXCLUDE or col == 'id':
            continue
        api_key = overrides.get(col, to_camel(col))
        if api_key not in payload:
            continue
        val = payload[api_key]
        if col in DATE_COLS:
            val = parse_date(val)
        elif col == 'assessed':
            val = parse_datetime(val)
        data[col] = val
    return data
