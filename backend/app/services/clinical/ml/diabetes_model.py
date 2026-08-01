"""Diabetes risk ML model — XGBoost classifier.

Hyperparameters: n_estimators=300, max_depth=5, learning_rate=0.04,
subsample=0.8, colsample_bytree=0.8, scale_pos_weight tuned for imbalance.

Feature schema documented below. Swap mock data for real data by setting
CLINICAL_DATA_DIR env var pointing to a directory with diabetes.csv.
"""
from __future__ import annotations

import os
import numpy as np
import pandas as pd
from pathlib import Path
from .base import BaseRiskModel

_DATA_DIR = Path(os.getenv('CLINICAL_DATA_DIR', str(Path(__file__).resolve().parents[4] / 'data' / 'mock')))


class DiabetesModel(BaseRiskModel):
    DISEASE = 'diabetes'

    # Canonical feature schema — real data must match these names (snake_case)
    FEATURE_SCHEMA: dict = {
        'age': float,
        'bmi': float,
        'hba1c': float,
        'glucose': float,       # fasting plasma glucose mg/dL
        'waist_cm': float,
        'physical_activity': float,  # 0=no, 1=yes
        'family_history_dm': float,  # 0/1
        'hypertension': float,  # 0/1
    }

    def _build_model(self):
        try:
            from xgboost import XGBClassifier
            return XGBClassifier(
                n_estimators=300,
                max_depth=5,
                learning_rate=0.04,
                subsample=0.8,
                colsample_bytree=0.8,
                scale_pos_weight=3,   # handles class imbalance
                use_label_encoder=False,
                eval_metric='logloss',
                random_state=42,
            )
        except ImportError:
            from sklearn.ensemble import GradientBoostingClassifier
            return GradientBoostingClassifier(
                n_estimators=200, max_depth=4, learning_rate=0.05, random_state=42
            )

    def _engineer(self, raw: dict) -> np.ndarray:
        def _f(k, d=0.0):
            try:
                return float(str(raw.get(k) or d).strip().split()[0])
            except Exception:
                return d

        family = str(raw.get('familyHistory') or raw.get('family_history') or '').lower()
        htn = str(raw.get('hypertensionDx') or raw.get('hypertension') or '').lower() in ('yes', 'true', '1')

        return np.array([
            _f('age', 40),
            _f('bmi', 23),
            _f('hba1c', 5.4),
            _f('glucose', 90),
            _f('waistCm') or _f('waist_cm', 80),
            1.0 if str(raw.get('physicalActivity') or '').lower() in ('yes', 'true', '1') else 0.0,
            1.0 if 'diabet' in family else 0.0,
            1.0 if htn else 0.0,
        ], dtype=np.float32)

    @classmethod
    def load_and_train(cls) -> 'DiabetesModel':
        """Load mock/real CSV, engineer features, fit model. Returns trained instance."""
        model = cls()
        csv_path = _DATA_DIR / 'diabetes.csv'
        if not csv_path.exists():
            raise FileNotFoundError(f"Training data not found at {csv_path}. Set CLINICAL_DATA_DIR env var.")
        df = pd.read_csv(csv_path)
        required_cols = list(cls.FEATURE_SCHEMA.keys()) + ['label']
        _check_cols(df, required_cols, 'diabetes.csv')
        X = df[list(cls.FEATURE_SCHEMA.keys())].fillna(df.median(numeric_only=True)).values.astype(np.float32)
        y = df['label'].values
        model.fit(X, y)
        return model


def _check_cols(df: pd.DataFrame, required: list[str], fname: str):
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError(f"{fname} is missing required columns: {missing}")
