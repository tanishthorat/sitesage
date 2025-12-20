// components/dashboard/cards/ContentMetricsCard.tsx
"use client"

interface ContentMetricsCardProps {
  wordCount: number
  h1Count: number
  h2Count: number
  imageCount: number
  missingAlt: number
}

export default function ContentMetricsCard({ 
  wordCount, 
  h1Count, 
  h2Count, 
  imageCount, 
  missingAlt 
}: ContentMetricsCardProps) {
  const getWordCountStatus = () => {
    if (wordCount < 300) return { text: 'Low', color: 'text-red-500', icon: '▼' }
    if (wordCount < 1000) return { text: 'Good', color: 'text-amber-500', icon: '─' }
    return { text: 'Excellent', color: 'text-emerald-500', icon: '▲' }
  }

  const status = getWordCountStatus()

  const metrics = [
    { label: 'H1 Tags', value: h1Count, ideal: 1 },
    { label: 'H2 Tags', value: h2Count, ideal: '3+' },
    { label: 'Images', value: imageCount, ideal: '5+' },
    { label: 'Missing Alt', value: missingAlt, ideal: 0 }
  ]

  const getMetricColor = (label: string, value: number) => {
    if (label === 'H1 Tags') return value === 1 ? 'text-emerald-600' : 'text-amber-600'
    if (label === 'Missing Alt') return value === 0 ? 'text-emerald-600' : 'text-red-600'
    return value > 0 ? 'text-emerald-600' : 'text-gray-400'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-600">Content Metrics</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold text-gray-900">{wordCount || 0}</span>
          <span className={`flex items-center text-sm font-medium ${status.color}`}>
            {status.icon} {status.text}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Total Words</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-gray-50 rounded-lg p-3">
            <div className={`text-2xl font-bold ${getMetricColor(metric.label, metric.value)}`}>
              {metric.value}
            </div>
            <div className="text-xs text-gray-500 mt-1">{metric.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">
              Ideal: {metric.ideal}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
