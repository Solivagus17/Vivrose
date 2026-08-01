import os
import json
from dotenv import load_dotenv

# Ensure backend/.env is loaded for tests
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
os.environ['FIREBASE_ALLOW_UNVERIFIED'] = '1'

from app import create_app
from app.db import db
from app.models import FamilyMember, Household, Profile, InsightSnapshot

app = create_app()

def test_full_pipeline():
    with app.app_context():
        db.create_all()
        # Seed dev household and profile if missing
        hh = Household.query.filter_by(id='dev-household').first()
        if not hh:
            hh = Household(id='dev-household', name="Dev Family")
            db.session.add(hh)
            db.session.flush()
        
        prof = Profile.query.filter_by(id='dev-user-123').first()
        if not prof:
            prof = Profile(id='dev-user-123', household_id='dev-household', name="Arjun Mehta", email="dev@vivrose.local")
            db.session.add(prof)
            db.session.commit()

        client = app.test_client()
        headers = {'Authorization': 'Bearer dev-token-user'}

        # 1. Create a new member
        res_mem = client.post('/api/members', headers=headers, json={
            'name': 'Aarav Mehta',
            'relation': 'Son',
            'sex': 'Male',
            'birthDate': '2004-05-12',
            'location': 'Mumbai'
        })
        print("Create Member Response:", res_mem.status_code, res_mem.get_json())
        assert res_mem.status_code == 201
        member_id = res_mem.get_json()['id']

        # 2. Run LLM AI Assessment
        assessment_payload = {
            'memberId': member_id,
            'data': {
                'name': 'Aarav Mehta',
                'age': 20,
                'sex': 'male',
                'relation': 'Son',
                'bp': '150/95 mmHg',
                'bmi': '28.2',
                'hba1c': '6.4',
                'glucose': '125',
                'cholesterol': '220',
                'creatinine': '1.0',
                'smoking': 'Current Smoker',
                'conditions': ['Pre-Diabetes'],
                'familyHistory': 'Diabetes (Father)',
                'medications': 'None',
                'activity': 'Sedentary',
                'diet': 'Poor',
                'stress': 'High'
            }
        }
        res_assess = client.post('/api/assessments', headers=headers, json=assessment_payload)
        print("\nAssessment Response Status:", res_assess.status_code)
        assess_json = res_assess.get_json()
        print("Summary:", assess_json.get('summary'))
        print("Scores:", assess_json.get('scores'))
        assert res_assess.status_code == 201
        assert assess_json.get('scores') is not None

        # 3. Fetch Insights
        res_ins = client.get('/api/insights', headers=headers)
        print("\nGet Insights Count:", len(res_ins.get_json()))
        assert res_ins.status_code == 200
        assert len(res_ins.get_json()) > 0
        print("\nSUCCESS: End-to-end LLM AI Assessment & Storage pipeline verified!")

if __name__ == '__main__':
    test_full_pipeline()
