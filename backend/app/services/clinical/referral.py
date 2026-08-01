"""Referral logic module — fully traceable, rule-based.

Takes the combined risk output from the clinical engine and produces
referral recommendations with explicit urgency reasoning.

NO black-box decisions here — every referral maps to a documented rule.

Usage:
    from app.services.clinical import referral
    refs = referral.generate(combined_scores, early_warning_flags, patient)
"""
from __future__ import annotations

# ── Referral rule table ──────────────────────────────────────────────────
# Each rule: (condition_fn, recommendation_dict)
# Evaluated in order; all matching rules are included.

def _score(combined: dict, disease: str) -> float:
    return float(combined.get(disease, {}).get('score', 0))

def _stage(combined: dict, disease: str) -> str:
    return str(combined.get(disease, {}).get('stage', ''))

def _has_critical(flags: list[dict]) -> bool:
    return any(f.get('level') == 'critical' for f in flags)

def _has_field_flag(flags: list[dict], field: str) -> bool:
    return any(f.get('field') == field for f in flags)


REFERRAL_RULES: list[dict] = [
    # ── Hypertensive crisis ───────────────────────────────────────────
    {
        'id': 'HTN_CRISIS',
        'condition': lambda c, f, p: _has_field_flag(f, 'systolic') and any(f2.get('level') == 'critical' for f2 in f if f2.get('field') == 'systolic'),
        'specialty': 'Emergency Medicine',
        'icon': 'alert',
        'reason': 'Hypertensive crisis (SBP ≥ 180 mmHg) — immediate evaluation for end-organ damage.',
        'urgency': 'emergency',
        'urgency_days': 0,
        'timeline': 'Go to ER now',
        'priority': 'critical',
        'priorityClass': 'high',
    },
    # ── CKD G4/G5 ────────────────────────────────────────────────────
    {
        'id': 'CKD_NEPHRO',
        'condition': lambda c, f, p: _score(c, 'ckd') >= 65 or _has_field_flag(f, 'egfr'),
        'specialty': 'Nephrology',
        'icon': 'droplet',
        'reason': 'eGFR critically reduced or rapidly declining. Nephrology referral for CKD management.',
        'urgency': 'urgent',
        'urgency_days': 14,
        'timeline': 'Book within 2 weeks',
        'priority': 'high',
        'priorityClass': 'high',
    },
    # ── High CVD risk ─────────────────────────────────────────────────
    {
        'id': 'CVD_CARDIO',
        'condition': lambda c, f, p: _score(c, 'cvd') >= 40,
        'specialty': 'Cardiology',
        'icon': 'heart',
        'reason': 'High 10-year cardiovascular risk. Cardiology review for statin therapy and risk management.',
        'urgency': 'soon',
        'urgency_days': 30,
        'timeline': 'Book within 1 month',
        'priority': 'high',
        'priorityClass': 'high',
    },
    # ── High stroke risk ──────────────────────────────────────────────
    {
        'id': 'STROKE_NEURO',
        'condition': lambda c, f, p: _score(c, 'stroke') >= 50,
        'specialty': 'Neurology',
        'icon': 'brain',
        'reason': 'High stroke risk detected. Neurology review; consider anticoagulation if AFib present.',
        'urgency': 'soon',
        'urgency_days': 21,
        'timeline': 'Book within 3 weeks',
        'priority': 'high',
        'priorityClass': 'high',
    },
    # ── High diabetes risk ────────────────────────────────────────────
    {
        'id': 'DM_ENDO',
        'condition': lambda c, f, p: _score(c, 'diabetes') >= 60,
        'specialty': 'Endocrinology',
        'icon': 'pill',
        'reason': 'High FINDRISC diabetes risk. Endocrinology for metabolic evaluation and diabetes prevention.',
        'urgency': 'soon',
        'urgency_days': 30,
        'timeline': 'Book within 1 month',
        'priority': 'high',
        'priorityClass': 'high',
    },
    # ── Moderate overall risk: GP review ─────────────────────────────
    {
        'id': 'GP_MODERATE',
        'condition': lambda c, f, p: (
            any(_score(c, d) >= 30 for d in ['diabetes', 'hypertension', 'ckd', 'cvd', 'stroke'])
            and not any(_score(c, d) >= 60 for d in ['diabetes', 'hypertension', 'ckd', 'cvd', 'stroke'])
        ),
        'specialty': 'General Physician',
        'icon': 'stethoscope',
        'reason': 'Moderate risk across one or more conditions. Primary care follow-up for monitoring and lifestyle support.',
        'urgency': 'routine',
        'urgency_days': 42,
        'timeline': 'Book within 6 weeks',
        'priority': 'moderate',
        'priorityClass': 'moderate',
    },
    # ── Low risk: lifestyle ───────────────────────────────────────────
    {
        'id': 'LIFESTYLE',
        'condition': lambda c, f, p: all(_score(c, d) < 30 for d in ['diabetes', 'hypertension', 'ckd', 'cvd', 'stroke']),
        'specialty': 'Lifestyle & Preventive Health',
        'icon': 'bolt',
        'reason': 'Low risk across all conditions. Maintain lifestyle habits and annual health check-up.',
        'urgency': 'routine',
        'urgency_days': 365,
        'timeline': 'Annual health review',
        'priority': 'low',
        'priorityClass': 'low',
    },
]


def generate(
    combined_scores: dict,
    early_warning_flags: list[dict],
    patient: dict,
) -> list[dict]:
    """
    Generate referral recommendations based on combined risk scores and early warnings.

    Args:
        combined_scores: dict mapping disease → {score, stage, ...} from rule/ML engine.
        early_warning_flags: list of flag dicts from early_warning.detect().
        patient: raw patient record (used for context in condition functions).

    Returns:
        list of referral dicts, each containing specialty, urgency, reason, timeline.
    """
    referrals = []
    for rule in REFERRAL_RULES:
        try:
            if rule['condition'](combined_scores, early_warning_flags, patient):
                referrals.append({
                    'id': rule['id'],
                    'specialty': rule['specialty'],
                    'icon': rule['icon'],
                    'reason': rule['reason'],
                    'urgency': rule['urgency'],
                    'urgency_days': rule['urgency_days'],
                    'timeline': rule['timeline'],
                    'priority': rule['priority'],
                    'priorityClass': rule['priorityClass'],
                })
        except Exception:
            continue

    return referrals
