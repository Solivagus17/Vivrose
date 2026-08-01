"""FINDRISC / ADA-style diabetes risk scorer.

Inputs (patient dict keys):
    age          : int  — years
    bmi          : float — kg/m²
    waist_cm     : float — cm (optional; inferred from BMI if absent)
    physical_activity : str  — 'yes'/'no' (30+ min/day)
    diet_score   : int  — 1-5 (5 = very healthy; optional)
    hba1c        : float — % (optional — used if present)
    glucose      : float — mg/dL fasting (optional)
    family_history: str  — free text containing 'Diabet' flags parent/sibling
    hypertension_dx : bool/str  — known hypertension diagnosis

Returns:
    {
      score: float,        # 0-100 normalised risk %
      stage: str,          # 'low' | 'elevated' | 'moderate' | 'high' | 'very_high'
      findrisc_points: int,  # raw FINDRISC 0-26 points
      explanation: str,    # human-readable sentence
      breakdown: dict,     # per-criterion points
    }
"""
from __future__ import annotations


def _num(v, default=0.0) -> float:
    try:
        return float(str(v or '').strip().split()[0])
    except (ValueError, IndexError, TypeError):
        return default


def _flag(v) -> bool:
    return str(v or '').strip().lower() in ('yes', 'true', '1', 'y')


def score(patient: dict) -> dict:
    age = int(_num(patient.get('age'), 40))
    bmi = _num(patient.get('bmi'), 23.0)
    waist = _num(patient.get('waistCm') or patient.get('waist_cm'), 0.0)
    hba1c = _num(patient.get('hba1c'), 0.0)
    glucose = _num(patient.get('glucose'), 0.0)
    physical_activity = _flag(patient.get('physicalActivity') or patient.get('physical_activity'))
    family = str(patient.get('familyHistory') or patient.get('family_history') or '')
    hypertension_dx = _flag(patient.get('hypertensionDx') or patient.get('hypertension_dx'))

    # ── FINDRISC point table (Finnish Diabetes Risk Score, max 26 pts) ──
    breakdown: dict[str, int] = {}

    # Age
    if age < 45:
        breakdown['age'] = 0
    elif age < 55:
        breakdown['age'] = 2
    elif age < 65:
        breakdown['age'] = 3
    else:
        breakdown['age'] = 4

    # BMI
    if bmi < 25:
        breakdown['bmi'] = 0
    elif bmi < 30:
        breakdown['bmi'] = 1
    else:
        breakdown['bmi'] = 3

    # Waist circumference (infer from BMI if not provided)
    if waist == 0.0:
        # crude estimate: waist ≈ BMI * 0.45 * sqrt(height) — use BMI proxy
        waist = 70 + (bmi - 23) * 2.2
    sex = str(patient.get('sex') or 'M').strip().lower()
    if sex in ('female', 'f', 'woman'):
        if waist < 80:
            breakdown['waist'] = 0
        elif waist < 88:
            breakdown['waist'] = 3
        else:
            breakdown['waist'] = 4
    else:
        if waist < 94:
            breakdown['waist'] = 0
        elif waist < 102:
            breakdown['waist'] = 3
        else:
            breakdown['waist'] = 4

    # Physical activity
    breakdown['physical_activity'] = 0 if physical_activity else 2

    # Fruits / vegetables daily (use diet_score proxy)
    diet = int(_num(patient.get('dietScore') or patient.get('diet_score'), 3))
    breakdown['diet'] = 0 if diet >= 3 else 1

    # Hypertension history
    breakdown['hypertension'] = 1 if hypertension_dx else 0

    # High blood glucose ever (use HbA1c or glucose as proxy)
    has_abnormal_glucose = hba1c >= 5.7 or glucose >= 100
    breakdown['glucose_history'] = 5 if has_abnormal_glucose else 0

    # Family history of diabetes
    family_lower = family.lower()
    if 'parent' in family_lower or 'sibling' in family_lower or 'both' in family_lower:
        breakdown['family_history'] = 5
    elif 'diabet' in family_lower or 'grandparent' in family_lower or 'aunt' in family_lower or 'uncle' in family_lower:
        breakdown['family_history'] = 3
    else:
        breakdown['family_history'] = 0

    findrisc_pts = sum(breakdown.values())

    # ── FINDRISC stage thresholds ──
    if findrisc_pts < 7:
        stage = 'low'
    elif findrisc_pts < 12:
        stage = 'elevated'
    elif findrisc_pts < 15:
        stage = 'moderate'
    elif findrisc_pts < 20:
        stage = 'high'
    else:
        stage = 'very_high'

    # ── Normalise to 0-100 for UI consistency ──
    # FINDRISC max = 26 pts ≈ ~55 % 10-yr T2DM risk; we scale linearly
    normalised = min(95, max(5, round(findrisc_pts / 26 * 100)))

    explanation = (
        f"FINDRISC score {findrisc_pts}/26 points → {stage.replace('_', ' ')} diabetes risk "
        f"({normalised}% normalised). "
        + ("Elevated glucose markers detected. " if has_abnormal_glucose else "")
        + (f"Family history of diabetes noted ({family}). " if breakdown['family_history'] else "")
        + ("Sedentary lifestyle is a modifiable risk factor. " if not physical_activity else "")
    )

    return {
        'score': normalised,
        'stage': stage,
        'findrisc_points': findrisc_pts,
        'explanation': explanation.strip(),
        'breakdown': breakdown,
    }
