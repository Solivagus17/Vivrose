import re
import uuid


def gen_id(prefix):
    return f"{prefix}-{uuid.uuid4().hex[:8]}"


def to_camel(name):
    parts = name.split('_')
    return parts[0] + ''.join(p.capitalize() for p in parts[1:])


def to_snake(name):
    return re.sub(r'(?<!^)(?=[A-Z])', '_', name).lower()
