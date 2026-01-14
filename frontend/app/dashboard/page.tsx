'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Interview } from '@/types'

export default function DashboardPage() {
    const router = useRouter()
    const supabase = createClient()
    const [user, setUser] = useState<any>(null)
    const [interviews, setInterviews] = useState<Interview[]>([])
    const [loading, setLoading] = useState(true)
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState('')

    useEffect(() => {
        loadUser()
        loadInterviews()
    }, [])

    const loadUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
    }

    const loadInterviews = async () => {
        try {
            const { data, error } = await supabase
                .from('interviews')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setInterviews(data || [])
        } catch (err) {
            console.error('Error loading interviews:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setUploading(true)
        setUploadError('')

        const formData = new FormData(e.currentTarget)
        const file = formData.get('resume') as File

        if (!file) {
            setUploadError('Please select a file')
            setUploading(false)
            return
        }

        if (!file.name.endsWith('.pdf')) {
            setUploadError('Only PDF files are allowed')
            setUploading(false)
            return
        }

        try {
            // Send to backend for parsing (backend handles file storage)
            const backendFormData = new FormData()
            backendFormData.append('file', file)

            const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/upload-resume`, {
                method: 'POST',
                body: backendFormData,
            })

            if (!uploadRes.ok) throw new Error('Failed to parse resume')

            const { profile } = await uploadRes.json()

            // Save resume to database
            const { data: resumeData, error: resumeError } = await supabase
                .from('resumes')
                .insert({
                    user_id: user?.id,
                    profile_data: profile,
                })
                .select()
                .single()

            if (resumeError) throw resumeError

            // Start interview
            const interviewRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/start-interview`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile),
            })

            if (!interviewRes.ok) throw new Error('Failed to start interview')

            const { interview_id, question } = await interviewRes.json()

            // Save interview to database
            const { error: interviewError } = await supabase
                .from('interviews')
                .insert({
                    id: interview_id,
                    user_id: user?.id,
                    resume_id: resumeData.id,
                    status: 'in_progress',
                })

            if (interviewError) throw interviewError

            // Save first question
            const { error: questionError } = await supabase
                .from('questions')
                .insert({
                    interview_id,
                    user_id: user?.id,
                    question_text: question.question,
                    question_type: question.type,
                    hint: question.hint,
                })

            if (questionError) throw questionError

            // Redirect to interview
            router.push(`/interview?interview_id=${interview_id}`)
        } catch (err: any) {
            console.error('Upload error:', err)
            setUploadError(err.message || 'Failed to upload resume')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
                        <p className="text-gray-400">Welcome back, {user?.email}</p>
                    </div>
                    <button onClick={handleLogout} className="btn btn-secondary">
                        Logout
                    </button>
                </div>

                {/* Start Interview Button */}
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="btn btn-primary text-lg px-8 py-4 mb-12"
                >
                    🚀 Start New Interview
                </button>

                {/* Past Interviews */}
                <div className="card">
                    <h2 className="text-2xl font-bold mb-6">Past Interviews</h2>

                    {loading ? (
                        <p className="text-gray-400 text-center py-8">Loading...</p>
                    ) : interviews.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">
                            No interviews yet. Start your first one!
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-700">
                                        <th className="text-left py-3 px-4">Date</th>
                                        <th className="text-left py-3 px-4">Status</th>
                                        <th className="text-left py-3 px-4">Average Score</th>
                                        <th className="text-left py-3 px-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {interviews.map((interview) => (
                                        <tr key={interview.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                            <td className="py-3 px-4">
                                                {new Date(interview.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-3 py-1 rounded-full text-sm ${interview.status === 'completed'
                                                    ? 'bg-green-500/20 text-green-500'
                                                    : 'bg-yellow-500/20 text-yellow-500'
                                                    }`}>
                                                    {interview.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {interview.average_score ? `${interview.average_score}%` : '-'}
                                            </td>
                                            <td className="py-3 px-4">
                                                {interview.status === 'completed' ? (
                                                    <button
                                                        onClick={() => router.push(`/report/${interview.id}`)}
                                                        className="text-blue-500 hover:text-blue-400"
                                                    >
                                                        View Report →
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => router.push(`/interview?interview_id=${interview.id}`)}
                                                        className="text-blue-500 hover:text-blue-400"
                                                    >
                                                        Continue →
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="modal-backdrop" onClick={() => !uploading && setShowUploadModal(false)}>
                    <div className="modal p-8" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold mb-6">Upload Your Resume</h2>

                        <form onSubmit={handleFileUpload} className="space-y-4">
                            {uploadError && (
                                <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
                                    {uploadError}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Resume (PDF only)
                                </label>
                                <input
                                    type="file"
                                    name="resume"
                                    accept=".pdf"
                                    required
                                    disabled={uploading}
                                    className="w-full"
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="btn btn-primary flex-1 disabled:opacity-50"
                                >
                                    {uploading ? 'Processing...' : 'Upload & Start Interview'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    disabled={uploading}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
