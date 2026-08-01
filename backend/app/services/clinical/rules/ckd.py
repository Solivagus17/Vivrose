"""CKD-EPI eGFR calculator + KDIGO staging.

CKD-EPI 2021 equation (race-free, validated across populations).
Reference: Inker et al., NEJM 2021.

Inputs (patient dict keys):
    creatinine  : float — serum creatinine mg/dL
    age         : int   — years
    sex         : str   — 'male'/'female'
    albumin_creatinine_ratio : float — mg/g (ACR, urine albumin-to-creatinine ratio)
    egfr        : float — if pre-computed, skip calculation

Returns:
    {
      score: float,          # 0-100 normalised (inverted eGFR)
      stage: str,            # KDIGO G-stage + A-stage
      egfr: float,           # mL/min/1.73m²
      g_stage: str,          # G1-G5
      a_stage: str,          # A1-A3
      kdigo_risk: str,       # KDIGO heatmap risk cell
      explanation: str,
      breakdown: dict,
    }
"""
from __future__ import annotations
import math


def _num(v, default=0.0) -> float:
    try:
        return float(str(v or '').strip().split()[0])
    except (ValueError, IndexError, TypeError):
        return default


def _ckd_epi_2021(creatinine: float, age: int, sex: str) -> float:
    """CKD-EPI 2021 (race-free) creatinine equation."""
    is_female = sex.strip().lower() in ('female', 'f', 'woman')
    kappa = 0.7 if is_female else 0.9
    alpha = -0.241 if is_female else -0.302
    sex_mult = 1.012 if is_female else 1.0

    ratio = creatinine / kappa
    if ratio < 1:
        gfr = 142 * (ratio ** alpha) * (0.9938 ** age) * sex_mult
    else:
        gfr = 142 * (ratio ** -1.200) * (0.9938 ** age) * sex_mult

    return round(gfr, 1)


def _g_stage(egfr: float) -> str:
    if egfr >= 90:
        return 'G1'
    if egfr >= 60:
        return 'G2'
    if egfr >= 45:
        return 'G3a'
    if egfr >= 30:
        return 'G3b'
    if egfr >= 15:
        return 'G4'
    return 'G5'


def _a_stage(acr: float) -> str:
    """KDIGO albuminuria category."""
    if acr < 30:
        return 'A1'   # normal to mildly increased
    if acr < 300:
        return 'A2'   # moderately increased
    return 'A3'       # severely increased


# KDIGO heatmap: (G-stage, A-stage) → risk
_KDIGO_RISK = {
    ('G1', 'A1'): 'low_if_no_ckd_markers',
    ('G1', 'A2'): 'moderately_increased',
    ('G1', 'A3'): 'high',
    ('G2', 'A1'): 'low_if_no_ckd_markers',
    ('G2', 'A2'): 'moderately_increased',
    ('G2', 'A3'): 'high',
    ('G3a', 'A1'): 'moderately_increased',
    ('G3a', 'A2'): 'high',
    ('G3a', 'A3'): 'very_high',
    ('G3b', 'A1'): 'high',
    ('G3b', 'A2'): 'very_high',
    ('G3b', 'A3'): 'very_high',
    ('G4', 'A1'): 'very_high',
    ('G4', 'A2'): 'very_high',
    ('G4', 'A3'): 'very_high',
    ('G5', 'A1'): 'kidney_failure',
    ('G5', 'A2'): 'kidney_failure',
    ('G5', 'A3'): 'kidney_failure',
}


def score(patient: dict) -> dict:
    creatinine = _num(patient.get('creatinine'), 0.9)
    age = int(_num(patient.get('age'), 45))
    sex = str(patient.get('sex') or 'male')
    acr = _num(patient.get('albuminCreatinineRatio') or patient.get('albumin_creatinine_ratio'), 10.0)

    # Use pre-computed eGFR if provided
    egfr_input = _num(patient.get('egfr'), 0.0)
    egfr = egfr_input if egfr_input > 0 else _ckd_epi_2021(creatinine, age, sex)

    g_stage = _g_stage(egfr)
    a_stage = _a_stage(acr)
    kdigo_key = (g_stage, a_stage)
    kdigo_risk = _KDIGO_RISK.get(kdigo_key, 'moderately_increased')

    # Normalise eGFR to 0-100 risk (inverted: lower eGFR = higher risk)
    # eGFR 90+ → score ~5, eGFR 15 → score ~83, eGFR <15 → score ~95
    normalised = min(95, max(5, round(100 - (egfr / 120 * 100))))

    breakdown = {
        'egfr': round(egfr, 1),
        'g_stage': g_stage,
        'a_stage': a_stage,
        'acr_mg_g': round(acr, 1),
        'creatinine_mg_dl': round(creatinine, 2),
    }

    explanation = (
        f"CKD-EPI eGFR = {egfr:.1f} mL/min/1.73m² → {g_stage}. "
        f"Albuminuria: ACR {acr:.0f} mg/g → {a_stage}. "
        f"KDIGO risk: {kdigo_risk.replace('_', ' ')}. "
    )
    if g_stage in ('G4', 'G5'):
        explanation += 'Nephrology referral recommended urgently.'
    elif g_stage == 'G3b':
        explanation += 'Renal function significantly reduced. Nephrology review advised.'
    elif egfr < 60:
        explanation += 'eGFR below 60 confirms CKD if persistent >3 months.'

    return {
        'score': normalised,
        'stage': f'{g_stage} {a_stage}',
        'g_stage': g_stage,
        'a_stage': a_stage,
        'egfr': egfr,
        'kdigo_risk': kdigo_risk,
        'explanation': explanation,
        'breakdown': breakdown,
    }
