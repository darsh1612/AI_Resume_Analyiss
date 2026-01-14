import json
import re
from llm import generate_json, generate_text

SYSTEM_PROMPT = """
You are a strict but fair technical interviewer.
Return only valid JSON. No markdown.
"""

def generate_expected_answer(question):
    return generate_text(
        "You are an expert software engineer.",
        f"Provide a high-quality ideal answer for this interview question:\n{question}"
    )

def evaluate_answer(question, expected_answer, student_answer):
    USER_PROMPT = f"""
Question:
{question}

Ideal Answer:
{expected_answer}

Student Answer:
{student_answer}

Evaluate the student. Return JSON with:
correctness, depth, clarity, feedback
"""

    raw = generate_json(SYSTEM_PROMPT, USER_PROMPT)

    # 🔥 Remove ```json fences if any
    clean = re.sub(r"```json|```", "", raw).strip()

    return json.loads(clean)
