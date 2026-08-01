"""Unit tests for referral recommendation generator."""
from app.services.clinical import referral


def test_emergency_referral_on_hypertensive_crisis():
    combined = {'hypertension': {'score': 90, 'stage': 'hypertensive_crisis'}}
    flags = [{'field': 'systolic', 'level': 'critical', 'source': 'red_flag'}]
    patient = {'bp': '185/120'}
    refs = referral.generate(combined, flags, patient)
    spec = [r['specialty'] for r in refs]
    assert 'Emergency Medicine' in spec


def test_nephrology_referral_on_high_ckd():
    combined = {'ckd': {'score': 75, 'stage': 'G4 A3'}}
    flags = []
    patient = {'creatinine': 2.8}
    refs = referral.generate(combined, flags, patient)
    spec = [r['specialty'] for r in refs]
    assert 'Nephrology' in spec


def test_low_risk_lifestyle_referral():
    combined = {
        'diabetes': {'score': 10},
        'hypertension': {'score': 10},
        'ckd': {'score': 10},
        'cvd': {'score': 10},
        'stroke': {'score': 10},
    }
    refs = referral.generate(combined, [], {})
    assert len(refs) == 1
    assert refs[0]['specialty'] == 'Lifestyle & Preventive Health'
