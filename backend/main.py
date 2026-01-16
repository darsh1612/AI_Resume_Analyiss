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

from interview_agent import InterviewAgent, InterviewState
from db import save_resume, create_interview, save_question, save_answer

# In-memory active interviews with LangGraph state
active_interviews = {}
active_states = {}  # Store LangGraph state for each interview


@app.post("/start-interview")
async def start_interview(profile: dict):
    """Initialize LangGraph-based interview with state management"""
    # Save resume to DB
    resume_id = save_resume(profile)

    # Create interview
    interview_id = create_interview(resume_id)

    # Initialize LangGraph agent
    agent = InterviewAgent(profile)
    result = agent.start_interview()
    
    # Store agent and initial state
    active_interviews[interview_id] = agent
    active_states[interview_id] = {
        "interview_id": interview_id,
        "profile": profile,
        "questions": result['questions'],
        "current_question_idx": 0,
        "answers": [],
        "scores": [],
        "stage": "generate_questions",
        "next_question": result['first_question'],
        "evaluation_result": None
    }

    # Save all questions to DB
    for q in result['questions']:
        save_question(interview_id, q["question"])

    # Return first question
    return {
        "interview_id": interview_id,
        "question": result['first_question']
    }


from pydantic import BaseModel

class AnswerRequest(BaseModel):
    interview_id: str
    question_id: int
    answer: str


@app.post("/submit-answer")
async def submit_answer(request: AnswerRequest):
    """Process answer through LangGraph evaluation node"""
    agent = active_interviews.get(request.interview_id)
    state = active_states.get(request.interview_id)

    if not agent or not state:
        raise HTTPException(status_code=404, detail="Invalid interview id")

    # Run answer through LangGraph agent
    result = agent.submit_answer(state, request.answer)
    
    # Update stored state
    active_states[request.interview_id] = state

    # Save to database
    save_answer(
        question_id=request.interview_id,  # Simplified for MVP
        student_answer=request.answer,
        score=result['evaluation']
    )

    # Check if interview complete
    if result['status'] == 'completed':
        summary = agent.get_summary(state)
        return {
            "status": "completed",
            "results": summary,
            "last_score": result['evaluation']
        }
    else:
        return {
            "status": "next",
            "question": result['next_question'],
            "last_score": result['evaluation']
        }

