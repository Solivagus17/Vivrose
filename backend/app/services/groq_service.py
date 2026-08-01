import json
import os
import time
from datetime import datetime, timezone
import requests
from flask import current_app

GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
MODEL_NAME = 'llama-3.1-8b-instant'

LLM_LOGS = []


def _get_api_key():
    try:
        return current_app.config.get('GROQ_API_KEY') or os.getenv('GROQ_API_KEY', '')
    except RuntimeError:
        return os.getenv('GROQ_API_KEY', '')


def _log_interaction(call_type, messages, response_content, status_code, duration_ms, error=None):
    entry = {
        'id': f"log-{int(time.time() * 1000)}",
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'callType': call_type,
        'messages': messages,
        'response': response_content,
        'statusCode': status_code,
        'durationMs': round(duration_ms, 1),
        'status': 'SUCCESS' if status_code == 200 and not error else 'ERROR',
        'error': error,
    }
    LLM_LOGS.insert(0, entry)
    if len(LLM_LOGS) > 50:
        LLM_LOGS.pop()

    print(f"\n==================== [LLM LOG: {call_type}] ====================")
    print(f"Time: {entry['timestamp']} | Status: {entry['statusCode']} | Duration: {entry['durationMs']}ms")
    print(f"Messages Payload:\n{json.dumps(messages, indent=2)}")
    print(f"Response:\n{response_content if response_content else f'ERROR: {error}'}")
    print("=================================================================\n")

    # Append interaction to local groq_api_conversations.txt file
    try:
        root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
        file_path = os.path.join(root_dir, 'groq_api_conversations.txt')

        formatted_messages = ""
        if isinstance(messages, list):
            for m in messages:
                formatted_messages += f"[{m.get('role', 'user').upper()}]\n{m.get('content', '')}\n\n"

        log_block = (
            f"================================================================================\n"
            f"TIMESTAMP: {entry['timestamp']}\n"
            f"CALL TYPE: {call_type}\n"
            f"STATUS: {entry['statusCode']} {entry['status']} (Duration: {entry['durationMs']} ms)\n"
            f"--------------------------------------------------------------------------------\n"
            f"PROMPT MESSAGES SENT TO GROQ LLM API:\n\n"
            f"{formatted_messages.strip()}\n"
            f"--------------------------------------------------------------------------------\n"
            f"RESPONSE RECEIVED FROM GROQ LLM API:\n\n"
            f"{response_content if response_content else f'ERROR: {error}'}\n"
            f"================================================================================\n\n\n"
        )

        with open(file_path, 'a', encoding='utf-8') as f:
            f.write(log_block)
    except Exception as exc:
        print(f"Failed to append to groq_api_conversations.txt: {exc}")

    return entry



def get_llm_logs():
    return list(LLM_LOGS)


