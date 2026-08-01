from flask import Blueprint, g, request

from ..models import FamilyMember
from ..security import require_user
from ..services import assistant

bp = Blueprint('assistant', __name__, url_prefix='/api/assistant')


@bp.post('/chat')
@require_user
def _chat():
    payload = request.get_json(silent=True) or {}
    message = (payload.get('message') or '').strip()
    if not message:
        return {'error': 'message is required'}, 400
    members = FamilyMember.query.filter_by(household_id=g.household_id).all()
    from ..serializers import serialize
    reply = assistant.reply(message, [serialize(m) for m in members])
    return {'reply': reply}
