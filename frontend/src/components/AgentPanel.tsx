interface AgentPanelProps {
  agent: 'free' | 'governed'
  action: string
  verdict: string
  response?: string | null
  loading: boolean
}

export default function AgentPanel({ agent, action, verdict, response, loading }: AgentPanelProps) {
  const isFree = agent === 'free'

  return (
    <div className={`flex-1 rounded-xl border-2 p-5 ${
      isFree ? 'border-red-200 bg-red-50/50' : 'border-emerald-200 bg-emerald-50/50'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-sm font-bold ${isFree ? 'text-red-800' : 'text-emerald-800'}`}>
          {isFree ? 'Agente SIN Gobernanza' : 'Agente CON AEGIS'}
        </h3>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
          isFree
            ? 'bg-red-100 text-red-700'
            : 'bg-emerald-100 text-emerald-700'
        }`}>
          {isFree ? 'Sin políticas' : 'AGP 1 activo'}
        </span>
      </div>

      {/* Action */}
      <div className="bg-white rounded-lg p-3 mb-3 border border-slate-200">
        <p className="text-xs text-slate-500 mb-1">Acción solicitada:</p>
        <code className="text-sm text-slate-800 font-mono break-all">{action}</code>
      </div>

      {/* Verdict */}
      {verdict && (
        <div className={`rounded-lg p-3 mb-3 ${
          verdict === 'executed' || verdict === 'approved'
            ? 'bg-emerald-100 border border-emerald-200'
            : 'bg-red-100 border border-red-200'
        }`}>
          <p className={`text-sm font-semibold ${
            verdict === 'executed' || verdict === 'approved' ? 'text-emerald-800' : 'text-red-800'
          }`}>
            {verdict === 'executed' && '✓ Ejecutada'}
            {verdict === 'approved' && '✓ Aprobada'}
            {verdict === 'denied' && '✗ Bloqueada'}
            {verdict === 'escalate' && '⚠ Escalada'}
            {verdict === 'require_confirmation' && '⚠ Requiere confirmación'}
          </p>
        </div>
      )}

      {/* Response */}
      <div className="bg-white rounded-lg p-3 border border-slate-200">
        <p className="text-xs text-slate-500 mb-1">Respuesta:</p>
        {loading ? (
          <div className="flex items-center gap-2 text-slate-400">
            <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Procesando...</span>
          </div>
        ) : (
          <p className="text-sm text-slate-700 whitespace-pre-wrap">
            {response || (isFree ? 'Esperando ejecución...' : 'Acción bloqueada por AEGIS')}
          </p>
        )}
      </div>
    </div>
  )
}
