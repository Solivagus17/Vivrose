"""JNC8 / ACC-AHA 2017 Hypertension staging.

This is deterministic — BP staging is NOT predicted, it IS the classification.
The function also computes progression risk (separate from current stage).

Inputs (patient dict keys):
    bp         : str | float  — e.g. '142/90 mmHg' or '142' (systolic only)
    bp_dia     : float  — diastolic mmHg (if separate)
    age        : int
    bmi        : float
    smoking    : str/bool
    family_history : str

Returns:
    {
      score: float,          # 0-100 (progression risk, not current stage)
      stage: str,            # ACC-AHA stage name
      systolic: float,
      diastolic: float,
      explanation: str,
      breakdown: dict,
    }
"""
from __future__ import annotations


def _num(v, default=0.0) -> float:
    try:
        return float(str(v or '').strip().split()[0])
    except (ValueError, IndexError, TypeError):
        return default


def _flag(v) -> bool:
    return str(v or '').strip().lower() in ('yes', 'true', '1', 'y', 'smoker', 'current')


def _parse_bp(bp_val: str | float, bp_dia: float = 0.0):
    """Parse '142/90 mmHg' or '142' → (systolic, diastolic)."""
    raw = str(bp_val or '').replace('mmHg', '').strip()
    if '/' in raw:
        parts = raw.split('/')
        sys = _num(parts[0])
        dia = _num(parts[1])
    else:
        sys = _num(raw)
        dia = bp_dia
    return sys, dia


def score(patient: dict) -> dict:
    sys, dia = _parse_bp(
        patient.get('bp', 120),
        _num(patient.get('bpDia') or patient.get('bp_dia'), 80.0),
    )
    age = int(_num(patient.get('age'), 40))
    bmi = _num(patient.get('bmi'), 23.0)
    smoking = _flag(patient.get('smoking'))
    family = str(patient.get('familyHistory') or patient.get('family_history') or '')

    # ── ACC-AHA 2017 BP Stage ──
    breakdown: dict[str, int] = {}

    if sys < 120 and dia < 80:
        stage = 'normal'
        stage_points = 0
    elif sys < 130 and dia < 80:
        stage = 'elevated'
        stage_points = 15
    elif sys < 140 or dia < 90:
        stage = 'stage_1_hypertension'
        stage_points = 35
    elif sys < 180 or dia < 120:
        stage = 'stage_2_hypertension'
        stage_points = 60
    else:
        stage = 'hypertensive_crisis'
        stage_points = 90

    breakdown['bp_stage'] = stage_points

    # ── Progression risk modifiers ──
    breakdown['age'] = min(20, max(0, (age - 40) // 5 * 3))
    breakdown['bmi'] = 0 if bmi < 25 else (5 if bmi < 30 else 10)
    breakdown['smoking'] = 8 if smoking else 0
    breakdown['family_history'] = 6 if 'hyper' in family.lower() else 0

    raw_score = sum(breakdown.values())
    normalised = min(95, max(5, raw_score))

    # ── Urgency note ──
    if stage == 'hypertensive_crisis':
        note = 'BP ≥ 180/120 mmHg — URGENT: seek immediate medical care.'
    elif stage == 'stage_2_hypertension':
        note = 'Stage 2 hypertension. Antihypertensive medication likely required.'
    elif stage == 'stage_1_hypertension':
        note = 'Stage 1 hypertension. Lifestyle modification and clinical review recommended.'
    elif stage == 'elevated':
        note = 'Elevated BP (120-129/<80). Promote DASH diet and aerobic exercise.'
    else:
        note = 'BP is within normal range.'

    explanation = (
        f"Systolic {sys} / Diastolic {dia} mmHg → {stage.replace('_', ' ')}. "
        f"Progression risk score: {normalised}/100. {note}"
    )

    return {
        'score': normalised,
        'stage': stage,
        'systolic': sys,
        'diastolic': dia,
        'explanation': explanation,
        'breakdown': breakdown,
    }
