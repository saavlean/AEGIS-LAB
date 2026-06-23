import { useState } from 'react'
import { Play, ChevronDown } from 'lucide-react'
import AgentPanel from '../components/AgentPanel'
import PolicyBox from '../components/PolicyBox'
import NistBadge from '../components/NistBadge'
import { runFreeAgent, runGovernedAgent } from '../lib/api'
import { SCENARIOS, INDUSTRIES } from '../lib/scenarios'
import type { AgentResponse } from '../lib/api'

export default function Demo() {
  const [industry, setIndustry] = useState('banking')
  const [selectedScenario, setSelectedScenario] = useState('')
  const [freeResult, setFreeResult] = useState<AgentResponse | null>(null)
  const [governedResult, setGovernedResult] = useState<AgentResponse | null>(null)
  const [loadingFree, setLoadingFree] = useState(false)
  const [loadingGoverned, setLoadingGoverned] = useState(false)
  const [hasRun, setHasRun] = useState(false)

  const scenarios = SCENARIOS[industry] || []

  const handleRun = async () => {
    const scenario = scenarios.find((s) => s.id === selectedScenario)
    if (!scenario) return

    setHasRun(true)
    setFreeResult(null)
    setGovernedResult(null)
    setLoadingFree(true)
    setLoadingGoverned(true)

    // Ejecutar ambos en paralelo
    const [free, governed] = await Promise.all([
      runFreeAgent(scenario.action).finally(() => setLoadingFree(false)),
      runGovernedAgent(scenario.action).finally(() => setLoadingGoverned(false)),
    ])

    setFreeResult(free)
    setGovernedResult(governed)
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4 bg-white rounded-xl border border-slate-200 p-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Industria</label>
          <select
            value={industry}
            onChange={(e) => {
              setIndustry(e.target.value)
              setSelectedScenario('')
            }}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            {INDUSTRIES.map((ind) => (
              <option key={ind.id} value={ind.id}>{ind.label}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[300px]">
          <label className="block text-xs font-medium text-slate-500 mb-1">Escenario</label>
          <div className="relative">
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm appearance-none pr-10 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Seleccionar escenario...</option>
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <button
          onClick={handleRun}
          disabled={!selectedScenario || loadingFree || loadingGoverned}
          className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Play className="w-4 h-4" />
          Ejecutar
        </button>
      </div>

      {/* Panels lado a lado */}
      <div className="flex gap-6">
        <AgentPanel
          agent="free"
          action={scenarios.find((s) => s.id === selectedScenario)?.action || ''}
          verdict={freeResult?.verdict || ''}
          response={freeResult?.response}
          loading={loadingFree}
        />
        <AgentPanel
          agent="governed"
          action={scenarios.find((s) => s.id === selectedScenario)?.action || ''}
          verdict={governedResult?.verdict || ''}
          response={governedResult?.response}
          loading={loadingGoverned}
        />
      </div>

      {/* Panel inferior: resultado del agente gobernado */}
      {hasRun && governedResult && governedResult.verdict !== 'approved' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Resultado de la evaluación AEGIS</h3>
          <div className="flex flex-wrap items-start gap-4">
            <PolicyBox
              article={governedResult.article || 'N/A'}
              articleName={governedResult.article_name || 'N/A'}
              explanation={governedResult.explanation || 'N/A'}
            />
            <div className="flex flex-col gap-2">
              <NistBadge
                nistFunction={governedResult.nist_function || 'GOVERN'}
                nistCategory={governedResult.nist_category || 'GV.OV-03'}
              />
              <div className="text-xs text-slate-500">
                Risk Score: <span className="font-bold text-slate-800">{governedResult.risk_score?.toFixed(1)}</span>
              </div>
              <div className="text-xs text-slate-500">
                Latencia: <span className="font-bold text-slate-800">{governedResult.duration_ms}ms</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
