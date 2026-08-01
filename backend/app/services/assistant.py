from . import groq_service


def _top_score(member):
    scores = member.get('scores') or []
    if not scores:
        return 0
    return max(int(s.get('score', 0)) for s in scores)


def _score_for(member, label):
    for s in (member.get('scores') or []):
        if label.lower() in s.get('label', '').lower():
            return int(s.get('score', 0))
    return None


def _by_name(members):
    result = {}
    for m in members:
        result[m.get('name', '').lower()] = m
        result[m.get('id', '').lower()] = m
    return result


def _rule_reply(message, members):
    msg = message.lower()
    if not members:
        return ("I don't have any family members to review yet. "
                "Add a family member first, then ask me about their health.")

    named = _by_name(members)
    for name, member in named.items():
        if name and len(name) > 1 and name in msg:
            top = member.get('risk') or 'Low overall'
            score = _top_score(member)
            return (f"{member.get('name')} — current overall risk is {top.lower()} "
                    f"(top score {score}/100). Status: {member.get('status') or '—'}. "
                    f"{member.get('reportSummary') or member.get('summary') or ''}")

    if 'highest risk' in msg or 'riskiest' in msg or 'worst' in msg:
        worst = max(members, key=_top_score)
        return (f"{worst.get('name')} has the highest risk in your family right now — "
                f"{_top_score(worst)}/100 on {worst.get('risk') or 'their top condition'}. "
                f"Status: {worst.get('status') or 'keep monitoring'}.")

    if 'healthiest' in msg or 'best' in msg or 'lowest' in msg:
        best = min(members, key=_top_score)
        return (f"{best.get('name')} is currently the healthiest family member — "
                f"top risk score is just {_top_score(best)}/100. "
                f"Keep up the good habits!")

    if 'diabet' in msg:
        lines = [f"{m.get('name')}: {_score_for(m, 'Diabetes') or 'n/a'}/100" for m in members]
        return "Diabetes risk across the family:\n" + '\n'.join(lines)

    if 'blood pressure' in msg or 'bp' in msg:
        lines = [f"{m.get('name')}: {m.get('bp') or 'n/a'}" for m in members]
        return "Latest blood pressure readings:\n" + '\n'.join(lines)

    if 'sugar' in msg or 'hba1c' in msg:
        lines = [f"{m.get('name')}: {m.get('hba1c') or 'n/a'}" for m in members]
        return "Latest blood sugar (HbA1c):\n" + '\n'.join(lines)

    if 'smoke' in msg:
        lines = [f"{m.get('name')}: {m.get('smoking') or 'n/a'}" for m in members]
        return "Smoking status:\n" + '\n'.join(lines)

    if 'how many' in msg or 'count' in msg:
        return f"You have {len(members)} family member(s) on record."

    total = sum(_top_score(m) for m in members)
    average = total // len(members)
    return (f"Across your family of {len(members)}, the average top risk score is {average}/100. "
            "I can tell you about diabetes, blood pressure, smoking, or who needs attention most — just ask.")


def reply(message, members):
    """Answer user query using Groq API (llama-3.1-8b-instant), fallback to rule-based engine."""
    ai_answer = groq_service.chat_reply(message, members)
    if ai_answer:
        return ai_answer
    return _rule_reply(message, members)
