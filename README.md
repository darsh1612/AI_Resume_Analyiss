# AI Interviewer

A full-stack technical interview practice platform that uses artificial intelligence to generate personalized interview questions based on your resume. Built with Next.js, TypeScript, and FastAPI.

## Overview

AI Interviewer helps software engineers prepare for technical interviews by analyzing their resume and creating tailored questions that match their experience level and skills. The platform provides real-time feedback on answers, including metrics for correctness, depth, and clarity.

## Key Features

- **Resume Analysis**: Upload your resume (PDF) and get personalized questions
- **Dual Question Types**: Practice both conceptual and coding challenges
- **Code Editor**: Integrated Monaco editor with syntax highlighting
- **Real-time Evaluation**: Instant feedback on answer quality
- **Detailed Reports**: Comprehensive performance analytics with strengths and areas for improvement
- **Interview History**: Track progress across multiple practice sessions
- **Secure Authentication**: User accounts with private data storage

## Tech Stack

### Frontend
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Supabase (Authentication, Database, Storage)
- Monaco Editor

### Backend
- FastAPI (Python)
- Groq AI for resume parsing and evaluation
- SQLite for session management
- PDF processing with pdfplumber

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Python 3.8 or higher
- Supabase account (free tier works)
- Groq API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/ai-interviewer.git
cd ai-interviewer
```

2. Set up the database
```bash
# Create a Supabase project at supabase.com
# Run the SQL from table.sql in the SQL Editor
```

3. Configure environment variables

Frontend (.env.local):
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

Backend (.env):
```
GROQ_API_KEY=your_groq_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

4. Install dependencies and run

Frontend:
```bash
cd frontend
npm install
npm run dev
```

Backend:
```bash
cd backend
pip install -r requirement.txt
uvicorn main:app --reload
```

The application will be available at http://localhost:3000

## How It Works

1. **Sign Up**: Create an account to start practicing
2. **Upload Resume**: Submit your PDF resume for analysis
3. **Answer Questions**: Receive 5 personalized questions (mix of conceptual and coding)
4. **Get Feedback**: View detailed scores and improvement suggestions
5. **Track Progress**: Review past interviews and monitor improvement over time

## Project Structure

```
ai-interviewer/
├── frontend/                 # Next.js application
│   ├── app/
│   │   ├── dashboard/       # Main dashboard
│   │   ├── interview/       # Interview session page
│   │   ├── login/           # Authentication
│   │   ├── signup/          # User registration
│   │   └── report/          # Performance reports
│   ├── lib/                 # Utility functions
│   └── types/               # TypeScript definitions
├── backend/                 # FastAPI application
│   ├── main.py             # API routes
│   ├── resume_parser.py    # Resume parsing logic
│   ├── question_engine.py  # Question generation
│   ├── evaluator.py        # Answer evaluation
│   └── db.py               # Database operations
└── table.sql               # Database schema
```

## Database Schema

The application uses Supabase PostgreSQL with the following tables:

- **resumes**: Stores parsed resume data with user associations
- **interviews**: Tracks interview sessions and completion status
- **questions**: Contains interview questions with type and hints
- **answers**: Stores user responses with evaluation scores

All tables implement Row Level Security (RLS) to ensure data privacy.

## API Endpoints

### Backend API

- `POST /upload-resume` - Upload and parse resume PDF
- `POST /start-interview` - Initialize a new interview session
- `POST /submit-answer` - Submit answer and receive evaluation

## Security

- Authentication handled by Supabase Auth
- Row Level Security policies ensure users only access their own data
- API keys stored in environment variables
- CORS configured for frontend-backend communication

## Performance

- Server-side rendering with Next.js 14
- Optimized PDF processing
- Efficient database queries with proper indexing
- Real-time answer evaluation

## Contributing

Contributions are welcome. Please open an issue first to discuss proposed changes.

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Groq for AI capabilities
- Supabase for backend infrastructure
- Monaco Editor for code editing interface

## Support

For issues or questions, please open a GitHub issue.
