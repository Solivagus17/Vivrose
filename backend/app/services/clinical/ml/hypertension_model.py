"""Hypertension progression ML model — LightGBM.

Predicts PROGRESSION RISK (not current stage — that is deterministic in rules/hypertension.py).

Hyperparameters: num_leaves=40, max_depth=6, learning_rate=0.05, min_child_samples=20.
"""
from __future__ import annotations

import os
import numpy as np
import pandas as pd
from pathlib import Path
from .base import BaseRiskModel

_DATA_DIR = Path(os.getenv('CLINICAL_DATA_DIR', str(Path(__file__).resolve().parents[4] / 'data' / 'mock')))


class HypertensionModel(BaseRiskModel):
    DISEASE = 'hypertension'

    FEATURE_SCHEMA: dict = {
        'age': float,
        'bmi': float,
        'systolic_bp': float,
        'diastolic_bp': float,
        'smoking': float,        # 0/1
        'family_history_htn': float,  # 0/1
        'diabetes': float,       # 0/1
        'salt_intake': float,    # 1=low, 2=medium, 3=high (optional)
    }

    def _build_model(self):
        try:
            from lightgbm import LGBMClassifier
            return LGBMClassifier(
                num_leaves=40,
                max_depth=6,
                learning_rate=0.05,
                n_estimators=250,
                min_child_samples=20,
                random_state=42,
                verbose=-1,
            )
        except ImportError:
            from sklearn.ensemble import RandomForestClassifier
            return RandomForestClassifier(n_estimators=200, max_depth=7, random_state=42)

    def _engineer(self, raw: dict) -> np.ndarray:
        def _f(k, d=0.0):
            try:
                return float(str(raw.get(k) or d).strip().split()[0])
            except Exception:
                return d

        bp_raw = str(raw.get('bp') or '120/80').replace('mmHg', '').strip()
        if '/' in bp_raw:
            sys = float(bp_raw.split('/')[0])
            dia = float(bp_raw.split('/')[1])
        else:
            sys = _f('bp', 120)
            dia = _f('bpDia', 80)

        family = str(raw.get('familyHistory') or '').lower()

        return np.array([
            _f('age', 40),
            _f('bmi', 23),
            sys,
            dia,
            1.0 if str(raw.get('smoking') or '').lower() in ('yes', 'true', '1', 'smoker') else 0.0,
            1.0 if 'hyper' in family else 0.0,
            1.0 if str(raw.get('diabetesDx') or '').lower() in ('yes', 'true', '1') else 0.0,
            _f('saltIntake') or _f('salt_intake', 2),
        ], dtype=np.float32)

    @classmethod
    def load_and_train(cls) -> 'HypertensionModel':
        model = cls()
        csv_path = _DATA_DIR / 'hypertension.csv'
        if not csv_path.exists():
            raise FileNotFoundError(f"Training data not found at {csv_path}.")
        df = pd.read_csv(csv_path)
        X = df[list(cls.FEATURE_SCHEMA.keys())].fillna(df.median(numeric_only=True)).values.astype(np.float32)
        y = df['label'].values
        model.fit(X, y)
        return model
