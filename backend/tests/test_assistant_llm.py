from app.services import assistant, groq_service

mock_members = [
    {
        "name": "Rajesh Patel",
        "relation": "Father",
        "age": 52,
        "risk": "High",
        "scores": [{"label": "Diabetes", "score": 78, "level": "High"}],
        "bp": "165/100 mmHg",
        "hba1c": "8.4%",
        "bmi": "32.0"
    }
]

def test_assistant_reply():
    print("Testing assistant.reply()...")
    reply = assistant.reply("What should Rajesh do about his high blood pressure of 165/100?", mock_members)
    print("Reply received:\n", reply)
    assert "consult a real doctor" in reply.lower()
    print("SUCCESS: Medical disclaimer present in reply.")

if __name__ == '__main__':
    test_assistant_reply()
