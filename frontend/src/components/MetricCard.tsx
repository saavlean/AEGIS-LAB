interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  color?: 'red' | 'emerald' | 'amber' | 'blue'
}

const colorMap = {
  red: 'bg-red-50 border-red-200 text-red-700',
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  amber: 'bg-amber-50 border-amber-200 text-amber-700',
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
}

export default function MetricCard({ title, value, subtitle, color = 'emerald' }: MetricCardProps) {
  return (
    <div className={`rounded-xl border p-4 ${colorMap[color]}`}>
      <p className="text-xs font-medium opacity-75 mb-1">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
      {subtitle && <p className="text-xs mt-1 opacity-60">{subtitle}</p>}
    </div>
  )
}
