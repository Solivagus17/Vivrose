from .analytics import bp as analytics_bp
from .assessments import bp as assessments_bp
from .assistant import bp as assistant_bp
from .auth import bp as auth_bp
from .cdss import bp as cdss_bp
from .insights import bp as insights_bp
from .members import bp as members_bp
from .reports import bp as reports_bp
from .resources import checkups_bp, doctors_bp, medicines_bp

ALL_BLUEPRINTS = [
    auth_bp,
    members_bp,
    insights_bp,
    assessments_bp,
    assistant_bp,
    doctors_bp,
    checkups_bp,
    medicines_bp,
    reports_bp,
    analytics_bp,
    cdss_bp,
]
