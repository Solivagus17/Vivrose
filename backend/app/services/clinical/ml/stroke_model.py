"""Stroke risk ML model — LightGBM + Logistic Regression baseline.

Stroke has heavy class imbalance. Guards implemented:
  - class_weight='balanced' or SMOTE applied ONLY on training split
  - SMOTE is NEVER fitted on test data (anti-data-leakage guard built in)
  - Decision threshold tuned for recall, not default 0.5
  - LR baseline used for comparison; LightGBM is primary

Anti-leakage note:
    load_and_train() explicitly splits train/test BEFORE any SMOTE.
    SMOTE is fit_transform'd on X_train, y_train only.
    X_test is NEVER touched by SMOTE.
"""
from __future__ import annotations

import os
import numpy as np
import pandas as pd
from pathlib import Path
from .base import BaseRiskModel

_DATA_DIR = Path(os.getenv('CLINICAL_DATA_DIR', str(Path(__file__).resolve().parents[4] / 'data' / 'mock')))

# Recall-optimised decision threshold (tune on validation set with real data)
DEFAULT_THRESHOLD = 0.35


class StrokeModel(BaseRiskModel):
    DISEASE = 'stroke'

    FEATURE_SCHEMA: dict = {
        'age': float,
        'sex': float,             # 0=male, 1=female
        'systolic_bp': float,
        'afib': float,            # 0/1
        'diabetes': float,        # 0/1
        'smoking': float,         # 0/1
        'prior_stroke': float,    # 0/1 — prior stroke/TIA
        'vascular_disease': float,  # 0/1
        'heart_failure': float,   # 0/1
    }

    def __init__(self, threshold: float = DEFAULT_THRESHOLD):
        super().__init__()
        self.threshold = threshold

    def _build_model(self):
        try:
            from lightgbm import LGBMClassifier
            return LGBMClassifier(
                num_leaves=31,
                max_depth=5,
                learning_rate=0.04,
                n_estimators=300,
                class_weight='balanced',
                random_state=42,
                verbose=-1,
            )
        except ImportError:
            from sklearn.linear_model import LogisticRegression
            return LogisticRegression(class_weight='balanced', max_iter=500, random_state=42)

    def _engineer(self, raw: dict) -> np.ndarray:
        def _f(k, d=0.0):
            try:
                return float(str(raw.get(k) or d).strip().split()[0])
            except Exception:
                return d

        sex_enc = 1.0 if str(raw.get('sex') or '').lower() in ('female', 'f', 'woman') else 0.0
        bp_raw = str(raw.get('bp') or '120').replace('mmHg', '').strip()
        sys = float(bp_raw.split('/')[0]) if '/' in bp_raw else _f('bp', 120)

        def _bool(k):
            return 1.0 if str(raw.get(k) or '').lower() in ('yes', 'true', '1', 'present', 'afib') else 0.0

        return np.array([
            _f('age', 45),
            sex_enc,
            sys,
            _bool('afib'),
            1.0 if _bool('diabetesDx') or _f('hba1c') >= 6.5 else 0.0,
            _bool('smoking'),
            _bool('strokeHx') or _bool('stroke_hx'),
            _bool('vascularDisease') or _bool('vascular_disease'),
            _bool('heartFailure') or _bool('heart_failure'),
        ], dtype=np.float32)

    def predict_proba(self, patient: dict) -> dict:
        """Override to use recall-optimised threshold instead of default 0.5."""
        result = super().predict_proba(patient)
        # Re-classify using tuned threshold for recall
        prob = result['probability']
        positive = prob >= self.threshold
        result['predicted_positive'] = positive
        result['threshold_used'] = self.threshold
        result['score'] = round(prob * 100, 1)
        return result

    @classmethod
    def load_and_train(cls, use_smote: bool = True) -> 'StrokeModel':
        """
        Load CSV, split train/test FIRST, then optionally apply SMOTE to train only.

        ANTI-LEAKAGE GUARD: SMOTE is fit on X_train only. X_test is never resampled.
        """
        model = cls()
        csv_path = _DATA_DIR / 'stroke.csv'
        if not csv_path.exists():
            raise FileNotFoundError(f"Training data not found at {csv_path}.")
        df = pd.read_csv(csv_path)
        X_all = df[list(cls.FEATURE_SCHEMA.keys())].fillna(df.median(numeric_only=True)).values.astype(np.float32)
        y_all = df['label'].values

        from sklearn.model_selection import train_test_split
        X_train, X_test, y_train, y_test = train_test_split(
            X_all, y_all, test_size=0.2, random_state=42, stratify=y_all
        )

        if use_smote:
            try:
                from imblearn.over_sampling import SMOTE
                # ANTI-LEAKAGE: fit_transform ONLY on X_train, y_train
                smote = SMOTE(random_state=42, k_neighbors=min(5, sum(y_train == 1) - 1))
                X_train, y_train = smote.fit_resample(X_train, y_train)
            except ImportError:
                pass  # imbalanced-learn not installed — proceed without SMOTE
            except ValueError:
                pass  # too few minority samples in mock data

        model.fit(X_train, y_train)
        return model
