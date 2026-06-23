import { useEffect, useState } from 'react'
import { Download, Search, Filter } from 'lucide-react'
import AuditTable from '../components/AuditTable'
import { getAuditLog } from '../lib/api'
import type { AuditEntry } from '../lib/api'

export default function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [verdictFilter, setVerdictFilter] = useState<string>('')
  const [searchText, setSearchText] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 50

  useEffect(() => {
    loadData()
  }, [verdictFilter])

  const loadData = async () => {
    const data = await getAuditLog(500, verdictFilter || undefined)
    setEntries(data)
    setPage(1)
  }

  // Filtrar por búsqueda de texto
  const filtered = entries.filter((e) =>
    searchText === '' || e.action.toLowerCase().includes(searchText.toLowerCase())
  )

  // Paginación
  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  // Exportar CSV
  const exportCSV = () => {
    const headers = ['Timestamp', 'Acción', 'Artículo', 'NIST', 'Categoría', 'Riesgo', 'Veredicto', 'ms']
    const rows = filtered.map((e) => [
      e.timestamp,
      `"${e.action.replace(/"/g, '""')}"`,
      e.article_name || '',
      e.nist_function || '',
      e.nist_category || '',
      e.risk_score?.toFixed(1) || '0',
      e.verdict,
      e.duration_ms?.toString() || '0',
    ])

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `aegis-audit-log-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-4 bg-white rounded-xl border border-slate-200 p-4">
        {/* Búsqueda */}
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por acción..."
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value)
              setPage(1)
            }}
            className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Filtro veredicto */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={verdictFilter}
            onChange={(e) => setVerdictFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Todos</option>
            <option value="denied">Bloqueados</option>
            <option value="approved">Permitidos</option>
            <option value="escalate">Escalados</option>
          </select>
        </div>

        {/* Export CSV */}
        <button
          onClick={exportCSV}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="w-4 h-4" />
          Exportar CSV ({filtered.length})
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <AuditTable entries={paginated} />

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
            <span className="text-xs text-slate-500">
              Página {page} de {totalPages} ({filtered.length} registros)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-xs border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-xs border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
