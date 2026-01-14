import sqlite3
import uuid
from datetime import datetime

# Simple SQLite DB for backend tracking
# Note: Frontend uses Supabase for user data

DB_PATH = "interviews.db"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize SQLite database"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS resumes (
            id TEXT PRIMARY KEY,
            profile TEXT,
            created_at TEXT
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS interviews (
            id TEXT PRIMARY KEY,
            resume_id TEXT,
            created_at TEXT,
            FOREIGN KEY (resume_id) REFERENCES resumes(id)
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS questions (
            id TEXT PRIMARY KEY,
            interview_id TEXT,
            question TEXT,
            created_at TEXT,
            FOREIGN KEY (interview_id) REFERENCES interviews(id)
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS answers (
            id TEXT PRIMARY KEY,
            question_id TEXT,
            student_answer TEXT,
            correctness REAL,
            depth REAL,
            clarity REAL,
            feedback TEXT,
            created_at TEXT,
            FOREIGN KEY (question_id) REFERENCES questions(id)
        )
    """)
    
    conn.commit()
    conn.close()

# Initialize DB on import
init_db()

def save_resume(profile_json):
    """Save resume profile"""
    conn = get_db()
    cursor = conn.cursor()
    
    resume_id = str(uuid.uuid4())
    cursor.execute(
        "INSERT INTO resumes (id, profile, created_at) VALUES (?, ?, ?)",
        (resume_id, str(profile_json), datetime.now().isoformat())
    )
    
    conn.commit()
    conn.close()
    return resume_id

def create_interview(resume_id):
    """Create new interview session"""
    conn = get_db()
    cursor = conn.cursor()
    
    interview_id = str(uuid.uuid4())
    cursor.execute(
        "INSERT INTO interviews (id, resume_id, created_at) VALUES (?, ?, ?)",
        (interview_id, resume_id, datetime.now().isoformat())
    )
    
    conn.commit()
    conn.close()
    return interview_id

def save_question(interview_id, question_text):
    """Save interview question"""
    conn = get_db()
    cursor = conn.cursor()
    
    question_id = str(uuid.uuid4())
    cursor.execute(
        "INSERT INTO questions (id, interview_id, question, created_at) VALUES (?, ?, ?, ?)",
        (question_id, interview_id, question_text, datetime.now().isoformat())
    )
    
    conn.commit()
    conn.close()
    return question_id

def save_answer(question_id, student_answer, score):
    """Save student answer with scores"""
    conn = get_db()
    cursor = conn.cursor()
    
    answer_id = str(uuid.uuid4())
    cursor.execute(
        """INSERT INTO answers 
           (id, question_id, student_answer, correctness, depth, clarity, feedback, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            answer_id,
            question_id,
            student_answer,
            score.get("correctness", 0),
            score.get("depth", 0),
            score.get("clarity", 0),
            score.get("feedback", ""),
            datetime.now().isoformat()
        )
    )
    
    conn.commit()
    conn.close()
    return answer_id

