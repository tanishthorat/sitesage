// components/dashboard/cards/OptimizationIdeasCard.tsx
"use client"

interface OptimizationIdeasCardProps {
  suggestions: string[]
}

export default function OptimizationIdeasCard({ suggestions = [] }: OptimizationIdeasCardProps) {
  // Categorize suggestions
  const categories = [
    { name: 'Content', color: 'bg-emerald-500', count: 0 },
    { name: 'Technical', color: 'bg-purple-500', count: 0 },
    { name: 'Performance', color: 'bg-amber-500', count: 0 },
    { name: 'SEO', color: 'bg-blue-500', count: 0 }
  ]

  // Simple categorization based on keywords
  suggestions.forEach((suggestion) => {
    const lower = suggestion.toLowerCase()
    if (lower.includes('content') || lower.includes('text') || lower.includes('word')) {
      categories[0].count++
    } else if (lower.includes('schema') || lower.includes('meta') || lower.includes('tag')) {
      categories[1].count++
    } else if (lower.includes('speed') || lower.includes('load') || lower.includes('performance')) {
      categories[2].count++
    } else {
      categories[3].count++
    }
  })

  const totalSuggestions = suggestions.length

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Optimization Ideas</h3>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      <div className="mb-4">
        <div className="text-4xl font-bold text-gray-900 dark:text-white">{totalSuggestions}</div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Suggestions</p>
      </div>

      {/* Category bars */}
      <div className="flex gap-1 h-2 mb-4 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
        {categories.map((cat) => (
          cat.count > 0 && (
            <div
              key={cat.name}
              className={cat.color}
              style={{ width: `${(cat.count / totalSuggestions) * 100}%` }}
              title={`${cat.name}: ${cat.count}`}
            />
          )
        ))}
      </div>

      {/* Category list */}
      <div className="space-y-3">
        {categories.map((category) => (
          <div key={category.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${category.color}`} />
              <span className="text-sm text-gray-700 dark:text-gray-300">{category.name}</span>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{category.count}</span>
          </div>
        ))}
      </div>

      {totalSuggestions === 0 && (
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 mb-3">
            <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">No issues found!</p>
        </div>
      )}
    </div>
  )
}
