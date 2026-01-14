from question_engine import generate_questions
from evaluator import generate_expected_answer, evaluate_answer

import json
class InterviewEngine:
    def __init__(self, profile_json):
        self.profile = profile_json
        self.questions = generate_questions(profile_json)
        self.current_index = 0
        self.results = []

        self.expected_answers = []
        self.db_question_ids = []   

        for q in self.questions:
            self.expected_answers.append(generate_expected_answer(q["question"]))


    def get_next_question(self):
        if self.current_index >= len(self.questions):
            return None

        q = self.questions[self.current_index]

        return {
            "question_id": self.current_index,
            "type": q["type"],
            "question": q["question"],
            "hint": q.get("hint", None)
        }

    def submit_answer(self, question_id, student_answer):
        expected = self.expected_answers[question_id]
        question = self.questions[question_id]["question"]

        score = evaluate_answer(question, expected, student_answer)

        self.results.append({
            "question": question,
            "student_answer": student_answer,
            "expected_answer": expected,
            "score": score
        })

        self.current_index += 1

        return score

    def is_complete(self):
        return self.current_index >= len(self.questions)

    def get_summary_data(self):
        return self.results
