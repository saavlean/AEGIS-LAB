import type { AuditEntry } from '../lib/api'
import NistBadge from './NistBadge'

interface AuditTableProps {
  entries: AuditEntry[]
}

function RiskBar({ score }: { score: number }) {
  let color = 'bg-emerald-500'
  if (score >= 7) color = 'bg-red-500'
  else if (score >= 4) color = 'bg-amber-500'

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${(score / 10) * 100}%` }} />
      </div>
      <span className="text-xs text-slate-600">{score.toFixed(1)}</span>
    </div>
  )
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const styles: Record<string, string> = {
    approved: 'bg-emerald-100 text-emerald-700',
    denied: 'bg-red-100 text-red-700',
    escalate: 'bg-amber-100 text-amber-700',
    require_confirmation: 'bg-amber-100 text-amber-700',
    executed: 'bg-slate-100 text-slate-700',
  }

  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${styles[verdict] || 'bg-slate-100 text-slate-700'}`}>
      {verdict}
    </span>
  )
}

export default function AuditTable({ entries }: AuditTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-2 text-xs font-semibold text-slate-500">Timestamp</th>
            <th className="text-left py-3 px-2 text-xs font-semibold text-slate-500">Acción</th>
            <th className="text-left py-3 px-2 text-xs font-semibold text-slate-500">Artículo</th>
            <th className="text-left py-3 px-2 text-xs font-semibold text-slate-500">NIST</th>
            <th className="text-left py-3 px-2 text-xs font-semibold text-slate-500">Riesgo</th>
            <th className="text-left py-3 px-2 text-xs font-semibold text-slate-500">Veredicto</th>
            <th className="text-right py-3 px-2 text-xs font-semibold text-slate-500">ms</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-3 px-2 text-xs text-slate-500">
                {new Date(entry.timestamp).toLocaleString('es-AR')}
              </td>
              <td className="py-3 px-2 text-xs text-slate-800 font-mono max-w-[200px] truncate">
                {entry.action}
              </td>
              <td className="py-3 px-2 text-xs text-slate-600">{entry.article_name || '—'}</td>
              <td className="py-3 px-2">
                {entry.nist_function ? (
                  <NistBadge nistFunction={entry.nist_function} nistCategory={entry.nist_category} />
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </td>
              <td className="py-3 px-2">
                <RiskBar score={entry.risk_score || 0} />
              </td>
              <td className="py-3 px-2">
                <VerdictBadge verdict={entry.verdict} />
              </td>
              <td className="py-3 px-2 text-xs text-slate-500 text-right">{entry.duration_ms}</td>
            </tr>
          ))}
          {entries.length === 0 && (
            <tr>
              <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">
                Sin registros aún. Ejecutá un escenario para ver el audit trail.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
