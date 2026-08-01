"""BaseRiskModel — shared interface for all 5 ML disease models.

Every disease model must subclass this and implement:
    - FEATURE_SCHEMA: dict[str, type]  — canonical feature name → expected Python type
    - _build_model(): returns an untrained sklearn-compatible estimator
    - _engineer(raw_dict): transforms raw patient dict to feature vector (np.ndarray)

The base class handles:
    - Schema validation (raises ValueError on mismatch, never silently predicts garbage)
    - fit() / predict_proba() / explain() interface
    - save() / load() of trained artifacts (joblib)
    - Graceful failure with descriptive errors
"""
from __future__ import annotations

import os
import numpy as np
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any

# ── Optional ML imports — fail gracefully if not installed ────────────────
try:
    import joblib
    _JOBLIB_OK = True
except ImportError:
    _JOBLIB_OK = False

try:
    import shap as _shap
    _SHAP_OK = True
except ImportError:
    _SHAP_OK = False

# Default artifact save location — override with MODEL_DIR env var
_DEFAULT_MODEL_DIR = Path(__file__).resolve().parents[4] / 'models'


def _model_dir() -> Path:
    d = Path(os.getenv('MODEL_DIR', str(_DEFAULT_MODEL_DIR)))
    d.mkdir(parents=True, exist_ok=True)
    return d


class SchemaError(ValueError):
    """Raised when input patient dict does not satisfy FEATURE_SCHEMA."""


class ModelNotTrainedError(RuntimeError):
    """Raised when predict/explain is called before fit."""


class BaseRiskModel(ABC):
    """Abstract base class for all VivRose clinical ML models."""

    # Subclasses MUST override these
    DISEASE: str = 'unknown'
    FEATURE_SCHEMA: dict[str, type] = {}   # {'feature_name': float}

    def __init__(self):
        self._model: Any = None
        self._feature_names: list[str] = sorted(self.FEATURE_SCHEMA.keys())
        self._shap_explainer: Any = None

    # ── Abstract interface ─────────────────────────────────────────────────

    @abstractmethod
    def _build_model(self):
        """Return an untrained sklearn-compatible estimator."""

    @abstractmethod
    def _engineer(self, raw: dict) -> np.ndarray:
        """Transform raw patient dict → 1D numpy feature vector.
        Must return features in the same order as self._feature_names.
        """

    # ── Schema validation ──────────────────────────────────────────────────

    def validate(self, raw: dict) -> dict[str, Any]:
        """
        Validate raw patient dict against FEATURE_SCHEMA.
        Returns cleaned dict with coerced types.
        Raises SchemaError with descriptive message if required fields are wrong type.
        """
        cleaned: dict[str, Any] = {}
        errors: list[str] = []
        for name, expected_type in self.FEATURE_SCHEMA.items():
            v = raw.get(name)
            if v is None:
                cleaned[name] = None
                continue
            if isinstance(v, (str, bool, int, float)):
                cleaned[name] = v
            else:
                errors.append(f"Field '{name}': invalid value type {type(v).__name__}")
        if errors:
            raise SchemaError(
                f"{self.DISEASE} model input validation failed:\n" + "\n".join(errors)
            )
        return cleaned

    # ── Training ──────────────────────────────────────────────────────────

    def fit(self, X: np.ndarray, y: np.ndarray, **kwargs) -> 'BaseRiskModel':
        """Fit the model on pre-engineered feature matrix X and label vector y."""
        self._model = self._build_model()
        self._model.fit(X, y, **kwargs)
        # Pre-compute SHAP explainer after training if shap available
        if _SHAP_OK:
            try:
                self._shap_explainer = _shap.TreeExplainer(self._model)
            except Exception:
                self._shap_explainer = None
        return self

    # ── Inference ─────────────────────────────────────────────────────────

    def predict_proba(self, patient: dict) -> dict:
        """
        Predict risk probability for a single patient dict.

        Returns:
            {
              disease: str,
              probability: float,       # 0.0-1.0 (positive class)
              score: float,             # 0-100 for UI consistency
              confidence: str,          # 'high'|'moderate'|'low'
              source: 'ml',
            }
        """
        if self._model is None:
            raise ModelNotTrainedError(
                f"{self.DISEASE} model has not been trained. Call .fit() first or load a saved artifact."
            )
        self.validate(patient)
        x = self._engineer(patient).reshape(1, -1)
        prob = float(self._model.predict_proba(x)[0, 1])
        score = round(prob * 100, 1)
        confidence = 'high' if abs(prob - 0.5) > 0.25 else 'moderate' if abs(prob - 0.5) > 0.1 else 'low'
        return {
            'disease': self.DISEASE,
            'probability': round(prob, 4),
            'score': score,
            'confidence': confidence,
            'source': 'ml',
        }

    # ── Explainability ────────────────────────────────────────────────────

    def explain(self, patient: dict, top_n: int = 6) -> list[dict]:
        """
        Return SHAP-based feature explanations for a single patient.

        Returns list of dicts:
            {feature, value, shap_value, direction, sentence}
        Falls back to an empty list (not an error) if SHAP is unavailable.
        """
        if self._model is None:
            raise ModelNotTrainedError(f"{self.DISEASE} model not trained.")
        if not _SHAP_OK or self._shap_explainer is None:
            return []
        self.validate(patient)
        x = self._engineer(patient).reshape(1, -1)
        try:
            shap_vals = self._shap_explainer.shap_values(x)
            # For binary classification, shap_values may be list[array] or single array
            if isinstance(shap_vals, list):
                sv = shap_vals[1][0]   # positive class
            else:
                sv = shap_vals[0]
        except Exception:
            return []

        pairs = sorted(
            zip(self._feature_names, sv),
            key=lambda t: abs(t[1]),
            reverse=True,
        )[:top_n]

        results = []
        for feat, sv_val in pairs:
            raw_val = patient.get(feat)
            direction = 'increases' if sv_val > 0 else 'decreases'
            pct = round(abs(sv_val) * 100, 1)
            sentence = (
                f"{feat.replace('_', ' ').title()} of {raw_val} "
                f"{direction} {self.DISEASE} risk by ~{pct}%."
            )
            results.append({
                'feature': feat,
                'value': raw_val,
                'shap_value': round(float(sv_val), 4),
                'direction': direction,
                'sentence': sentence,
            })
        return results

    # ── Persistence ───────────────────────────────────────────────────────

    def save(self, path: str | Path | None = None) -> Path:
        if not _JOBLIB_OK:
            raise ImportError("joblib is required to save models. Install it: pip install joblib")
        if self._model is None:
            raise ModelNotTrainedError("Cannot save an untrained model.")
        p = Path(path) if path else _model_dir() / f'{self.DISEASE}.pkl'
        joblib.dump({'model': self._model, 'feature_names': self._feature_names}, p)
        return p

    def load(self, path: str | Path | None = None) -> 'BaseRiskModel':
        if not _JOBLIB_OK:
            raise ImportError("joblib is required to load models.")
        p = Path(path) if path else _model_dir() / f'{self.DISEASE}.pkl'
        if not p.exists():
            raise FileNotFoundError(f"No saved model found at {p}. Train the model first.")
        data = joblib.load(p)
        self._model = data['model']
        self._feature_names = data['feature_names']
        if _SHAP_OK:
            try:
                self._shap_explainer = _shap.TreeExplainer(self._model)
            except Exception:
                self._shap_explainer = None
        return self
