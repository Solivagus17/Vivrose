"""Unit tests for ML model base class, feature engineering, and training on mock CSVs."""
from app.services.clinical.ml import (
    diabetes_model,
    hypertension_model,
    ckd_model,
    cvd_model,
    stroke_model,
)


def test_diabetes_model_train_and_predict():
    m = diabetes_model.DiabetesModel.load_and_train()
    patient = {
        'age': 55, 'bmi': 31.5, 'hba1c': 7.8, 'glucose': 140,
        'waistCm': 102, 'physicalActivity': 'no', 'familyHistory': 'Father had diabetes'
    }
    pred = m.predict_proba(patient)
    assert pred['disease'] == 'diabetes'
    assert 0.0 <= pred['probability'] <= 1.0
    assert 0 <= pred['score'] <= 100


def test_hypertension_model_train_and_predict():
    m = hypertension_model.HypertensionModel.load_and_train()
    patient = {'age': 60, 'bmi': 28, 'bp': '150/95', 'smoking': 'yes'}
    pred = m.predict_proba(patient)
    assert pred['disease'] == 'hypertension'


def test_ckd_model_train_and_predict():
    m = ckd_model.CKDModel.load_and_train()
    patient = {'age': 65, 'sex': 'male', 'creatinine': 2.1, 'egfr': 32.0}
    pred = m.predict_proba(patient)
    assert pred['disease'] == 'ckd'


def test_cvd_model_train_and_predict():
    m = cvd_model.CVDModel.load_and_train()
    patient = {'age': 58, 'sex': 'male', 'totalCholesterol': 240, 'hdl': 38, 'bp': '145'}
    pred = m.predict_proba(patient)
    assert pred['disease'] == 'cvd'


def test_stroke_model_train_and_predict():
    m = stroke_model.StrokeModel.load_and_train(use_smote=True)
    patient = {'age': 72, 'sex': 'female', 'bp': '160', 'afib': 'yes', 'prior_stroke': 1}
    pred = m.predict_proba(patient)
    assert pred['disease'] == 'stroke'
    assert 'predicted_positive' in pred
