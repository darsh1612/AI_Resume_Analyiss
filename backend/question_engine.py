from llm import generate_json
import json
import re

SYSTEM_PROMPT = """
You are a senior software engineer conducting a technical interview.
Return ONLY valid JSON. No markdown, no ``` fences.
"""

def generate_questions(profile_json):
    USER_PROMPT = f"""
Based on this candidate profile, generate:
- 3 conceptual questions
- 2 coding questions with hints

Return JSON in this exact format:
[
  {{
    "type": "conceptual",
    "question": "..."
  }},
  {{
    "type": "coding",
    "question": "...",
    "hint": "..."
  }}
]

Candidate Profile:
{profile_json}
"""

    raw = generate_json(SYSTEM_PROMPT, USER_PROMPT)

    # Remove markdown if Groq adds it
    clean = re.sub(r"```json|```", "", raw).strip()

    return json.loads(clean)
