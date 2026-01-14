import json
import re
from llm import generate_json

SYSTEM_PROMPT = """
You are an expert technical recruiter and resume analyst.
Return only valid JSON. Do not include ``` or explanations.
"""

def parse_resume(resume_text):
    USER_PROMPT = f"""
Extract the following resume into structured JSON with:
name, skills, projects (name, tech, description), experience.

Resume:
{resume_text}
"""

    result = generate_json(SYSTEM_PROMPT, USER_PROMPT)

    # clean any accidental markdown
    clean = re.sub(r"```json|```", "", result).strip()
    return json.loads(clean)
