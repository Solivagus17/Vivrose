"""CVD risk ML model — CatBoost (handles categorical fields natively).

Hyperparameters: depth=6, iterations=500, learning_rate=0.03, l2_leaf_reg=3.
Falls back to LightGBM if CatBoost not installed.
"""
from __future__ import annotations

import os
import numpy as np
import pandas as pd
from pathlib import Path
from .base import BaseRiskModel

_DATA_DIR = Path(os.getenv('CLINICAL_DATA_DIR', str(Path(__file__).resolve().parents[4] / 'data' / 'mock')))


class CVDModel(BaseRiskModel):
    DISEASE = 'cvd'

    FEATURE_SCHEMA: dict = {
        'age': float,
        'sex': float,             # 0=male, 1=female
        'total_cholesterol': float,  # mg/dL
        'hdl': float,             # mg/dL
        'systolic_bp': float,
        'bp_treated': float,      # 0/1
        'smoking': float,         # 0/1
        'diabetes': float,        # 0/1
        'bmi': float,
    }

    def _build_model(self):
        try:
            from catboost import CatBoostClassifier
            return CatBoostClassifier(
                depth=6,
                iterations=500,
                learning_rate=0.03,
                l2_leaf_reg=3,
                auto_class_weights='Balanced',
                verbose=0,
                random_state=42,
            )
        except ImportError:
            try:
                from lightgbm import LGBMClassifier
                return LGBMClassifier(
                    num_leaves=40, max_depth=6, learning_rate=0.03,
                    n_estimators=400, class_weight='balanced',
                    random_state=42, verbose=-1,
                )
            except ImportError:
                from sklearn.ensemble import GradientBoostingClassifier
                return GradientBoostingClassifier(n_estimators=200, max_depth=5, random_state=42)

    def _engineer(self, raw: dict) -> np.ndarray:
        def _f(k, d=0.0):
            try:
                return float(str(raw.get(k) or d).strip().split()[0])
            except Exception:
                return d

        sex_enc = 1.0 if str(raw.get('sex') or '').lower() in ('female', 'f', 'woman') else 0.0
        bp_raw = str(raw.get('bp') or '120').replace('mmHg', '').strip()
        sys = float(bp_raw.split('/')[0]) if '/' in bp_raw else _f('bp', 120)

        return np.array([
            _f('age', 45),
            sex_enc,
            _f('totalCholesterol') or _f('cholesterol', 180),
            _f('hdl', 50),
            sys,
            1.0 if str(raw.get('bpTreated') or '').lower() in ('yes', 'true', '1') else 0.0,
            1.0 if str(raw.get('smoking') or '').lower() in ('yes', 'true', '1', 'smoker') else 0.0,
            1.0 if str(raw.get('diabetesDx') or '').lower() in ('yes', 'true', '1') or _f('hba1c') >= 6.5 else 0.0,
            _f('bmi', 23),
        ], dtype=np.float32)

    @classmethod
    def load_and_train(cls) -> 'CVDModel':
        model = cls()
        csv_path = _DATA_DIR / 'cvd.csv'
        if not csv_path.exists():
            raise FileNotFoundError(f"Training data not found at {csv_path}.")
        df = pd.read_csv(csv_path)
        X = df[list(cls.FEATURE_SCHEMA.keys())].fillna(df.median(numeric_only=True)).values.astype(np.float32)
        y = df['label'].values
        model.fit(X, y)
        return model
