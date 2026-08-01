from app.services import groq_service, risk_engine

mock_data = {
    "name": "Rohan Mehta",
    "age": 22,
    "sex": "male",
    "relation": "Son",
    "bp": "145/95 mmHg",
    "bmi": "27.5",
    "hba1c": "6.2",
    "glucose": "115",
    "cholesterol": "210",
    "creatinine": "0.9",
    "smoking": "Non-smoker",
    "conditions": ["Pre-Diabetes"],
    "familyHistory": "Diabetes (Father), Hypertension (Mother)",
    "medications": "None",
    "activity": "Sedentary",
    "diet": "Fair",
    "stress": "High"
}

def test_assessment_llm():
    print("Testing groq_service.analyze_health()...")
    baseline = risk_engine.compute(mock_data)
    result = groq_service.analyze_health(mock_data, baseline)
    print("Assessment Result Summary:", result.get("summary"))
    print("Scores Count:", len(result.get("scores", [])))
    print("Factors Count:", len(result.get("factors", [])))
    assert result is not None
    assert len(result.get("scores", [])) > 0
    print("SUCCESS: Groq LLM Assessment completed successfully.")

if __name__ == '__main__':
    test_assessment_llm()
