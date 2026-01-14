import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PrintButton from './PrintButton'

interface ReportPageProps {
    params: Promise<{ id: string }>
}

export default async function ReportPage({ params }: ReportPageProps) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch interview
    const { data: interview, error: interviewError } = await supabase
        .from('interviews')
        .select('*')
        .eq('id', id)
        .single()

    if (interviewError || !interview) {
        notFound()
    }

    // Fetch questions with answers
    const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select(`
      *,
      answers (*)
    `)
        .eq('interview_id', id)
        .order('created_at', { ascending: true })

    const questionsWithAnswers = questions || []

    // Calculate scores
    const scores = questionsWithAnswers.map((q: any) => {
        const answer = q.answers[0]
        return answer
            ? {
                correctness: answer.correctness || 0,
                depth: answer.depth || 0,
                clarity: answer.clarity || 0,
            }
            : null
    }).filter(Boolean)

    const avgCorrectness = scores.length > 0
        ? scores.reduce((sum: number, s: any) => sum + s.correctness, 0) / scores.length
        : 0

    const avgDepth = scores.length > 0
        ? scores.reduce((sum: number, s: any) => sum + s.depth, 0) / scores.length
        : 0

    const avgClarity = scores.length > 0
        ? scores.reduce((sum: number, s: any) => sum + s.clarity, 0) / scores.length
        : 0

    const overallScore = interview.average_score || Math.round((avgCorrectness + avgDepth + avgClarity) / 3)

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/dashboard" className="text-blue-500 hover:text-blue-400 mb-4 inline-block">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-4xl font-bold mb-2">Interview Report</h1>
                    <p className="text-gray-400">
                        Completed on {new Date(interview.completed_at || interview.created_at).toLocaleDateString()}
                    </p>
                </div>

                {/* Overall Score */}
                <div className="card mb-8 text-center">
                    <h2 className="text-xl font-medium mb-4 text-gray-400">Overall Score</h2>
                    <div className="text-7xl font-bold mb-2" style={{
                        background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        {overallScore}%
                    </div>
                    <p className="text-lg text-gray-400">
                        {overallScore >= 80 ? 'Excellent!' : overallScore >= 60 ? 'Good Job!' : 'Keep Practicing!'}
                    </p>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card text-center">
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Correctness</h3>
                        <p className="text-4xl font-bold text-green-500">{Math.round(avgCorrectness)}%</p>
                    </div>
                    <div className="card text-center">
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Depth</h3>
                        <p className="text-4xl font-bold text-blue-500">{Math.round(avgDepth)}%</p>
                    </div>
                    <div className="card text-center">
                        <h3 className="text-sm font-medium text-gray-400 mb-2">Clarity</h3>
                        <p className="text-4xl font-bold text-purple-500">{Math.round(avgClarity)}%</p>
                    </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="card">
                        <h3 className="text-xl font-bold mb-4 text-green-500">✨ Strengths</h3>
                        {interview.strengths && interview.strengths.length > 0 ? (
                            <ul className="space-y-2">
                                {interview.strengths.map((strength: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="text-green-500 mt-1">✓</span>
                                        <span className="text-gray-300">{strength}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-400">Strong foundational knowledge</p>
                        )}
                    </div>

                    <div className="card">
                        <h3 className="text-xl font-bold mb-4 text-yellow-500">📈 Areas to Improve</h3>
                        {interview.weak_areas && interview.weak_areas.length > 0 ? (
                            <ul className="space-y-2">
                                {interview.weak_areas.map((weakness: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="text-yellow-500 mt-1">→</span>
                                        <span className="text-gray-300">{weakness}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-400">Focus on consistent practice</p>
                        )}
                    </div>
                </div>

                {/* Question-by-Question Breakdown */}
                <div className="card">
                    <h2 className="text-2xl font-bold mb-6">Question Breakdown</h2>

                    <div className="space-y-6">
                        {questionsWithAnswers.map((q: any, index: number) => {
                            const answer = q.answers[0]
                            return (
                                <div key={q.id} className="border border-gray-700 rounded-lg p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <h3 className="text-lg font-medium flex-1">
                                            {index + 1}. {q.question_text}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-sm ${q.question_type === 'coding'
                                            ? 'bg-purple-500/20 text-purple-500'
                                            : 'bg-blue-500/20 text-blue-500'
                                            }`}>
                                            {q.question_type}
                                        </span>
                                    </div>

                                    {answer ? (
                                        <>
                                            <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                                                <p className="text-sm font-medium text-gray-400 mb-2">Your Answer:</p>
                                                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                                                    {answer.answer_text}
                                                </pre>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4 mb-4">
                                                <div>
                                                    <p className="text-xs text-gray-400">Correctness</p>
                                                    <p className="text-lg font-bold">{answer.correctness}%</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400">Depth</p>
                                                    <p className="text-lg font-bold">{answer.depth}%</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400">Clarity</p>
                                                    <p className="text-lg font-bold">{answer.clarity}%</p>
                                                </div>
                                            </div>

                                            {answer.feedback && (
                                                <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
                                                    <p className="text-sm font-medium text-blue-400 mb-2">Feedback:</p>
                                                    <p className="text-sm text-gray-300">{answer.feedback}</p>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-gray-400 text-sm">No answer provided</p>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-8">
                    <Link href="/dashboard" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all flex-1 text-center">
                        Return to Dashboard
                    </Link>
                    <PrintButton />
                </div>
            </div>
        </div>
    )
}
