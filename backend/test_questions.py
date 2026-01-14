from question_engine import generate_questions
import json

profile = {
    "name": "Darsh Gupta",
    "skills": ["Python", "FastAPI", "NLP", "SQL", "Word2Vec"],
    "projects": [
        {"name": "AI Movie Review Analyzer", "tech": ["Word2Vec", "Scikit-learn"]},
        {"name": "MIDAS", "tech": ["Whisper", "NLP"]}
    ]
}

questions = generate_questions(json.dumps(profile))
print(questions)
