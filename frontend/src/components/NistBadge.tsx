interface NistBadgeProps {
  nistFunction: string
  nistCategory: string
}

const colors: Record<string, string> = {
  GOVERN: 'bg-blue-50 text-blue-700 border-blue-200',
  MAP: 'bg-purple-50 text-purple-700 border-purple-200',
  MEASURE: 'bg-amber-50 text-amber-700 border-amber-200',
  MANAGE: 'bg-red-50 text-red-700 border-red-200',
}

export default function NistBadge({ nistFunction, nistCategory }: NistBadgeProps) {
  const colorClass = colors[nistFunction] || 'bg-slate-50 text-slate-700 border-slate-200'

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
      NIST AI RMF · {nistFunction} · {nistCategory}
    </span>
  )
}
