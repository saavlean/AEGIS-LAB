import axios from 'axios'

const API_URL = 'http://192.168.1.149:8000'

const api = axios.create({
  baseURL: API_URL,
})

export interface AgentResponse {
  agent: 'free' | 'governed'
  action: string
  verdict: string
  article?: string
  article_name?: string
  explanation?: string
  risk_score?: number
  nist_function?: string
  nist_category?: string
  response?: string
  duration_ms?: number
  governed: boolean
}

export interface AuditEntry {
  id: number
  timestamp: string
  action: string
  verdict: string
  article: string
  article_name: string
  explanation: string
  risk_score: number
  nist_function: string
  nist_category: string
  duration_ms: number
}

export interface Metrics {
  total: number
  blocked: number
  allowed: number
  escalated: number
  avg_latency_ms: number
  top_articles: { name: string; count: number }[]
}

export async function runFreeAgent(action: string): Promise<AgentResponse> {
  const { data } = await api.post('/agent/free', { action, scenario: '' })
  return data
}

export async function runGovernedAgent(action: string): Promise<AgentResponse> {
  const { data } = await api.post('/agent/governed', { action, scenario: '' })
  return data
}

export async function getAuditLog(limit = 50, verdict?: string): Promise<AuditEntry[]> {
  const params: Record<string, any> = { limit }
  if (verdict) params.verdict = verdict
  const { data } = await api.get('/audit/log', { params })
  return data
}

export async function getMetrics(): Promise<Metrics> {
  const { data } = await api.get('/audit/metrics')
  return data
}
