"""Missing-investigation + confidence engine.

For each disease, defines:
  - REQUIRED fields (confidence degrades sharply if missing)
  - RECOMMENDED fields (confidence degrades mildly if missing)
  - NEVER_NEEDED fields (no penalty)

Returns:
    {
      missing_required: list[str],     # field names that are absent
      missing_optional: list[str],     # recommended but not critical
      confidence: float,               # 0.0-1.0
      confidence_label: str,           # 'high'|'moderate'|'low'|'very_low'
      investigation_prompts: list[str],  # plain-language prompts to surface in UI
    }
"""
from __future__ import annotations

# ── Field requirements matrix per disease ──────────────────────────────────
REQUIRED: dict[str, list[str]] = {
    'diabetes': ['age', 'bmi', 'sex'],
    'hypertension': ['bp', 'age'],
    'ckd': ['creatinine', 'age', 'sex'],
    'cvd': ['age', 'sex', 'cholesterol', 'bp'],
    'stroke': ['age', 'sex', 'bp'],
}

RECOMMENDED: dict[str, list[str]] = {
    'diabetes': ['hba1c', 'glucose', 'waistCm', 'familyHistory', 'physicalActivity'],
    'hypertension': ['bmi', 'smoking', 'familyHistory', 'bpDia'],
    'ckd': ['albuminCreatinineRatio', 'egfr'],
    'cvd': ['hdl', 'smoking', 'diabetesDx', 'bpTreated'],
    'stroke': ['afib', 'strokeHx', 'diabetesDx', 'smoking', 'vascularDisease'],
}

# Human-readable prompts shown in the UI
PROMPTS: dict[str, str] = {
    'hba1c': 'Order HbA1c (glycated haemoglobin) for accurate glucose control assessment.',
    'glucose': 'Fasting plasma glucose (FPG) is needed to detect pre-diabetes and diabetes.',
    'waistCm': 'Waist circumference helps assess central obesity risk.',
    'creatinine': 'Serum creatinine is essential for eGFR calculation and CKD detection.',
    'albuminCreatinineRatio': 'Urine albumin-to-creatinine ratio (ACR) classifies CKD severity.',
    'egfr': 'eGFR confirms kidney filtration rate — can be derived from creatinine.',
    'cholesterol': 'Total cholesterol (and ideally a full lipid panel) is required for CVD risk.',
    'hdl': 'HDL cholesterol substantially modifies CVD risk — include in lipid panel.',
    'bp': 'Blood pressure reading is essential for hypertension and stroke risk assessment.',
    'bpDia': 'Diastolic blood pressure completes the ACC-AHA BP staging.',
    'smoking': 'Smoking status is a major independent risk factor across all five diseases.',
    'afib': 'Screen for atrial fibrillation (ECG or pulse palpation) — it dramatically raises stroke risk.',
    'strokeHx': 'Document any prior stroke or TIA — it is the strongest stroke predictor.',
    'vascularDisease': 'Prior MI, PAD, or aortic disease markedly increases CVD and stroke risk.',
    'familyHistory': 'Family history of diabetes, CVD, hypertension, or stroke should be documented.',
    'physicalActivity': 'Physical activity level is a key modifiable diabetes risk factor.',
    'diabetesDx': 'Known diabetes diagnosis significantly modifies CVD and stroke risk calculation.',
    'bpTreated': 'Whether the patient is on antihypertensive treatment changes the Framingham coefficient.',
    'sex': 'Patient sex is required for CKD-EPI eGFR and Framingham equations.',
    'age': 'Patient age is required for all clinical risk formulas.',
    'bmi': 'BMI is needed for diabetes and hypertension risk assessment.',
}


def _present(patient: dict, field: str) -> bool:
    """A field is present if non-null and non-empty-string."""
    v = patient.get(field)
    if v is None:
        return False
    if isinstance(v, str) and v.strip() in ('', 'none', 'n/a', 'unknown', '-', '—'):
        return False
    return True


def assess(patient: dict, disease: str) -> dict:
    """Return missing-field analysis for a single disease."""
    required = REQUIRED.get(disease, [])
    recommended = RECOMMENDED.get(disease, [])

    missing_req = [f for f in required if not _present(patient, f)]
    missing_opt = [f for f in recommended if not _present(patient, f)]

    # Confidence degradation
    # Required fields: each missing costs 0.20
    # Optional fields: each missing costs 0.05 (capped at 0.25 total)
    req_penalty = min(1.0, len(missing_req) * 0.20)
    opt_penalty = min(0.25, len(missing_opt) * 0.05)
    confidence = round(max(0.05, 1.0 - req_penalty - opt_penalty), 2)

    if confidence >= 0.80:
        label = 'high'
    elif confidence >= 0.55:
        label = 'moderate'
    elif confidence >= 0.30:
        label = 'low'
    else:
        label = 'very_low'

    prompts = []
    for f in (missing_req + missing_opt):
        p = PROMPTS.get(f)
        if p:
            prompts.append(p)

    return {
        'disease': disease,
        'missing_required': missing_req,
        'missing_optional': missing_opt,
        'confidence': confidence,
        'confidence_label': label,
        'investigation_prompts': prompts,
    }


def assess_all(patient: dict) -> dict:
    """Run missing-field analysis for all 5 diseases and return combined."""
    diseases = ['diabetes', 'hypertension', 'ckd', 'cvd', 'stroke']
    per_disease = {d: assess(patient, d) for d in diseases}

    # Overall confidence = mean of per-disease confidences
    overall = round(sum(v['confidence'] for v in per_disease.values()) / len(diseases), 2)

    # Deduplicated global prompts (union of all missing fields)
    seen: set[str] = set()
    global_prompts: list[str] = []
    for d in diseases:
        for f in per_disease[d]['missing_required'] + per_disease[d]['missing_optional']:
            if f not in seen:
                seen.add(f)
                p = PROMPTS.get(f)
                if p:
                    global_prompts.append(p)

    return {
        'per_disease': per_disease,
        'overall_confidence': overall,
        'overall_confidence_label': (
            'high' if overall >= 0.80 else
            'moderate' if overall >= 0.55 else
            'low' if overall >= 0.30 else 'very_low'
        ),
        'global_investigation_prompts': global_prompts,
    }
