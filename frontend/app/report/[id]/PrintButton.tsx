'use client'

export default function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-lg font-semibold transition-all"
        >
            Print Report
        </button>
    )
}