def analyze_health(data, baseline_result):
    """Call Groq API (llama-3.1-8b-instant) to generate a comprehensive AI clinical health report."""
    api_key = _get_api_key()
    if not api_key:
        _log_interaction('AI Health Assessment', [], None, 401, 0, 'GROQ_API_KEY missing')
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
    activity = data.get('activity') or 'Not specified'
    diet = data.get('diet') or 'Not specified'
    stress = data.get('stress') or 'Not specified'
    sleep = data.get('sleep') or 'Not specified'
    fatigue = data.get('fatigue') or 'Not specified'

    prompt = f"""
System: You are an expert clinical AI decision support system (CDSS) evaluating health risk data for a family member.
Analyze the patient profile below and generate an exhaustive, evidence-based AI health assessment.

Patient Profile:
- Name: {name}
- Age: {age}, Sex: {sex}
- Vitals & Labs: BP: {bp}, BMI: {bmi}, HbA1c: {hba1c}, Fasting Glucose: {glucose}, Cholesterol: {cholesterol}, Creatinine: {creatinine}
- Habits & History: Smoking: {smoking}, Known Conditions: {conditions}, Family History: {family_history}, Medications: {medications}
- Lifestyle & Symptoms: Physical Activity: {activity}, Diet: {diet}, Stress: {stress}, Sleep: {sleep} hrs/night, Fatigue: {fatigue}

Respond strictly in valid JSON format with the following keys:
{{
  "scores": [
    {{"label": "Diabetes", "score": 75, "level": "high", "trend": "up", "trendLabel": "Rising", "points": "2,10 10,18 18,11 26,26 34,34 38,38", "color": "#C43C3C"}},
    {{"label": "Hypertension", "score": 60, "level": "moderate", "trend": "flat", "trendLabel": "Stable", "points": "2,10 10,12 18,10 26,9 34,9 38,9", "color": "#D49A2A"}},
    {{"label": "CVD", "score": 45, "level": "moderate", "trend": "flat", "trendLabel": "Stable", "points": "2,10 10,12 18,10 26,9 34,9 38,9", "color": "#D49A2A"}},
    {{"label": "Stroke", "score": 30, "level": "low", "trend": "flat", "trendLabel": "Stable", "points": "2,10 10,9 18,9 26,9 34,9 38,9", "color": "#2E9E6A"}}
  ],
  "summary": "HTML executive clinical summary using <strong> tags for key findings",
  "report_summary": "Plain text version of summary without HTML tags",
  "findings": ["List of key clinical observations and risk factors"],
  "lifestyle": ["4-5 clear, actionable lifestyle/diet/exercise advice bullet points"],
  "checkup_list": ["List of recommended diagnostic tests or checkups with clinical rationale"],
  "recommendation_list": ["List of medical specialist recommendations if needed"],
  "factors": [
    {{"name": "Blood Pressure", "value": "165/100 mmHg — Stage 2 Hypertension", "width": 85, "gradient": "linear-gradient(90deg, #C43C3C, #E06060)", "impact": "high", "impactLabel": "High"}}
  ],
  "checkups": [
    {{"icon": "droplet", "name": "HbA1c + Fasting Glucose", "rationale": "Baseline sugar check to monitor glycemic control."}}
  ],
  "warnings": [
    {{"level": "high", "icon": "alert", "title": "Elevated Blood Pressure", "desc": "Systolic BP > 160 mmHg warrants clinical attention."}}
  ],
  "recommendations": [
    {{"icon": "stethoscope", "specialty": "Cardiologist", "reason": "High hypertension & cardiovascular risk evaluation", "priority": "high", "priorityClass": "high", "timeline": "Book within 2 weeks"}}
  ]
}}
"""

    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }
    messages = [
        {'role': 'system', 'content': 'You are a clinical AI health evaluation system that outputs strict valid JSON.'},
        {'role': 'user', 'content': prompt},
    ]
    payload = {
        'model': MODEL_NAME,
        'messages': messages,
        'temperature': 0.3,
        'max_tokens': 1500,
        'response_format': {'type': 'json_object'},
    }

    start_t = time.time()
    try:
        resp = requests.post(GROQ_URL, headers=headers, json=payload, timeout=25)
        dur = (time.time() - start_t) * 1000
        if resp.status_code == 200:
            content = resp.json()['choices'][0]['message']['content']
            _log_interaction('AI Health Assessment', messages, content, 200, dur)
            parsed = json.loads(content)
            merged = dict(baseline_result)
            merged['llmStatus'] = 'success'
            merged['llmError'] = None

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
            if isinstance(parsed.get('scores'), list) and parsed['scores']:
                merged['scores'] = parsed['scores']
                top = max(parsed['scores'], key=lambda s: int(s.get('score', 0)))
                merged['level'] = top.get('level', merged.get('level'))
                merged['risk'] = top.get('label', merged.get('risk'))
            if isinstance(parsed.get('factors'), list) and parsed['factors']:
                merged['factors'] = parsed['factors']
            if isinstance(parsed.get('checkups'), list) and parsed['checkups']:
                merged['checkups'] = parsed['checkups']
            if isinstance(parsed.get('warnings'), list) and parsed['warnings']:
                merged['warnings'] = parsed['warnings']
            if isinstance(parsed.get('recommendations'), list) and parsed['recommendations']:
                merged['recommendations'] = parsed['recommendations']

            return merged
        else:
            err_msg = f"Groq LLM API HTTP {resp.status_code}: {resp.text[:220]}"
            _log_interaction('AI Health Assessment', messages, None, resp.status_code, dur, error=err_msg)
            merged = dict(baseline_result)
            merged['llmStatus'] = 'error'
            merged['llmError'] = err_msg
            return merged
    except Exception as exc:
        dur = (time.time() - start_t) * 1000
        err_msg = f"Groq LLM API Exception: {exc}"
        _log_interaction('AI Health Assessment', messages, None, 500, dur, error=err_msg)
        merged = dict(baseline_result)
        merged['llmStatus'] = 'error'
        merged['llmError'] = err_msg
        return merged


