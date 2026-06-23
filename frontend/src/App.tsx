import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Demo from './pages/Demo'
import Dashboard from './pages/Dashboard'
import AuditLog from './pages/AuditLog'
import { Shield } from 'lucide-react'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-emerald-600" />
            <div>
              <h1 className="text-lg font-bold text-slate-900">AEGIS Governance Lab</h1>
              <p className="text-xs text-slate-500">Qwen3 8B · Local · aegis-core activo</p>
            </div>
          </div>
          <nav className="flex gap-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              Demo
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/audit"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              Audit Log
            </NavLink>
          </nav>
        </header>

        {/* Content */}
        <main className="max-w-7xl mx-auto p-6">
          <Routes>
            <Route path="/" element={<Demo />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/audit" element={<AuditLog />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
