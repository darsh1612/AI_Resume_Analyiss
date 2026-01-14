import os
import uuid
import pdfplumber
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from resume_parser import parse_resume



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "../uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)



def clean_text(text: str):
    """
    Light cleaning for PDF noise.
    Do NOT aggressively preprocess – LLM handles semantics.
    """
    text = text.replace("\x00", "")
    text = text.replace("\n\n", "\n")
    text = text.replace("  ", " ")
    return text.strip()

def extract_text_from_pdf(path):
    text = ""
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return clean_text(text)



@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF resumes allowed")

    file_id = f"{uuid.uuid4()}.pdf"
    file_path = os.path.join(UPLOAD_DIR, file_id)

    # Save uploaded file
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # Extract text
    resume_text = extract_text_from_pdf(file_path)

    if len(resume_text) < 100:
        raise HTTPException(status_code=400, detail="Could not extract meaningful text from PDF")

    # Send to Groq via resume_parser
    profile_json = parse_resume(resume_text)

    return {
        "status": "success",
        "profile": profile_json
    }

from interview_engine import InterviewEngine
from db import save_resume, create_interview, save_question, save_answer

# In-memory active interviews (for MVP)
active_interviews = {}


@app.post("/start-interview")
async def start_interview(profile: dict):
    # Save resume to DB
    resume_id = save_resume(profile)

    # Create interview
    interview_id = create_interview(resume_id)

    # Start interview engine
    engine = InterviewEngine(profile)
    active_interviews[interview_id] = engine

    # Save all questions
    for q in engine.questions:
        qid = save_question(interview_id, q["question"])
        engine.db_question_ids.append(qid)

    # Return first question
    first = engine.get_next_question()

    return {
        "interview_id": interview_id,
        "question": first
    }


from pydantic import BaseModel

class AnswerRequest(BaseModel):
    interview_id: str
    question_id: int
    answer: str


@app.post("/submit-answer")
async def submit_answer(request: AnswerRequest):
    engine = active_interviews.get(request.interview_id)

    if not engine:
        raise HTTPException(status_code=404, detail="Invalid interview id")

    # Grade answer
    score = engine.submit_answer(request.question_id, request.answer)

    real_qid = engine.db_question_ids[request.question_id]

    save_answer(
        question_id=real_qid,
        student_answer=request.answer,
        score=score
    )

    # Next question or finish
    if engine.is_complete():
        return {
            "status": "completed",
            "results": engine.get_summary_data()
        }
    else:
        return {
            "status": "next",
            "question": engine.get_next_question(),
            "last_score": score
        }
