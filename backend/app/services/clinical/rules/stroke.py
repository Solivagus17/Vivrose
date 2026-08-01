"""Stroke risk scorer: CHA₂DS₂-VASc (AFib path) + QStroke-style fallback.

Path selection is AUTOMATIC:
  - If `afib` is truthy → use CHA₂DS₂-VASc (annual stroke risk in AF)
  - Otherwise → use simplified stroke risk score (SRS) from demographic/vascular
    risk factors (QStroke-style linear model).

Inputs (patient dict keys):
    afib         : bool/str   — atrial fibrillation diagnosis
    age          : int
    sex          : str
    bp           : float/str  — systolic mmHg
    diabetes_dx  : bool/str
    heart_failure: bool/str
    stroke_hx    : bool/str   — prior stroke or TIA
    vascular_disease : bool/str — prior MI, PAD, or aortic plaque
    smoking      : str/bool
    family_history : str

Returns:
    {
      score: float,          # 0-100 normalised
      stage: str,            # 'low'|'moderate'|'high'|'very_high'
      raw_score: float,      # CHA2DS2-VASc or SRS raw
      path: str,             # 'CHA2DS2-VASc' or 'SRS-fallback'
      annual_stroke_pct: float | None,  # only for CHA2DS2-VASc path
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
    return str(v or '').strip().lower() in ('yes', 'true', '1', 'y', 'afib', 'af', 'present')


def _parse_sys(bp_val) -> float:
    raw = str(bp_val or '120').replace('mmHg', '').strip()
    return _num(raw.split('/')[0])


# CHA2DS2-VASc → approximate annual stroke risk mapping
# Source: Lip et al., European Heart Journal 2010 / ESC 2016 guidelines
_CHA2DS2_VASC_RISK = {
    0: 0.0, 1: 1.3, 2: 2.2, 3: 3.2, 4: 4.0, 5: 6.7, 6: 9.8, 7: 9.6, 8: 12.5, 9: 15.2,
}


def _cha2ds2_vasc(patient: dict) -> dict:
    age = int(_num(patient.get('age'), 45))
    sex = str(patient.get('sex') or 'male').lower()
    is_female = sex in ('female', 'f', 'woman')

    breakdown: dict[str, int] = {}
    breakdown['heart_failure'] = 1 if _flag(patient.get('heartFailure') or patient.get('heart_failure')) else 0
    breakdown['hypertension'] = 1 if _parse_sys(patient.get('bp', 120)) >= 140 else 0
    breakdown['age_75_plus'] = 2 if age >= 75 else 0
    breakdown['diabetes'] = 1 if _flag(patient.get('diabetesDx') or patient.get('diabetes_dx')) or _num(patient.get('hba1c')) >= 6.5 else 0
    breakdown['stroke_hx'] = 2 if _flag(patient.get('strokeHx') or patient.get('stroke_hx')) else 0
    breakdown['vascular_disease'] = 1 if _flag(patient.get('vascularDisease') or patient.get('vascular_disease')) else 0
    breakdown['age_65_74'] = 1 if 65 <= age < 75 else 0
    breakdown['sex_female'] = 1 if is_female else 0

    total = sum(breakdown.values())
    annual_pct = _CHA2DS2_VASC_RISK.get(total, 15.2)

    # Normalise: CHA2DS2-VASc max=9, max annual risk ~15 %
    normalised = min(95, max(5, round(annual_pct * 6.5)))

    if total <= 1:
        stage = 'low'
    elif total <= 3:
        stage = 'moderate'
    elif total <= 6:
        stage = 'high'
    else:
        stage = 'very_high'

    return {
        'score': normalised,
        'stage': stage,
        'raw_score': total,
        'annual_stroke_pct': annual_pct,
        'path': 'CHA2DS2-VASc',
        'explanation': (
            f"CHA₂DS₂-VASc score = {total}/9. "
            f"Estimated annual stroke risk: {annual_pct}%. "
            f"{'Anticoagulation strongly recommended.' if total >= 2 else 'Low stroke risk; anticoagulation may not be required.'}"
        ),
        'breakdown': breakdown,
    }


def _srs_fallback(patient: dict) -> dict:
    """Simplified stroke risk score for patients without known AF."""
    age = int(_num(patient.get('age'), 45))
    sbp = _parse_sys(patient.get('bp', 120))
    smoking = _flag(patient.get('smoking'))
    diabetes = _flag(patient.get('diabetesDx') or patient.get('diabetes_dx')) or _num(patient.get('hba1c')) >= 6.5
    stroke_hx = _flag(patient.get('strokeHx') or patient.get('stroke_hx'))
    family = str(patient.get('familyHistory') or '').lower()

    breakdown: dict[str, int] = {}
    breakdown['age'] = max(0, (age - 45) // 5 * 3)
    breakdown['systolic_bp'] = max(0, round((sbp - 120) * 0.4))
    breakdown['smoking'] = 5 if smoking else 0
    breakdown['diabetes'] = 4 if diabetes else 0
    breakdown['prior_stroke_tia'] = 12 if stroke_hx else 0
    breakdown['family_history'] = 6 if 'stroke' in family else 0

    raw = sum(breakdown.values())
    normalised = min(95, max(5, raw))

    if normalised < 20:
        stage = 'low'
    elif normalised < 40:
        stage = 'moderate'
    elif normalised < 65:
        stage = 'high'
    else:
        stage = 'very_high'

    return {
        'score': normalised,
        'stage': stage,
        'raw_score': raw,
        'annual_stroke_pct': None,
        'path': 'SRS-fallback',
        'explanation': (
            f"No AFib detected. Using simplified stroke risk scoring. "
            f"Score = {raw}/100. "
            + ('Prior stroke/TIA is the dominant risk factor. ' if breakdown['prior_stroke_tia'] > 0 else '')
            + ('Smoking and diabetes are major modifiable factors. ' if smoking and diabetes else '')
        ),
        'breakdown': breakdown,
    }


def score(patient: dict) -> dict:
    if _flag(patient.get('afib')):
        return _cha2ds2_vasc(patient)
    return _srs_fallback(patient)
