export interface Resume {
    id: string
    user_id: string
    profile_data: {
        name?: string
        email?: string
        skills?: string[]
        experience?: any[]
        education?: any[]
    }
    created_at: string
}

export interface Interview {
    id: string
    user_id: string
    resume_id: string
    status: 'in_progress' | 'completed'
    average_score?: number
    strengths?: string[]
    weak_areas?: string[]
    created_at: string
    completed_at?: string
}

export interface Question {
    id: string
    interview_id: string
    user_id: string
    question_text: string
    question_type: 'conceptual' | 'coding'
    hint?: string
    created_at: string
}

export interface Answer {
    id: string
    question_id: string
    user_id: string
    answer_text: string
    correctness?: number
    depth?: number
    clarity?: number
    feedback?: string
    created_at: string
}

export interface InterviewQuestion {
    question_id: number
    question: string
    type: 'conceptual' | 'coding'
    hint?: string
}

export interface SubmitAnswerResponse {
    status: 'next' | 'completed'
    question?: InterviewQuestion
    last_score?: {
        correctness: number
        depth: number
        clarity: number
        feedback: string
    }
    results?: {
        average_score: number
        strengths: string[]
        weak_areas: string[]
    }
}
