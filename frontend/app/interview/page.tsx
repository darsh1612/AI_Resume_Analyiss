'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Editor from '@monaco-editor/react'
import { InterviewQuestion, SubmitAnswerResponse } from '@/types'

function InterviewContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const interviewId = searchParams.get('interview_id')
    const supabase = createClient()

    const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null)
    const [answer, setAnswer] = useState('')
    const [questionNumber, setQuestionNumber] = useState(1)
    const [totalQuestions] = useState(5)
    const [loading, setLoading] = useState(false)
    const [showHint, setShowHint] = useState(false)
    const [feedback, setFeedback] = useState<any>(null)
    const [showFeedback, setShowFeedback] = useState(false)

    useEffect(() => {
        if (!interviewId) {
            router.push('/dashboard')
            return
        }
        loadCurrentQuestion()
    }, [interviewId])

    const loadCurrentQuestion = async () => {
        // For the first question, it's already stored when starting the interview
        // For subsequent questions, they'll be added by submit-answer API
        try {
            const { data, error } = await supabase
                .from('questions')
                .select('*')
                .eq('interview_id', interviewId)
                .order('created_at', { ascending: true })

            if (error) throw error

            console.log('Loaded questions:', data?.length, data)

            if (data && data.length > 0) {
                // Get the latest question
                const latestQuestion = data[data.length - 1]
                const questionIndex = data.length - 1 // 0-indexed

                console.log('Setting question with index:', questionIndex)

                setCurrentQuestion({
                    question_id: questionIndex,
                    question: latestQuestion.question_text,
                    type: latestQuestion.question_type as 'conceptual' | 'coding',
                    hint: latestQuestion.hint,
                })
                setQuestionNumber(data.length) // 1-indexed for display
            }
        } catch (err) {
            console.error('Error loading question:', err)
        }
    }

    const handleSubmitAnswer = async () => {
        if (!answer.trim() || !currentQuestion) return

        setLoading(true)
        setShowFeedback(false)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            console.log('Submitting answer with:', {
                interview_id: interviewId,
                question_id: currentQuestion.question_id,
                answer_length: answer.length
            })

            // Submit to backend
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/submit-answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    interview_id: interviewId,
                    question_id: currentQuestion.question_id,
                    answer: answer,
                }),
            })

            if (!res.ok) {
                const errorText = await res.text()
                console.error('Backend error:', res.status, errorText)
                throw new Error(`Failed to submit answer: ${res.status} - ${errorText}`)
            }

            const data: SubmitAnswerResponse = await res.json()

            // Save answer to database
            const { data: questionData } = await supabase
                .from('questions')
                .select('id')
                .eq('interview_id', interviewId)
                .eq('question_text', currentQuestion.question)
                .single()

            if (data.last_score) {
                await supabase.from('answers').insert({
                    question_id: questionData?.id,
                    user_id: user?.id,
                    answer_text: answer,
                    correctness: data.last_score.correctness,
                    depth: data.last_score.depth,
                    clarity: data.last_score.clarity,
                    feedback: data.last_score.feedback,
                })

                // Show feedback
                setFeedback(data.last_score)
                setShowFeedback(true)

                // Auto-advance after 5 seconds
                setTimeout(() => {
                    if (data.status === 'completed') {
                        handleInterviewComplete(data.results!)
                    } else if (data.question) {
                        loadNextQuestion(data.question)
                    }
                }, 5000)
            } else if (data.status === 'completed') {
                handleInterviewComplete(data.results!)
            }
        } catch (err: any) {
            console.error('Submit error:', err)
            alert(err.message || 'Failed to submit answer')
        } finally {
            setLoading(false)
        }
    }

    const loadNextQuestion = async (question: InterviewQuestion) => {
        const { data: { user } } = await supabase.auth.getUser()

        // Save new question to database
        await supabase.from('questions').insert({
            interview_id: interviewId,
            user_id: user?.id,
            question_text: question.question,
            question_type: question.type,
            hint: question.hint,
        })

        // Reload from database to get correct index
        await loadCurrentQuestion()
        setAnswer('')
        setShowHint(false)
        setShowFeedback(false)
    }

    const handleInterviewComplete = async (results: any) => {
        // Update interview status
        await supabase
            .from('interviews')
            .update({
                status: 'completed',
                average_score: results.average_score,
                strengths: results.strengths,
                weak_areas: results.weak_areas,
                completed_at: new Date().toISOString(),
            })
            .eq('id', interviewId)

        router.push(`/report/${interviewId}`)
    }

    if (!currentQuestion) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl">Loading question...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-5xl mx-auto">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-medium">
                            Question {questionNumber} of {totalQuestions}
                        </h2>
                        <span className="text-sm text-gray-400">
                            {Math.round((questionNumber / totalQuestions) * 100)}%
                        </span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Question Card */}
                <div className="card mb-6">
                    <div className="flex items-start justify-between mb-4">
                        <h1 className="text-2xl font-bold flex-1">{currentQuestion.question}</h1>
                        <span className={`px-3 py-1 rounded-full text-sm ${currentQuestion.type === 'coding'
                            ? 'bg-purple-500/20 text-purple-500'
                            : 'bg-blue-500/20 text-blue-500'
                            }`}>
                            {currentQuestion.type}
                        </span>
                    </div>

                    {currentQuestion.hint && (
                        <div className="mt-4">
                            <button
                                onClick={() => setShowHint(!showHint)}
                                className="text-sm text-blue-500 hover:text-blue-400"
                            >
                                {showHint ? '🔒 Hide Hint' : '💡 Show Hint'}
                            </button>
                            {showHint && (
                                <div className="mt-2 p-4 bg-blue-500/10 border border-blue-500 rounded-lg">
                                    <p className="text-sm">{currentQuestion.hint}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Answer Input */}
                <div className="card mb-6">
                    <h3 className="text-lg font-medium mb-4">Your Answer</h3>

                    {currentQuestion.type === 'conceptual' ? (
                        <textarea
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Type your answer here..."
                            rows={10}
                            disabled={loading}
                            className="font-mono"
                        />
                    ) : (
                        <div className="border border-gray-700 rounded-lg overflow-hidden">
                            <Editor
                                height="400px"
                                defaultLanguage="python"
                                value={answer}
                                onChange={(value) => setAnswer(value || '')}
                                theme="vs-dark"
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    lineNumbers: 'on',
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Feedback Display */}
                {showFeedback && feedback && (
                    <div className="card mb-6 bg-green-500/10 border-green-500 animate-fadeIn">
                        <h3 className="text-lg font-bold mb-4 text-green-500">Answer Submitted!</h3>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                                <p className="text-sm text-gray-400">Correctness</p>
                                <p className="text-2xl font-bold">{feedback.correctness}%</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Depth</p>
                                <p className="text-2xl font-bold">{feedback.depth}%</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Clarity</p>
                                <p className="text-2xl font-bold">{feedback.clarity}%</p>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-800 rounded-lg">
                            <p className="text-sm font-medium mb-2">Feedback:</p>
                            <p className="text-sm text-gray-300">{feedback.feedback}</p>
                        </div>
                        <p className="text-sm text-gray-400 mt-4 text-center">
                            Loading next question...
                        </p>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    onClick={handleSubmitAnswer}
                    disabled={loading || !answer.trim() || showFeedback}
                    className="btn btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Submitting...' : 'Submit Answer'}
                </button>
            </div>
        </div>
    )
}

export default function InterviewPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
            <InterviewContent />
        </Suspense>
    )
}