def _compress_member_for_chat(m):
    """Return a lean dict with only clinically meaningful fields — strips all UI-only noise
    (CSS gradients, SVG polyline points, avatar strings, duplicate arrays, icon names, etc.)
    to keep token count well under the 6000 TPM free-tier limit."""
    # Summarise scores as a compact string, e.g. "Diabetes 75% high, Hypertension 60% moderate"
    scores_summary = ', '.join(
        f"{s.get('label')} {s.get('score')}% {s.get('level')}"
        for s in (m.get('scores') or [])
        if s.get('label')
    )
    # Keep only the name/rationale from checkups, not icon strings
    checkups = [
        f"{c.get('name')}: {c.get('rationale', '')}"
        for c in (m.get('checkups') or m.get('checkupList') or [])
        if isinstance(c, dict) and c.get('name')
    ]
    recommendations = [
        f"{r.get('specialty')} – {r.get('reason')} ({r.get('timeline', '')})"
        for r in (m.get('recommendations') or m.get('recommendationList') or [])
        if isinstance(r, dict) and r.get('specialty')
    ]
    warnings = [
        f"{w.get('title')}: {w.get('desc', '')}"
        for w in (m.get('warnings') or [])
        if isinstance(w, dict) and w.get('title')
    ]
    factors = [
        f"{f.get('name')}: {f.get('value')}"
        for f in (m.get('factors') or [])
        if isinstance(f, dict) and f.get('name')
    ]

    return {
        'name': m.get('name'),
        'age': m.get('age'),
        'sex': m.get('sex'),
        'relation': m.get('relation'),
        'bp': m.get('bp'),
        'bmi': m.get('bmi'),
        'hba1c': m.get('hba1c'),
        'glucose': m.get('glucose'),
        'cholesterol': m.get('cholesterol'),
        'creatinine': m.get('creatinine'),
        'smoking': m.get('smoking'),
        'conditions': m.get('conditions'),
        'familyHistory': m.get('familyHistory'),
        'medications': m.get('medications'),
        'riskScores': scores_summary or None,
        'overallRisk': m.get('level'),
        'summary': m.get('reportSummary') or (
            str(m.get('summary') or '').replace('<strong>', '').replace('</strong>', '')[:200] or None
        ),
        'findings': m.get('findings'),
        'lifestyle': m.get('lifestyle'),
        'checkups': checkups or None,
        'recommendations': recommendations or None,
        'warnings': warnings or None,
        'keyFactors': factors or None,
    }


def chat_reply(message, members_data, history=None):
    """Call Groq API (llama-3.1-8b-instant) for intelligent family health chat assistant."""
    api_key = _get_api_key()
    if not api_key:
        _log_interaction('VivRose AI Chat', [], None, 401, 0, 'GROQ_API_KEY missing')
        return None

    # Compress member data — strip UI-only noise to stay within the 6000 TPM free-tier limit
    if members_data:
        compressed = [_compress_member_for_chat(m) for m in members_data]
        # Remove None-valued keys to further trim tokens
        compressed = [{k: v for k, v in c.items() if v is not None} for c in compressed]
        members_summary = json.dumps(compressed, indent=2)
    else:
        members_summary = "No family members added yet."

    system_prompt = (
        "You are VivRose AI, an empathetic and knowledgeable family health assistant. "
        "Help users understand their family members' health, risk scores, vitals, symptoms, and get evidence-based medical advice.\n\n"
        "### FAMILY HEALTH CONTEXT:\n"
        f"{members_summary}\n\n"
        "### RULES:\n"
        "1. Be empathetic, clear, and professional.\n"
        "2. Use the family health context above to give accurate, personalised answers.\n"
        "3. For any medical advice or health guidance, always end with: "
        "*Note: It is always better to consult a real doctor or qualified healthcare professional.*"
    )

    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }

    messages = [{'role': 'system', 'content': system_prompt}]

    if history and isinstance(history, list):
        for item in history[-4:]:  # reduced from 6 to 4 to save tokens
            role = item.get('role')
            content = item.get('text') or item.get('content') or ''
            if role in ('user', 'assistant') and content:
                messages.append({'role': role, 'content': content[:400]})  # cap history messages

    messages.append({'role': 'user', 'content': message})

    payload = {
        'model': MODEL_NAME,
        'messages': messages,
        'temperature': 0.4,
        'max_tokens': 600,
    }

    start_t = time.time()
    try:
        resp = requests.post(GROQ_URL, headers=headers, json=payload, timeout=15)
        dur = (time.time() - start_t) * 1000
        if resp.status_code == 200:
            content = resp.json()['choices'][0]['message']['content'].strip()
            _log_interaction('VivRose AI Chat', messages, content, 200, dur)
            return content
        else:
            err_msg = f"Groq LLM Chat HTTP {resp.status_code}: {resp.text[:200]}"
            _log_interaction('VivRose AI Chat', messages, None, resp.status_code, dur, error=err_msg)
    except Exception as exc:
        dur = (time.time() - start_t) * 1000
        _log_interaction('VivRose AI Chat', messages, None, 500, dur, error=str(exc))

    return None


