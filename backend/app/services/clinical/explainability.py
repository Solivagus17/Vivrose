"""SHAP explainability wrapper for clinical decision support.

Takes SHAP feature attribution outputs or model feature impacts and formats
them into structured, user-friendly natural language sentences for UI rendering.

Supports both English and Hindi localization.
"""
from __future__ import annotations
import json
from pathlib import Path

_I18N_DIR = Path(__file__).resolve().parent / 'i18n'


def _load_i18n(lang: str = 'en') -> dict:
    lang = 'hi' if str(lang).lower().startswith('hi') else 'en'
    path = _I18N_DIR / f"{lang}.json"
    if path.exists():
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return {}


def format_explanations(raw_explanations: list[dict], disease: str, lang: str = 'en') -> list[dict]:
    """
    Format SHAP explanation dicts.

    Args:
        raw_explanations: list of dicts with {feature, value, shap_value, direction, sentence}
        disease: disease name (e.g. 'diabetes')
        lang: 'en' or 'hi'

    Returns:
        Formatted list of dicts with translated / formatted sentences.
    """
    i18n = _load_i18n(lang)
    template = i18n.get(
        'shap_sentence',
        "{feature} of {value} {direction} {disease} risk by ~{pct}%."
    )

    formatted = []
    for item in raw_explanations:
        feat = str(item.get('feature', '')).replace('_', ' ').title()
        val = item.get('value', 'N/A')
        sv = item.get('shap_value', 0.0)
        direction = 'increases' if sv > 0 else 'decreases'
        pct = round(abs(sv) * 100, 1)

        sentence = template.format(
            feature=feat,
            value=val,
            direction=direction,
            disease=disease.replace('_', ' ').title(),
            pct=pct
        )

        formatted.append({
            'feature': feat,
            'value': val,
            'shapValue': round(float(sv), 4),
            'direction': direction,
            'pctChange': pct,
            'sentence': sentence,
        })

    return formatted
