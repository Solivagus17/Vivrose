"""Early warning and progression detection module.

AUTOMATIC mode selection:
  - Multi-visit (visits list with ≥2 entries): computes rate-of-change features.
  - Single-visit (most common case): fires rule-based red-flag triggers.

The caller does NOT need to know which mode is active — it is selected automatically.

Usage:
    from app.services.clinical import early_warning
    flags = early_warning.detect(patient_record)
    # OR with visit history:
    flags = early_warning.detect(patient_record, visits=[older_visit, newer_visit])
"""
from __future__ import annotations
from datetime import datetime

# ── Red-flag threshold triggers (single-visit fallback) ──────────────────
RED_FLAGS: list[dict] = [
    {
        'field': 'egfr',
        'condition': lambda v: v < 30,
        'level': 'critical',
        'title': 'Severe renal impairment',
        'message': 'eGFR < 30 mL/min/1.73m² — KDIGO G4/G5. Urgent nephrology referral required.',
    },
    {
        'field': 'hba1c',
        'condition': lambda v: v > 9.0,
        'level': 'high',
        'title': 'Very poor glycaemic control',
        'message': 'HbA1c > 9% indicates severely uncontrolled diabetes. Immediate management review required.',
    },
    {
        'field': 'hba1c',
        'condition': lambda v: 6.5 <= v <= 9.0,
        'level': 'moderate',
        'title': 'Diabetes range HbA1c',
        'message': 'HbA1c ≥ 6.5% meets diagnostic criteria for type 2 diabetes.',
    },
    {
        'field': 'systolic',
        'condition': lambda v: v >= 180,
        'level': 'critical',
        'title': 'Hypertensive crisis',
        'message': 'Systolic BP ≥ 180 mmHg — seek immediate medical evaluation. Organ damage risk.',
    },
    {
        'field': 'systolic',
        'condition': lambda v: 160 <= v < 180,
        'level': 'high',
        'title': 'Stage 2 hypertension (severe)',
        'message': 'Systolic BP 160-179 mmHg. Antihypertensive medication and urgent clinical review needed.',
    },
    {
        'field': 'bmi',
        'condition': lambda v: v >= 35,
        'level': 'high',
        'title': 'Class III obesity',
        'message': 'BMI ≥ 35 kg/m² — metabolic surgery evaluation recommended alongside intensive lifestyle change.',
    },
    {
        'field': 'cholesterol',
        'condition': lambda v: v > 300,
        'level': 'high',
        'title': 'Severely elevated cholesterol',
        'message': 'Total cholesterol > 300 mg/dL. Rule out familial hypercholesterolaemia. Statin therapy indicated.',
    },
    {
        'field': 'glucose',
        'condition': lambda v: v >= 200,
        'level': 'critical',
        'title': 'Critically high blood glucose',
        'message': 'Fasting glucose ≥ 200 mg/dL. Meets WHO criteria for diabetes diagnosis. Urgent evaluation.',
    },
    {
        'field': 'stroke_hx',
        'condition': lambda v: bool(v),
        'level': 'high',
        'title': 'Prior stroke / TIA',
        'message': 'History of stroke or TIA dramatically raises recurrence risk. Neurology follow-up essential.',
    },
]


def _num(v, default: float = 0.0) -> float:
    try:
        return float(str(v or '').strip().split()[0])
    except Exception:
        return default


def _flag(v) -> bool:
    return str(v or '').strip().lower() in ('yes', 'true', '1', 'y', 'present', 'afib', 'af')


def _extract_single(patient: dict) -> dict:
    """Normalise patient dict to numeric values for single-visit checks."""
    sbp_raw = str(patient.get('bp') or '120').replace('mmHg', '').strip()
    sbp = _num(sbp_raw.split('/')[0])
    return {
        'egfr': _num(patient.get('egfr'), -1),
        'hba1c': _num(patient.get('hba1c')),
        'systolic': sbp,
        'bmi': _num(patient.get('bmi')),
        'cholesterol': _num(patient.get('cholesterol')),
        'glucose': _num(patient.get('glucose')),
        'stroke_hx': _flag(patient.get('strokeHx') or patient.get('stroke_hx')),
    }


def _single_visit_flags(patient: dict) -> list[dict]:
    values = _extract_single(patient)
    triggered = []
    for rule in RED_FLAGS:
        field = rule['field']
        v = values.get(field)
        if v is None or v == 0.0:
            continue
        # skip eGFR check if not provided
        if field == 'egfr' and v < 0:
            continue
        try:
            if rule['condition'](v):
                triggered.append({
                    'source': 'red_flag_threshold',
                    'field': field,
                    'value': v,
                    'level': rule['level'],
                    'title': rule['title'],
                    'message': rule['message'],
                })
        except Exception:
            continue
    return triggered


def _parse_dt(iso: str | None) -> datetime | None:
    if not iso:
        return None
    try:
        return datetime.fromisoformat(str(iso).replace('Z', '+00:00'))
    except Exception:
        return None


