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
    history = payload.get('history') or []
    client_members = payload.get('members')
    
    if isinstance(client_members, list) and len(client_members) > 0:
        members_data = client_members
    else:
        members = FamilyMember.query.filter_by(household_id=g.household_id).all()
        from ..serializers import serialize
        members_data = [serialize(m) for m in members]

    reply = assistant.reply(message, members_data, history=history)
    return {'reply': reply}


@bp.get('/logs')
@require_user
def _logs():
    from ..services.groq_service import get_llm_logs
    return {'logs': get_llm_logs()}


