"""Deterministic, explainable risk scoring engine.

Same input always produces the same output. Thresholds:
low < 30, moderate 30-60, high > 60.
"""

COLORS = {'low': '#2E9E6A', 'moderate': '#D49A2A', 'high': '#C43C3C'}
GRADIENTS = {
    'low': 'linear-gradient(90deg, #2E9E6A, #4FBF88)',
    'moderate': 'linear-gradient(90deg, #D49A2A, #E4B24F)',
    'high': 'linear-gradient(90deg, #C43C3C, #E06060)',
}


def _number(value, default=0.0):
    try:
        return float(str(value or '').strip().split()[0])
    except (ValueError, IndexError, TypeError):
        return default


def _level(score):
    return 'low' if score < 30 else 'moderate' if score <= 60 else 'high'


def _clamp(score):
    return max(5, min(95, round(score)))


def _points(score, trend):
    peaks = {'up': [2, 10, 10, 9, 18, 11, 26, 12, 34, 13, 38, 13],
             'down': [2, 12, 10, 11, 18, 10, 26, 9, 34, 8, 38, 7],
             'flat': [2, 10, 10, 9, 18, 9, 26, 9, 34, 9, 38, 9]}
    scale = 0.6 + (score / 100.0) * 0.8
    raw = peaks.get(trend, peaks['flat'])
    return ' '.join(f"{raw[i]},{round(raw[i + 1] * scale, 1)}" for i in range(0, len(raw), 2))


