import os

from flask import g, request

from ..db import db
from ..models import Report
from ..security import require_user
from ..serializers import serialize
from ..utils import gen_id
from .crud import crud_blueprint

bp = crud_blueprint('reports', Report, 'rep', '/api/reports')


@bp.post('/upload')
@require_user
def _upload():
    file = request.files.get('file')
    if file is None:
        return {'error': 'No file provided (multipart field "file")'}, 400
    if file.content_length and file.content_length > 10 * 1024 * 1024:
        return {'error': 'File too large (max 10 MB)'}, 400

    data = request.form.to_dict()
    path = ''
    try:
        from ..services.storage import upload_report
        path = upload_report(file)
    except Exception:
        path = ''

    report = Report(
        id=data.get('id') or gen_id('rep'),
        household_id=g.household_id,
        file_name=data.get('fileName') or file.filename or 'report.pdf',
        file_size=data.get('fileSize'),
        report_type=data.get('type'),
        date=data.get('date'),
        hospital=data.get('hospital'),
        doctor=data.get('doctor'),
        purpose=data.get('purpose'),
        remark=data.get('remark'),
        storage_path=path,
    )
    db.session.add(report)
    db.session.commit()
    return serialize(report), 201
