from ..models import Checkup, Doctor, Medicine
from .crud import crud_blueprint

doctors_bp = crud_blueprint('doctors', Doctor, 'doc', '/api/doctors')
checkups_bp = crud_blueprint('checkups', Checkup, 'chk', '/api/checkups')
medicines_bp = crud_blueprint('medicines', Medicine, 'med', '/api/medicines')