def compute(inputs):
    age = int(_number(inputs.get('age'), 40))
    bmi = _number(inputs.get('bmi'), 24)
    hba1c = _number(inputs.get('hba1c'))
    glucose = _number(inputs.get('glucose'), 90)
    bp = _number(inputs.get('bp'), 120)
    chol = _number(inputs.get('cholesterol'), 180)
    smoking = 'smok' in str(inputs.get('smoking', '')).lower() or 'yes' in str(inputs.get('smoking', '')).lower()
    family = str(inputs.get('familyHistory', ''))
    overweight = bmi > 25

    diabetes = 15 + (hba1c - 5.4) * 12 + (glucose - 90) * 0.25 + (bmi - 23) * 2 + ('Diabet' in family) * 8
    hypertension = 12 + (bp - 120) * 0.6 + (bmi - 23) * 1.5 + smoking * 6 + ('Hyper' in family) * 6
    cvd = 10 + (chol - 180) * 0.15 + (bp - 120) * 0.3 + (bmi - 23) * 1.2 + smoking * 8 + ('Heart' in family) * 5
    stroke = 8 + (bp - 120) * 0.4 + smoking * 5 + ('Stroke' in family) * 6

    scores = []
    for label, score, trend, trend_label in [
        ('Diabetes', diabetes, 'up' if diabetes > 40 else 'flat', 'Rising' if diabetes > 40 else 'Stable'),
        ('Hypertension', hypertension, 'up' if hypertension > 35 else 'flat', 'Rising' if hypertension > 35 else 'Stable'),
        ('CVD', cvd, 'flat', 'Stable'),
        ('Stroke', stroke, 'flat', 'Stable'),
    ]:
        score = _clamp(score)
        level = _level(score)
        scores.append({
            'label': label,
            'score': score,
            'level': level,
            'trend': trend,
            'trendLabel': trend_label,
            'points': _points(score, trend),
            'color': COLORS[level],
        })

    factors = []
    if overweight:
        factors.append({'name': 'Excess Weight', 'value': f"BMI {bmi} — above healthy range",
                        'width': min(90, int((bmi - 23) * 8)), 'gradient': GRADIENTS['high' if bmi > 28 else 'moderate'],
                        'impact': 'high' if bmi > 28 else 'moderate', 'impactLabel': 'High' if bmi > 28 else 'Moderate'})
    if smoking:
        factors.append({'name': 'Smoking', 'value': 'Current smoker',
                        'width': 70, 'gradient': GRADIENTS['high'], 'impact': 'high', 'impactLabel': 'High'})
    if hba1c > 5.7:
        factors.append({'name': 'Blood Sugar', 'value': f"HbA1c {hba1c}%",
                        'width': min(90, int((hba1c - 5.4) * 25)), 'gradient': GRADIENTS['moderate'],
                        'impact': 'moderate', 'impactLabel': 'Moderate'})
    if bp > 130:
        factors.append({'name': 'Blood Pressure', 'value': f"BP {bp} mmHg",
                        'width': min(90, int((bp - 120) * 2)), 'gradient': GRADIENTS['moderate'],
                        'impact': 'moderate', 'impactLabel': 'Moderate'})
    if family and family.lower() != 'none':
        factors.append({'name': 'Family History', 'value': family,
                        'width': 55, 'gradient': GRADIENTS['moderate'], 'impact': 'moderate', 'impactLabel': 'Moderate'})
    if not factors:
        factors.append({'name': 'Healthy Baseline', 'value': 'No major risk factors detected',
                        'width': 25, 'gradient': GRADIENTS['low'], 'impact': 'low', 'impactLabel': 'Low'})

    top = max(scores, key=lambda s: s['score'])
    level = top['level']

    checkups = [
        {'icon': 'droplet', 'name': 'HbA1c + Fasting Glucose', 'rationale': 'Baseline sugar check to confirm current status.'},
        {'icon': 'heart', 'name': 'Lipid Profile', 'rationale': 'Cholesterol panel for heart risk.'},
        {'icon': 'stethoscope', 'name': 'Blood Pressure Review', 'rationale': 'Home + clinic readings over 2 weeks.'},
    ]
    warnings = []
    if level == 'high':
        warnings.append({'level': 'high', 'icon': 'alert', 'title': f'{top["label"]} risk is high',
                         'desc': f'A score of {top["score"]}/100 needs a doctor review soon.'})
    if overweight:
        warnings.append({'level': 'moderate', 'icon': 'bolt', 'title': 'Overweight',
                         'desc': 'Weight is a top contributor — even 5% loss lowers risk.'})
    if smoking:
        warnings.append({'level': 'high', 'icon': 'smoke', 'title': 'Smoking', 'desc': 'Quitting is the single biggest risk reduction.'})

    recommendations = []
    if level == 'high':
        recommendations.append({'icon': 'stethoscope', 'specialty': 'General Physician',
                                'reason': 'High overall risk — full evaluation', 'priority': 'high',
                                'priorityClass': 'high', 'timeline': 'Book within 2 weeks'})

    summary = (f'<strong>{inputs.get("name", "This member")}</strong> shows <strong>{level}</strong> overall risk. '
               f'The main watch-point is <strong>{top["label"].lower()}</strong> '
               f'with a score of {top["score"]}/100. '
               'Small, consistent lifestyle changes will lower risk most effectively.')
    findings = [f'BMI {bmi} — {"above healthy range" if overweight else "within healthy range"}',
                f'Blood pressure {bp} mmHg',
                f'Blood sugar HbA1c {hba1c}%',
                f'Smoking: {"current smoker" if smoking else "non-smoker"}']
    checkup_list = [f'{c["name"]} — {c["rationale"]}' for c in checkups]
    recommendation_list = [f'{r["specialty"]} — {r["reason"]}' for r in recommendations]
    lifestyle = [
        'Walk 10 minutes after meals',
        'Aim for 150 minutes of moderate activity per week',
        'Keep consistent meal times',
        'Sleep 7-8 hours a night',
    ]

    return {
        'scores': scores,
        'factors': factors,
        'checkups': checkups,
        'warnings': warnings,
        'recommendations': recommendations,
        'summary': summary,
        'reportSummary': summary.replace('<strong>', '').replace('</strong>', ''),
        'findings': findings,
        'checkupList': checkup_list,
        'recommendationList': recommendation_list,
        'lifestyle': lifestyle,
        'level': level,
        'risk': top['label'],
        'status': 'High risk — review needed' if level == 'high' else 'Keep monitoring',
    }
