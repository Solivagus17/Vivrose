from conftest import auth


def test_doctor_crud(client):
    res = client.post('/api/doctors', headers=auth(), json={
        'name': 'Dr. Test', 'specialty': 'Cardiologist', 'city': 'Ahmedabad',
    })
    assert res.status_code == 201
    doc = res.get_json()
    assert doc['id']
    assert doc['specialty'] == 'Cardiologist'

    listing = client.get('/api/doctors', headers=auth())
    assert len(listing.get_json()) == 1

    updated = client.put(f"/api/doctors/{doc['id']}", headers=auth(), json={'hospital': 'Test Hospital'})
    assert updated.get_json()['hospital'] == 'Test Hospital'

    assert client.delete(f"/api/doctors/{doc['id']}", headers=auth()).status_code == 200
    assert client.get('/api/doctors', headers=auth()).get_json() == []


def test_bulk_sync_reconciles(client):
    client.put('/api/doctors/bulk', headers=auth(), json=[
        {'id': 'd1', 'name': 'Doc One', 'specialty': 'General Physician'},
        {'id': 'd2', 'name': 'Doc Two', 'specialty': 'General Physician'},
    ])
    assert len(client.get('/api/doctors', headers=auth()).get_json()) == 2

    client.put('/api/doctors/bulk', headers=auth(), json=[
        {'id': 'd1', 'name': 'Doc One Updated', 'specialty': 'General Physician'},
    ])
    docs = client.get('/api/doctors', headers=auth()).get_json()
    assert len(docs) == 1
    assert docs[0]['name'] == 'Doc One Updated'


def test_household_isolation(client):
    client.post('/api/doctors', headers=auth('u1'), json={'name': 'A', 'specialty': 'Other'})
    client.post('/api/doctors', headers=auth('u2'), json={'name': 'B', 'specialty': 'Other'})
    assert len(client.get('/api/doctors', headers=auth('u1')).get_json()) == 1
    assert len(client.get('/api/doctors', headers=auth('u2')).get_json()) == 1


def test_member_derived_fields(client):
    res = client.post('/api/members', headers=auth(), json={
        'name': 'Rajesh Kumar', 'relation': 'Father', 'birthDate': '1960-03-10',
        'sex': 'Male',
    })
    m = res.get_json()
    assert m['initials'] == 'RK'
    assert m['age'] is not None

    insights = client.post('/api/insights', headers=auth(), json={
        'memberId': m['id'], 'memberName': m['name'], 'memberInitials': m['initials'],
        'member': m,
    })
    assert insights.status_code == 201
    history = client.get(f"/api/members/{m['id']}/insights", headers=auth())
    assert len(history.get_json()) == 1


def test_assessment_engine(client):
    res = client.post('/api/assessments', headers=auth(), json={
        'memberId': 'rajesh',
        'data': {'name': 'Rajesh', 'age': 66, 'bmi': 26, 'hba1c': 8.4, 'bp': 142,
                 'cholesterol': 242, 'smoking': 'No', 'familyHistory': 'Diabetes (Father)'},
    })
    assert res.status_code == 201
    member = res.get_json()
    scores = member['scores']
    assert len(scores) == 4
    for s in scores:
        assert 0 <= s['score'] <= 100
        assert s['level'] in ('low', 'moderate', 'high')
    assert member['level'] == 'high'  # 8.4 HbA1c + family history → high diabetes risk


def test_chat_uses_real_members(client):
    client.post('/api/members', headers=auth(), json={
        'id': 'rajesh', 'name': 'Rajesh', 'relation': 'Father', 'sex': 'Male',
        'scores': [{'label': 'Diabetes', 'score': 72, 'level': 'high'}],
        'risk': 'Diabetes', 'status': 'High risk',
    })
    res = client.post('/api/assistant/chat', headers=auth(), json={'message': 'Who has the highest risk?'})
    assert res.status_code == 200
    assert 'Rajesh' in res.get_json()['reply']


def test_dashboard(client):
    client.post('/api/members', headers=auth(), json={
        'id': 'k', 'name': 'Kavya', 'relation': 'Wife', 'sex': 'Female', 'level': 'moderate',
        'assessed': '2026-07-27T00:00:00Z', 'warnings': [{'title': 'Watch sugar', 'level': 'moderate'}],
    })
    dash = client.get('/api/dashboard', headers=auth()).get_json()
    assert dash['familySize'] == 1
    assert dash['assessments'] == 1
    assert len(dash['alerts']) == 1
