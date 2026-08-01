"""CKD progression ML model — XGBoost (shallow trees for small data).

Hyperparameters: max_depth=4, n_estimators=150, learning_rate=0.05.
"""
from __future__ import annotations

import os
import numpy as np
import pandas as pd
from pathlib import Path
from .base import BaseRiskModel

_DATA_DIR = Path(os.getenv('CLINICAL_DATA_DIR', str(Path(__file__).resolve().parents[4] / 'data' / 'mock')))


class CKDModel(BaseRiskModel):
    DISEASE = 'ckd'

    FEATURE_SCHEMA: dict = {
        'age': float,
        'sex': float,              # 0=male, 1=female
        'creatinine': float,       # mg/dL
        'egfr': float,             # mL/min/1.73m²
        'albumin_creatinine_ratio': float,  # mg/g
        'diabetes': float,         # 0/1
        'hypertension': float,     # 0/1
        'bmi': float,
    }

    def _build_model(self):
        try:
            from xgboost import XGBClassifier
            return XGBClassifier(
                n_estimators=150,
                max_depth=4,
                learning_rate=0.05,
                subsample=0.8,
                scale_pos_weight=4,
                use_label_encoder=False,
                eval_metric='logloss',
                random_state=42,
            )
        except ImportError:
            from sklearn.ensemble import GradientBoostingClassifier
            return GradientBoostingClassifier(n_estimators=100, max_depth=3, random_state=42)

    def _engineer(self, raw: dict) -> np.ndarray:
        def _f(k, d=0.0):
            try:
                return float(str(raw.get(k) or d).strip().split()[0])
            except Exception:
                return d

        sex_str = str(raw.get('sex') or 'male').lower()
        sex_enc = 1.0 if sex_str in ('female', 'f', 'woman') else 0.0

        egfr = _f('egfr', 0.0)
        creatinine = _f('creatinine', 0.9)

        return np.array([
            _f('age', 45),
            sex_enc,
            creatinine,
            egfr,
            _f('albuminCreatinineRatio') or _f('albumin_creatinine_ratio', 10),
            1.0 if str(raw.get('diabetesDx') or '').lower() in ('yes', 'true', '1') else 0.0,
            1.0 if str(raw.get('hypertensionDx') or '').lower() in ('yes', 'true', '1') else 0.0,
            _f('bmi', 23),
        ], dtype=np.float32)

    @classmethod
    def load_and_train(cls) -> 'CKDModel':
        model = cls()
        csv_path = _DATA_DIR / 'ckd.csv'
        if not csv_path.exists():
            raise FileNotFoundError(f"Training data not found at {csv_path}.")
        df = pd.read_csv(csv_path)
        X = df[list(cls.FEATURE_SCHEMA.keys())].fillna(df.median(numeric_only=True)).values.astype(np.float32)
        y = df['label'].values
        model.fit(X, y)
        return model
