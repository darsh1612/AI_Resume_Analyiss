'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SignupPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            setLoading(false)
            return
        }

        try {
            const supabase = createClient()
            const { error } = await supabase.auth.signUp({
                email,
                password,
            })

            if (error) throw error

            // Auto login after signup
            router.push('/dashboard')
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'Signup failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-950/20 via-background to-blue-950/20">
            <div className="container-sm">
                <div className="modal p-8 md:p-12 animate-fadeIn">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-purple-500 to-blue- bg-clip-text text-transparent">
                            Join AI Interviewer
                        </h1>
                        <p className="text-gray-400 text-lg">Create your account to get started</p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-500/10 border-2 border-red-500/50 rounded-xl text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-2">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="At least 6 characters"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter your password"
                                required
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed mt-8"
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-400">
                            Already have an account?{' '}
                            <Link href="/login" className="text-blue-500 hover:text-blue-400 font-semibold transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
