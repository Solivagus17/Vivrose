"""Clinical Decision Support System (CDSS) API Blueprint.

Base endpoint: /api/cdss

Endpoints:
    POST /api/cdss/assess
        Combined CDSS assessment for a patient across all 5 clinical conditions.
        Accepts:
            {
              "patient": dict,              # patient clinical inputs (age, bp, bmi, hba1c, etc.)
              "visits": list[dict],         # optional historical visits for progression
              "lang": "en" | "hi",          # localization preference (default "en")
              "use_ml": bool                # optional flag to include ML predictions (default True)
            }

    POST /api/cdss/<disease>
        Single-disease CDSS assessment (disease: 'diabetes'|'hypertension'|'ckd'|'cvd'|'stroke').
"""
from __future__ import annotations

from flask import Blueprint, jsonify, request
from ..security import require_user
from ..services.clinical import (
    diabetes,
    hypertension,
    ckd,
    cvd,
    stroke,
    missing_fields,
    early_warning,
    referral,
    explainability,
)
from ..services.clinical.ml import (
    diabetes_model,
    hypertension_model,
    ckd_model,
    cvd_model,
    stroke_model,
)

bp = Blueprint('cdss', __name__, url_prefix='/api/cdss')

DISEASE_RULES = {
    'diabetes': diabetes.score,
    'hypertension': hypertension.score,
    'ckd': ckd.score,
    'cvd': cvd.score,
    'stroke': stroke.score,
}

ML_MODEL_CLASSES = {
    'diabetes': diabetes_model.DiabetesModel,
    'hypertension': hypertension_model.HypertensionModel,
    'ckd': ckd_model.CKDModel,
    'cvd': cvd_model.CVDModel,
    'stroke': stroke_model.StrokeModel,
}

# Cache for trained ML instances
_TRAINED_ML_MODELS: dict[str, any] = {}


def _get_ml_model(disease: str):
    """Retrieve or load/train ML model instance for a disease. Returns None if unavailable."""
    if disease in _TRAINED_ML_MODELS:
        return _TRAINED_ML_MODELS[disease]
    cls = ML_MODEL_CLASSES.get(disease)
    if not cls:
        return None
    try:
        model = cls()
        # Try loading saved artifact first
        try:
            model.load()
        except Exception:
            # Fall back to training from CSV if artifact doesn't exist yet
            model = cls.load_and_train()
        _TRAINED_ML_MODELS[disease] = model
        return model
    except Exception:
        return None


@bp.route('/assess', methods=['POST'])
@require_user
def assess_all():
    payload = request.get_json() or {}
    patient = payload.get('patient') or payload
    visits = payload.get('visits')
    lang = payload.get('lang', 'en')
    use_ml = payload.get('use_ml', True)

    if not isinstance(patient, dict):
        return jsonify({'error': 'Invalid patient payload. Expected a dictionary.'}), 400

    # 1. Rule-based scores for all 5 diseases
    rule_results = {}
    for d, scorer in DISEASE_RULES.items():
        try:
            rule_results[d] = scorer(patient)
        except Exception as exc:
            rule_results[d] = {
                'score': 5,
                'stage': 'error',
                'explanation': f"Calculation error: {exc}",
                'breakdown': {},
            }

    # 2. Optional ML predictions & SHAP explainability
    ml_results = {}
    explanations = {}
    if use_ml:
        for d in DISEASE_RULES.keys():
            m = _get_ml_model(d)
            if m is not None:
                try:
                    pred = m.predict_proba(patient)
                    ml_results[d] = pred
                    raw_shap = m.explain(patient)
                    if raw_shap:
                        explanations[d] = explainability.format_explanations(raw_shap, d, lang)
                except Exception:
                    pass

    # 3. Missing fields & confidence calculation
    missing_analysis = missing_fields.assess_all(patient)

    # 4. Early warning & progression detection
    ew_flags = early_warning.detect(patient, visits)

    # 5. Referral recommendations
    referrals = referral.generate(rule_results, ew_flags['flags'], patient)

    # Combined risk synthesis
    max_score = max(r.get('score', 0) for r in rule_results.values()) if rule_results else 0
    overall_level = (
        'critical' if ew_flags['has_critical'] or max_score >= 80 else
        'high' if max_score >= 60 else
        'moderate' if max_score >= 30 else 'low'
    )

    return jsonify({
        'overallRiskScore': max_score,
        'overallLevel': overall_level,
        'ruleScores': rule_results,
        'mlPredictions': ml_results,
        'explanations': explanations,
        'missingAnalysis': missing_analysis,
        'earlyWarnings': ew_flags,
        'referrals': referrals,
        'lang': lang,
    }), 200


@bp.route('/<disease>', methods=['POST'])
@require_user
def assess_disease(disease):
    disease = str(disease).lower().strip()
    if disease not in DISEASE_RULES:
        return jsonify({
            'error': f"Unknown disease '{disease}'. Supported diseases: {list(DISEASE_RULES.keys())}"
        }), 404

    payload = request.get_json() or {}
    patient = payload.get('patient') or payload
    lang = payload.get('lang', 'en')

    if not isinstance(patient, dict):
        return jsonify({'error': 'Invalid patient payload. Expected a dictionary.'}), 400

    # Rule score
    rule_res = DISEASE_RULES[disease](patient)

    # Missing fields for this disease
    missing_res = missing_fields.assess(patient, disease)

    # Optional ML score & explanation
    ml_res = None
    exp_res = []
    m = _get_ml_model(disease)
    if m is not None:
        try:
            ml_res = m.predict_proba(patient)
            raw_shap = m.explain(patient)
            if raw_shap:
                exp_res = explainability.format_explanations(raw_shap, disease, lang)
        except Exception:
            pass

    return jsonify({
        'disease': disease,
        'ruleScore': rule_res,
        'mlPrediction': ml_res,
        'explanations': exp_res,
        'missingAnalysis': missing_res,
        'lang': lang,
    }), 200
