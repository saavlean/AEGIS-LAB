import { useEffect, useState } from 'react'
import { Shield, AlertTriangle, CheckCircle, Clock, Activity } from 'lucide-react'
import MetricCard from '../components/MetricCard'
import NistBadge from '../components/NistBadge'
import { getMetrics, getAuditLog } from '../lib/api'
import type { Metrics, AuditEntry } from '../lib/api'

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [recent, setRecent] = useState<AuditEntry[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [m, log] = await Promise.all([
      getMetrics(),
      getAuditLog(10),
    ])
    setMetrics(m)
    setRecent(log)
  }

  if (!metrics) {
    return <div className="text-center py-12 text-slate-400">Cargando métricas...</div>
  }

  const nistDistribution = recent.reduce((acc, entry) => {
    if (entry.nist_function) {
      acc[entry.nist_function] = (acc[entry.nist_function] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Bloqueadas" value={metrics.blocked} color="red" icon={<AlertTriangle className="w-5 h-5" />} />
        <MetricCard title="Permitidas" value={metrics.allowed} color="emerald" icon={<CheckCircle className="w-5 h-5" />} />
        <MetricCard title="Escaladas" value={metrics.escalated} color="amber" icon={<Shield className="w-5 h-5" />} />
        <MetricCard title="Latencia AGP 1" value={`${metrics.avg_latency_ms}ms`} color="blue" icon={<Clock className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top artículos violados */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Violaciones por artículo constitucional</h3>
          {metrics.top_articles.length === 0 ? (
            <p className="text-sm text-slate-400">Sin datos aún</p>
          ) : (
            <div className="space-y-3">
              {metrics.top_articles.map((art, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-700 truncate">{art.name}</span>
                      <span className="text-xs font-bold text-slate-900">{art.count}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${(art.count / metrics.blocked) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Distribución NIST */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Distribución NIST AI RMF</h3>
          <div className="grid grid-cols-2 gap-3">
            {['GOVERN', 'MAP', 'MEASURE', 'MANAGE'].map((func) => (
              <div key={func} className="flex items-center gap-2">
                <NistBadge nistFunction={func} nistCategory={`${nistDistribution[func] || 0} eventos`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feed de actividad reciente */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Actividad reciente</h3>
        {recent.length === 0 ? (
          <p className="text-sm text-slate-400">Sin actividad aún</p>
        ) : (
          <div className="space-y-2">
            {recent.map((entry) => (
              <div key={entry.id} className="flex items-center gap-4 py-2 border-b border-slate-100 last:border-0">
                <span className="text-xs text-slate-400 w-32 shrink-0">
                  {new Date(entry.timestamp).toLocaleString('es-AR')}
                </span>
                <span className="text-xs text-slate-700 flex-1 truncate font-mono">{entry.action}</span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  entry.verdict === 'denied' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {entry.verdict}
                </span>
                {entry.nist_function && (
                  <NistBadge nistFunction={entry.nist_function} nistCategory={entry.nist_category} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
