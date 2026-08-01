import json
import os
import requests
from flask import current_app

GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
MODEL_NAME = 'llama-3.1-8b-instant'


def _get_api_key():
    try:
        return current_app.config.get('GROQ_API_KEY') or os.getenv('GROQ_API_KEY', '')
    except RuntimeError:
        return os.getenv('GROQ_API_KEY', '')


def analyze_health(data, baseline_result):
    """Call Groq API (llama-3.1-8b-instant) to generate an AI clinical health report.
    
    Falls back gracefully to baseline_result if Groq API is unavailable or fails.
    """
    api_key = _get_api_key()
    if not api_key:
        return baseline_result

    name = data.get('name') or baseline_result.get('name') or 'This member'
    age = data.get('age') or ''
    sex = data.get('sex') or ''
    bp = data.get('bp') or baseline_result.get('bp') or 'Not reported'
    bmi = data.get('bmi') or baseline_result.get('bmi') or 'Not reported'
    hba1c = data.get('hba1c') or baseline_result.get('hba1c') or 'Not reported'
    glucose = data.get('glucose') or baseline_result.get('glucose') or 'Not reported'
    cholesterol = data.get('cholesterol') or baseline_result.get('cholesterol') or 'Not reported'
    creatinine = data.get('creatinine') or baseline_result.get('creatinine') or 'Not reported'
    smoking = data.get('smoking') or 'Non-smoker'
    conditions = data.get('conditions') or []
    family_history = data.get('familyHistory') or 'None reported'
    medications = data.get('medications') or 'None'
    overall_level = baseline_result.get('level', 'low')
    top_risk = baseline_result.get('risk', 'Low overall')

    prompt = f"""
System: You are an expert clinical AI physician evaluating health risk data for a family member.
Analyze the following health profile and generate a structured JSON health assessment report.

Patient Profile:
- Name: {name}
- Age: {age}, Sex: {sex}
- Baseline Risk Level: {overall_level.upper()} (Primary focus: {top_risk})
- Vitals & Labs: BP: {bp}, BMI: {bmi}, HbA1c: {hba1c}, Fasting Glucose: {glucose}, Cholesterol: {cholesterol}, Creatinine: {creatinine}
- Habits & History: Smoking: {smoking}, Known Conditions: {conditions}, Family History: {family_history}, Medications: {medications}

Respond strictly in valid JSON format with the following keys:
{{
  "summary": "HTML summary using <strong> tags for key findings",
  "report_summary": "Plain text version of summary without HTML tags",
  "findings": ["List of key clinical observations and risk factors"],
  "lifestyle": ["4-5 clear, actionable lifestyle/diet/exercise advice bullet points"],
  "checkup_list": ["List of recommended diagnostic tests or checkups with clinical rationale"],
  "recommendation_list": ["List of medical specialist recommendations if needed"]
}}
"""

    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }
    payload = {
        'model': MODEL_NAME,
        'messages': [
            {'role': 'system', 'content': 'You are a clinical AI health evaluation system that outputs strict valid JSON.'},
            {'role': 'user', 'content': prompt},
        ],
        'temperature': 0.2,
        'max_tokens': 1200,
        'response_format': {'type': 'json_object'},
    }

    try:
        resp = requests.post(GROQ_URL, headers=headers, json=payload, timeout=20)
        if resp.status_code == 200:
            content = resp.json()['choices'][0]['message']['content']
            parsed = json.loads(content)
            merged = dict(baseline_result)
            if parsed.get('summary'):
                merged['summary'] = parsed['summary']
            if parsed.get('report_summary'):
                merged['reportSummary'] = parsed['report_summary']
            if isinstance(parsed.get('findings'), list) and parsed['findings']:
                merged['findings'] = parsed['findings']
            if isinstance(parsed.get('lifestyle'), list) and parsed['lifestyle']:
                merged['lifestyle'] = parsed['lifestyle']
            if isinstance(parsed.get('checkup_list'), list) and parsed['checkup_list']:
                merged['checkupList'] = parsed['checkup_list']
            if isinstance(parsed.get('recommendation_list'), list) and parsed['recommendation_list']:
                merged['recommendationList'] = parsed['recommendation_list']
            return merged
    except Exception as exc:
        print(f"Groq API call failed, using baseline risk engine: {exc}")

    return baseline_result


def chat_reply(message, members_data):
    """Call Groq API (llama-3.1-8b-instant) for intelligent family health chat assistant."""
    api_key = _get_api_key()
    if not api_key:
        return None

    members_summary = json.dumps(members_data, indent=2)
    system_prompt = (
        "You are VivRose AI, an empathetic and knowledgeable family health assistant. "
        "Answer the user's question using the family health data provided below. "
        "Be concise, clear, reassuring, and provide actionable health advice."
    )
    user_prompt = f"Family Health Data:\n{members_summary}\n\nUser Question: {message}"

    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }
    payload = {
        'model': MODEL_NAME,
        'messages': [
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': user_prompt},
        ],
        'temperature': 0.4,
        'max_tokens': 600,
    }

    try:
        resp = requests.post(GROQ_URL, headers=headers, json=payload, timeout=15)
        if resp.status_code == 200:
            return resp.json()['choices'][0]['message']['content'].strip()
    except Exception as exc:
        print(f"Groq Chat API call failed: {exc}")

    return None
