import os
import uuid

import requests

BUCKET = os.getenv('SUPABASE_BUCKET', 'medical-reports')
SUPABASE_URL = os.getenv('SUPABASE_URL', '')
# sb_secret_* replaces the legacy service_role key (deprecated by Supabase).
SUPABASE_KEY = os.getenv('SUPABASE_SECRET_KEY') or os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')


def _headers():
    return {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
    }


def upload_report(file_stream):
    """Upload a report file to Supabase Storage. Returns the storage path.

    Raises RuntimeError if Supabase storage is not configured.
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise RuntimeError('SUPABASE_URL / SUPABASE_SECRET_KEY not configured')
    ext = (file_stream.filename or 'file').rsplit('.', 1)[-1].lower()[:6]
    path = f'{uuid.uuid4().hex}.{ext}'
    url = f'{SUPABASE_URL}/storage/v1/object/{BUCKET}/{path}'
    resp = requests.post(
        url,
        headers={**_headers(), 'Content-Type': file_stream.content_type or 'application/octet-stream'},
        data=file_stream,
        timeout=60,
    )
    if resp.status_code not in (200, 201):
        raise RuntimeError(f'Storage upload failed: {resp.status_code} {resp.text[:200]}')
    return path
