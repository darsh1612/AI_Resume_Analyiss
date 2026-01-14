import os
import requests
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "llama-3.3-70b-versatile"



def _call_groq(messages, temperature=0.2):
    """
    Low-level Groq call. Every AI action in this project goes through this.
    """
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL,
        "messages": messages,
        "temperature": temperature
    }

    response = requests.post(GROQ_URL, headers=headers, json=payload)

    if response.status_code != 200:
        raise Exception(f"Groq API error: {response.text}")

    return response.json()["choices"][0]["message"]["content"]


# -------- High-level AI functions used by the system -------- #

def generate_json(system_prompt, user_prompt):
    """
    Used when we expect structured JSON output.
    (resume parsing, questions, scoring, etc.)
    """
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]

    return _call_groq(messages, temperature=0.1)


def generate_text(system_prompt, user_prompt):
    """
    Used when we want natural language output
    (hints, summaries, feedback, etc.)
    """
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ]

    return _call_groq(messages, temperature=0.5)
