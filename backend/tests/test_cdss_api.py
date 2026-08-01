"""Integration tests for CDSS API endpoints (/api/cdss/assess and /api/cdss/<disease>)."""
from conftest import auth


def test_cdss_assess_all(client):
    patient = {
        'name': 'Rajesh Kumar', 'age': 62, 'sex': 'Male', 'bmi': 28.5,
        'bp': '145/92 mmHg', 'hba1c': 7.4, 'glucose': 135, 'creatinine': 1.4,
        'totalCholesterol': 230, 'hdl': 42, 'smoking': 'no',
        'familyHistory': 'Father had Diabetes', 'physicalActivity': 'no'
    }
    res = client.post('/api/cdss/assess', headers=auth(), json={'patient': patient})
    assert res.status_code == 200
    data = res.get_json()
    assert 'overallRiskScore' in data
    assert 'overallLevel' in data
    assert 'ruleScores' in data
    assert len(data['ruleScores']) == 5
    assert 'diabetes' in data['ruleScores']
    assert 'hypertension' in data['ruleScores']
    assert 'ckd' in data['ruleScores']
    assert 'cvd' in data['ruleScores']
    assert 'stroke' in data['ruleScores']
    assert 'missingAnalysis' in data
    assert 'earlyWarnings' in data
    assert 'referrals' in data


def test_cdss_single_disease(client):
    patient = {'age': 55, 'bmi': 31, 'hba1c': 8.0, 'glucose': 160, 'familyHistory': 'Father had Diabetes'}
    res = client.post('/api/cdss/diabetes', headers=auth(), json={'patient': patient})
    assert res.status_code == 200
    data = res.get_json()
    assert data['disease'] == 'diabetes'
    assert data['ruleScore']['score'] >= 50
    assert 'missingAnalysis' in data


def test_cdss_unknown_disease(client):
    res = client.post('/api/cdss/cancer', headers=auth(), json={'patient': {'age': 40}})
    assert res.status_code == 404
