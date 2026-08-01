from flask import Blueprint, g

from ..models import Checkup, FamilyMember
from ..security import require_user

bp = Blueprint('analytics', __name__, url_prefix='/api')


def _top_scores(member):
    scores = member.scores or []
    if not scores:
        return 0
    return max(int(s.get('score', 0)) for s in scores)


@bp.get('/dashboard')
@require_user
def _dashboard():
    members = FamilyMember.query.filter_by(household_id=g.household_id).all()
    checkups = Checkup.query.filter_by(household_id=g.household_id).all()

    high_risk = [m for m in members if m.level == 'high']
    assessed = [m for m in members if m.assessed is not None]
    scheduled = [c for c in checkups if c.status == 'Scheduled']

    alerts = []
    for m in members:
        for w in (m.warnings or []):
            alerts.append({
                'level': w.get('level', 'moderate'),
                'icon': w.get('icon', 'bolt'),
                'title': w.get('title', ''),
                'desc': w.get('desc', ''),
                'memberId': m.id,
                'memberName': m.name,
            })

    return {
        'familySize': len(members),
        'highRisk': len(high_risk),
        'assessments': len(assessed),
        'pendingCheckups': len(scheduled),
        'alerts': alerts,
        'members': [{
            'id': m.id,
            'name': m.name,
            'initials': m.initials,
            'level': m.level,
            'risk': m.risk,
            'status': m.status,
            'topScore': _top_scores(m),
            'lastAssessed': m.last_assessed,
        } for m in members],
    }
