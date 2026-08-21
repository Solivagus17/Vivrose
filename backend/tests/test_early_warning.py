"""Unit tests for early warning and progression detection module."""
from app.services.clinical import early_warning


def test_single_visit_red_flags():
    # Hypertensive crisis trigger
    crisis_patient = {'bp': '185/110 mmHg', 'hba1c': 9.5}
    res = early_warning.detect(crisis_patient)
    assert res['mode'] == 'single_visit'
    assert res['has_critical'] is True
    fields = [f['field'] for f in res['flags']]
    assert 'systolic' in fields
    assert 'hba1c' in fields


def test_multi_visit_egfr_decline():
    v1 = {'assessedAt': '2024-01-01T00:00:00Z', 'egfr': 85.0}
    v2 = {'assessedAt': '2025-01-01T00:00:00Z', 'egfr': 72.0}  # -13/yr > 5/yr threshold
    res = early_warning.detect(v2, visits=[v1, v2])
    assert res['mode'] == 'multi_visit'
    assert res['has_high'] is True
    egfr_flag = [f for f in res['flags'] if f.get('field') == 'egfr'][0]
    assert egfr_flag['delta_per_year'] < -5.0


def test_no_flags_for_healthy():
    healthy = {'bp': '118/78 mmHg', 'hba1c': 5.2, 'bmi': 22, 'glucose': 88}
    res = early_warning.detect(healthy)
    assert res['has_critical'] is False
    assert len(res['flags']) == 0