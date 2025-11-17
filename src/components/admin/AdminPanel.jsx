import { useEffect, useState } from 'react'
import { NavLink, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Loader2, Database, LayoutGrid, MessageSquare } from 'lucide-react'
import { api } from '@/lib/api.js'
import AdminOverview from './AdminOverview.jsx'
import AdminTableView from './AdminTableView.jsx'
import AIChat from '../AIChat.jsx'

export default function AdminPanel() {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const location = useLocation()

  const fetchTables = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined
      const { data } = await api.get('/admin/tables', headers ? { headers } : {})
      setTables(data.data || [])
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || err.message || '加载表信息失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTables()
  }, [])

  const navItems = [
    { to: '/admin/overview', label: '数据库概览', icon: LayoutGrid },
    ...tables.map(table => ({ to: `/admin/table/${table.key}`, label: table.label, icon: Database })),
    { to: '/admin/ai-chat', label: 'AI Chat', icon: MessageSquare }
  ]

  return (
    <div className="flex gap-6">
      <aside className="w-72 bg-white border border-border rounded-2xl p-4 shadow-sm h-fit sticky top-24">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">数据总览</p>
            <p className="text-xl font-semibold">系统表</p>
          </div>
          <Button size="sm" variant="ghost" onClick={fetchTables} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '刷新'}
          </Button>
        </div>
        {error && (
          <Card className="mb-4 bg-red-50 border-red-100">
            <CardContent className="text-xs text-red-600 p-3">{error}</CardContent>
          </Card>
        )}
        <nav className="space-y-1 max-h-[70vh] overflow-y-auto pr-2">
          {navItems.map(item => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                    isActive
                      ? 'bg-black text-white shadow'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </aside>

      <section className="flex-1">
        <Routes>
          <Route path="overview" element={<AdminOverview />} />
          <Route path="table/:tableKey" element={<AdminTableView />} />
          <Route path="ai-chat" element={<AIChat />} />
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="*" element={<Navigate to="overview" replace />} />
        </Routes>
      </section>
    </div>
  )
}