def _progression_flags(visits: list[dict]) -> list[dict]:
    """Compute delta features across two or more visits and flag threshold breaches."""
    if len(visits) < 2:
        return []

    # Sort oldest → newest
    def visit_dt(v):
        return _parse_dt(v.get('assessedAt') or v.get('assessed_at') or v.get('createdAt')) or datetime.min

    sorted_visits = sorted(visits, key=visit_dt)
    oldest = sorted_visits[0]
    newest = sorted_visits[-1]

    dt_old = visit_dt(oldest)
    dt_new = visit_dt(newest)
    years = max(0.08, (dt_new - dt_old).days / 365.25) if dt_old != datetime.min else 1.0

    flags: list[dict] = []

    # ΔeGFR / year
    egfr_old = _num(oldest.get('egfr'), -1)
    egfr_new = _num(newest.get('egfr'), -1)
    if egfr_old > 0 and egfr_new > 0:
        delta_egfr = egfr_new - egfr_old
        rate = delta_egfr / years
        if rate < -5:
            flags.append({
                'source': 'progression_delta',
                'field': 'egfr',
                'delta_per_year': round(rate, 1),
                'level': 'critical' if rate < -10 else 'high',
                'title': 'Rapid eGFR decline',
                'message': (
                    f"eGFR declining at {abs(rate):.1f} mL/min/1.73m²/year "
                    f"({egfr_old:.0f} → {egfr_new:.0f}). "
                    f"Threshold for rapid progression: >5 mL/min/year. Nephrology referral needed."
                ),
            })

    # ΔHbA1c / 6 months
    hba1c_old = _num(oldest.get('hba1c'))
    hba1c_new = _num(newest.get('hba1c'))
    if hba1c_old > 0 and hba1c_new > 0:
        delta_hba1c = hba1c_new - hba1c_old
        rate_6m = delta_hba1c / (years * 2)
        if rate_6m > 0.5:
            flags.append({
                'source': 'progression_delta',
                'field': 'hba1c',
                'delta_per_6_months': round(rate_6m, 2),
                'level': 'high',
                'title': 'Rising HbA1c trend',
                'message': (
                    f"HbA1c rising by {rate_6m:.1f}% per 6 months "
                    f"({hba1c_old}% → {hba1c_new}%). Diabetes management intensification needed."
                ),
            })

    # ΔSBP / year
    sbp_old = _num(str(oldest.get('bp') or '').replace('mmHg', '').split('/')[0])
    sbp_new = _num(str(newest.get('bp') or '').replace('mmHg', '').split('/')[0])
    if sbp_old > 0 and sbp_new > 0:
        delta_sbp = sbp_new - sbp_old
        rate = delta_sbp / years
        if rate > 10:
            flags.append({
                'source': 'progression_delta',
                'field': 'systolic_bp',
                'delta_per_year': round(rate, 1),
                'level': 'moderate',
                'title': 'Rising blood pressure trend',
                'message': (
                    f"Systolic BP rising by {rate:.0f} mmHg/year "
                    f"({sbp_old:.0f} → {sbp_new:.0f} mmHg). Blood pressure monitoring intensification advised."
                ),
            })

    return flags


def detect(patient: dict, visits: list[dict] | None = None) -> dict:
    """
    Detect early warnings and progression flags.

    Args:
        patient:  Current patient record dict (most recent visit).
        visits:   Optional list of historical visit dicts (oldest → newest or any order).
                  If 2+ visits are provided, progression analysis is performed.
                  If None or 1 visit, falls back to single-visit red-flag triggers.

    Returns:
        {
          mode: str,          # 'multi_visit' or 'single_visit'
          flags: list[dict],  # combined list of all triggered warnings
          has_critical: bool,
          has_high: bool,
          summary: str,
        }
    """
    flags: list[dict] = []
    mode = 'single_visit'

    if visits and len(visits) >= 2:
        mode = 'multi_visit'
        flags.extend(_progression_flags(visits))

    # Always run single-visit red-flag triggers (even in multi-visit mode)
    flags.extend(_single_visit_flags(patient))

    # Deduplicate by (field, level, source)
    seen: set[tuple] = set()
    deduped: list[dict] = []
    for f in flags:
        key = (f.get('field'), f.get('level'), f.get('source'))
        if key not in seen:
            seen.add(key)
            deduped.append(f)

    has_critical = any(f['level'] == 'critical' for f in deduped)
    has_high = any(f['level'] in ('critical', 'high') for f in deduped)

    summary = (
        f"{len(deduped)} warning(s) detected ({mode}). "
        + ('⚠ CRITICAL flags present — immediate clinical attention required.' if has_critical else '')
    )

    return {
        'mode': mode,
        'flags': deduped,
        'has_critical': has_critical,
        'has_high': has_high,
        'summary': summary,
    }
