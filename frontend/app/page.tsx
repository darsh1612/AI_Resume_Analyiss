import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-transparent" />

        <div className="relative max-w-6xl mx-auto px-8 py-24 md:py-32">
          <div className="text-center space-y-8 animate-fadeIn">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Master Your
              <br />
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Tech Interviews
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
              AI-powered interview practice platform that analyzes your resume and creates
              personalized technical interviews to help you land your dream job.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
              <Link
                href="/signup"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-lg hover:shadow-blue-500/50"
              >
                Start Free Interview
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-lg font-semibold text-lg transition-all hover:scale-105"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-8 py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Why Choose AI Interviewer?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/10">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-3">Personalized Questions</h3>
            <p className="text-gray-400">
              Our AI analyzes your resume and generates targeted questions based on your
              skills and experience level.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/10">
            <div className="text-4xl mb-4">💡</div>
            <h3 className="text-xl font-bold mb-3">Real-Time Feedback</h3>
            <p className="text-gray-400">
              Get instant, detailed feedback on your answers including correctness, depth,
              and clarity metrics.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/10">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-3">Detailed Reports</h3>
            <p className="text-gray-400">
              Comprehensive performance reports highlighting your strengths and areas for
              improvement.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/10">
            <div className="text-4xl mb-4">💻</div>
            <h3 className="text-xl font-bold mb-3">Code Editor</h3>
            <p className="text-gray-400">
              Practice coding questions with an integrated Monaco editor that supports
              syntax highlighting.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/10">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold mb-3">Secure & Private</h3>
            <p className="text-gray-400">
              Your data is encrypted and stored securely. Only you have access to your
              interview history.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/10">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-3">Fast & Efficient</h3>
            <p className="text-gray-400">
              Complete a full interview in 30 minutes. Perfect for quick practice sessions
              before real interviews.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-8 py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          How It Works
        </h2>

        <div className="space-y-8">
          <div className="flex items-start gap-6 bg-gray-900 border border-gray-800 rounded-xl p-8">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
              1
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Upload Your Resume</h3>
              <p className="text-gray-400">
                Simply upload your PDF resume. Our AI will analyze your skills, experience,
                and background.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-6 bg-gray-900 border border-gray-800 rounded-xl p-8">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
              2
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Answer Questions</h3>
              <p className="text-gray-400">
                Get 5 personalized questions mixing conceptual and coding challenges tailored
                to your profile.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-6 bg-gray-900 border border-gray-800 rounded-xl p-8">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
              3
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Review Your Report</h3>
              <p className="text-gray-400">
                Receive detailed feedback and insights. Track your progress over multiple
                interview sessions.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-16">
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-lg hover:shadow-blue-500/50"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-24">
        <div className="max-w-6xl mx-auto px-8 py-12 text-center text-gray-400">
          <p>© 2026 AI Interviewer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
