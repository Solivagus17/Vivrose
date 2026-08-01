"""Unit tests for missing-investigation and confidence engine."""
from app.services.clinical import missing_fields


def test_complete_patient_high_confidence():
    patient = {
        'age': 45, 'sex': 'Male', 'bmi': 24.5, 'bp': '120/80',
        'hba1c': 5.4, 'glucose': 92, 'creatinine': 0.9,
        'cholesterol': 180, 'hdl': 50, 'smoking': 'No',
        'waistCm': 85, 'physicalActivity': 'Yes', 'familyHistory': 'None'
    }
    result = missing_fields.assess_all(patient)
    assert result['overall_confidence'] >= 0.80
    assert result['overall_confidence_label'] == 'high'


def test_sparse_patient_low_confidence():
    patient = {'age': 50}  # missing almost everything
    result = missing_fields.assess_all(patient)
    assert result['overall_confidence'] < 0.50
    assert result['overall_confidence_label'] in ('low', 'very_low')
    assert len(result['global_investigation_prompts']) > 0


def test_per_disease_assessment():
    patient = {'age': 50, 'bmi': 25, 'sex': 'Female'}  # missing hba1c for diabetes
    dm_res = missing_fields.assess(patient, 'diabetes')
    assert 'hba1c' in dm_res['missing_optional']
    assert dm_res['disease'] == 'diabetes'
