"""Unit tests for rule-based clinical scoring engines (5 diseases)."""
from app.services.clinical.rules import diabetes, hypertension, ckd, cvd, stroke


def test_diabetes_findrisc():
    # Low risk profile
    low = diabetes.score({
        'age': 35, 'bmi': 22.0, 'waistCm': 75, 'physicalActivity': 'yes',
        'dietScore': 4, 'hba1c': 5.0, 'glucose': 85, 'familyHistory': 'none'
    })
    assert low['stage'] == 'low'
    assert 0 <= low['score'] <= 30
    assert low['findrisc_points'] < 7

    # High risk profile
    high = diabetes.score({
        'age': 62, 'bmi': 32.0, 'waistCm': 105, 'physicalActivity': 'no',
        'dietScore': 1, 'hba1c': 7.2, 'glucose': 150,
        'familyHistory': 'Father and Mother both had Diabetes',
        'hypertensionDx': 'yes'
    })
    assert high['stage'] in ('high', 'very_high')
    assert high['score'] > 60
    assert high['findrisc_points'] >= 15


def test_hypertension_jnc8():
    # Normal BP
    norm = hypertension.score({'bp': '115/75 mmHg', 'age': 40, 'bmi': 22})
    assert norm['stage'] == 'normal'
    assert norm['systolic'] == 115
    assert norm['diastolic'] == 75

    # Stage 1 HTN
    s1 = hypertension.score({'bp': '135/85 mmHg', 'age': 50, 'bmi': 27})
    assert s1['stage'] == 'stage_1_hypertension'

    # Hypertensive Crisis
    crisis = hypertension.score({'bp': '185/125 mmHg', 'age': 60, 'bmi': 30})
    assert crisis['stage'] == 'hypertensive_crisis'
    assert crisis['score'] >= 80


def test_ckd_epi_2021():
    # Normal renal function
    norm = ckd.score({'creatinine': 0.8, 'age': 35, 'sex': 'female', 'albuminCreatinineRatio': 15})
    assert norm['g_stage'] == 'G1'
    assert norm['a_stage'] == 'A1'
    assert norm['egfr'] >= 90

    # Severe CKD (G4 A3)
    severe = ckd.score({'creatinine': 3.2, 'age': 65, 'sex': 'male', 'albuminCreatinineRatio': 350})
    assert severe['g_stage'] in ('G4', 'G5')
    assert severe['a_stage'] == 'A3'
    assert severe['kdigo_risk'] == 'very_high'
    assert severe['score'] >= 70


def test_cvd_framingham():
    # Low 10-yr CVD risk
    low = cvd.score({
        'age': 35, 'sex': 'female', 'totalCholesterol': 170, 'hdl': 60,
        'bp': '115 mmHg', 'smoking': 'no', 'diabetesDx': 'no'
    })
    assert low['stage'] == 'low'
    assert low['ten_year_pct'] < 5.0

    # High 10-yr CVD risk
    high = cvd.score({
        'age': 65, 'sex': 'male', 'totalCholesterol': 260, 'hdl': 35,
        'bp': '155 mmHg', 'bpTreated': 'yes', 'smoking': 'yes', 'diabetesDx': 'yes'
    })
    assert high['stage'] == 'high'
    assert high['ten_year_pct'] >= 20.0


def test_stroke_cha2ds2_vasc_and_srs():
    # AFib path (CHA2DS2-VASc)
    afib_patient = stroke.score({
        'afib': 'yes', 'age': 76, 'sex': 'female', 'bp': '145 mmHg',
        'diabetesDx': 'yes', 'strokeHx': 'yes', 'heartFailure': 'yes'
    })
    assert afib_patient['path'] == 'CHA2DS2-VASc'
    assert afib_patient['raw_score'] >= 6
    assert afib_patient['annual_stroke_pct'] > 5.0

    # Non-AFib path (SRS fallback)
    non_afib = stroke.score({
        'afib': 'no', 'age': 50, 'bp': '125 mmHg', 'smoking': 'no'
    })
    assert non_afib['path'] == 'SRS-fallback'
    assert non_afib['annual_stroke_pct'] is None
