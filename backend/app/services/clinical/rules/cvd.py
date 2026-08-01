"""Framingham / ASCVD 10-year CVD risk calculator.

Implements the Framingham Risk Score (ATP III) for 10-year hard coronary
heart disease (CHD) risk. This is a well-validated, widely-used formula.
Reference: Wilson et al., Circulation 1998; D'Agostino et al., Circulation 2008.

Inputs (patient dict keys):
    age          : int   — 20-79 years
    sex          : str   — 'male'/'female'
    total_cholesterol : float — mg/dL (also 'cholesterol')
    hdl          : float — HDL cholesterol mg/dL
    bp / systolic: float — systolic BP mmHg
    bp_treated   : bool  — on antihypertensive treatment
    smoking      : str/bool
    diabetes_dx  : bool  — known diabetes diagnosis

Returns:
    {
      score: float,          # 0-100 (10-year risk %)
      stage: str,            # 'low'|'borderline'|'intermediate'|'high'
      ten_year_pct: float,   # raw Framingham %
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


def _flag(v) -> bool:
    return str(v or '').strip().lower() in ('yes', 'true', '1', 'y', 'smoker', 'current')


def _parse_sys(bp_val) -> float:
    raw = str(bp_val or '120').replace('mmHg', '').strip()
    return _num(raw.split('/')[0])


# ── Framingham coefficients (log-cox model) ──
# Source: D'Agostino et al., Circulation 2008 (general CVD, both sexes)

_MEN = {
    'ln_age': 3.06117,
    'ln_tc': 1.12370,
    'ln_hdl': -0.93263,
    'ln_sbp_treated': 1.99881,
    'ln_sbp_untreated': 1.93303,
    'smoking': 0.65451,
    'diabetes': 0.57367,
    'baseline_survival': 0.88936,
    'mean_coeff_sum': 23.9802,
}
_WOMEN = {
    'ln_age': 2.32888,
    'ln_tc': 1.20904,
    'ln_hdl': -0.70833,
    'ln_sbp_treated': 2.76157,
    'ln_sbp_untreated': 2.82263,
    'smoking': 0.52873,
    'diabetes': 0.69154,
    'baseline_survival': 0.94833,
    'mean_coeff_sum': 26.1931,
}


def score(patient: dict) -> dict:
    age = int(_num(patient.get('age'), 45))
    sex = str(patient.get('sex') or 'male').lower()
    is_female = sex in ('female', 'f', 'woman')

    tc = _num(patient.get('totalCholesterol') or patient.get('cholesterol'), 180.0)
    hdl = _num(patient.get('hdl'), 50.0)
    sbp = _parse_sys(patient.get('bp', 120))
    bp_treated = _flag(patient.get('bpTreated') or patient.get('bp_treated'))
    smoking = _flag(patient.get('smoking'))
    diabetes_dx = _flag(patient.get('diabetesDx') or patient.get('diabetes_dx')) or _num(patient.get('hba1c')) >= 6.5

    # Clamp inputs to Framingham valid ranges
    age = max(20, min(79, age))
    tc = max(100, min(400, tc))
    hdl = max(20, min(100, hdl))
    sbp = max(90, min(200, sbp))

    c = _WOMEN if is_female else _MEN

    sbp_term = (
        c['ln_sbp_treated'] * math.log(sbp) if bp_treated
        else c['ln_sbp_untreated'] * math.log(sbp)
    )

    coeff_sum = (
        c['ln_age'] * math.log(age)
        + c['ln_tc'] * math.log(tc)
        + c['ln_hdl'] * math.log(hdl)
        + sbp_term
        + c['smoking'] * int(smoking)
        + c['diabetes'] * int(diabetes_dx)
    )

    ten_year_risk = (1 - c['baseline_survival'] ** math.exp(coeff_sum - c['mean_coeff_sum'])) * 100
    ten_year_risk = max(0.5, min(99.5, ten_year_risk))

    # ACC/AHA CVD risk categories
    if ten_year_risk < 5:
        stage = 'low'
    elif ten_year_risk < 7.5:
        stage = 'borderline'
    elif ten_year_risk < 20:
        stage = 'intermediate'
    else:
        stage = 'high'

    # Normalise to 0-100 UI score
    normalised = min(95, max(5, round(ten_year_risk)))

    breakdown = {
        'age': age,
        'sex': 'female' if is_female else 'male',
        'total_cholesterol_mg_dl': tc,
        'hdl_mg_dl': hdl,
        'systolic_bp_mmhg': sbp,
        'on_bp_treatment': bp_treated,
        'current_smoker': smoking,
        'diabetes': diabetes_dx,
        'framingham_pct': round(ten_year_risk, 1),
    }

    explanation = (
        f"Framingham 10-year CVD risk = {ten_year_risk:.1f}% → {stage} risk. "
        + (f"Smoking adds significant CVD risk. " if smoking else "")
        + (f"Diabetes further elevates cardiovascular risk. " if diabetes_dx else "")
        + (f"TC {tc} mg/dL with HDL {hdl} mg/dL (ratio {tc/hdl:.1f}). " if hdl > 0 else "")
    )

    return {
        'score': normalised,
        'stage': stage,
        'ten_year_pct': round(ten_year_risk, 1),
        'explanation': explanation,
        'breakdown': breakdown,
    }
