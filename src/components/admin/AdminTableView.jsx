import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Loader2, Edit3 } from 'lucide-react'
import { api } from '@/lib/api.js'

export default function AdminTableView() {
  const { tableKey } = useParams()
  const [meta, setMeta] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [formData, setFormData] = useState({})
  const [saving, setSaving] = useState(false)

  const fetchTable = async () => {
    if (!tableKey) return
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined
      const { data } = await api.get(`/admin/tables/${tableKey}`, headers ? { headers } : {})
      setMeta(data.data)
      setRows(data.data.rows || [])
      setError('')
    } catch (err) {
      setError(err.response?.data?.error || err.message || '加载表数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTable()
  }, [tableKey])

  const startEdit = (row) => {
    setEditingRow(row)
    setFormData(row)
    setDialogOpen(true)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const saveChanges = async () => {
    if (!meta || !editingRow) return
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined
      await api.put(
        `/admin/tables/${tableKey}/${editingRow[meta.idField]}`,
        formData,
        headers ? { headers } : {}
      )
      setDialogOpen(false)
      setEditingRow(null)
      fetchTable()
    } catch (err) {
      const message = err.response?.data?.error || err.message || '更新失败'
      alert(message)
    } finally {
      setSaving(false)
    }
  }

  const formatValue = useMemo(
    () => (value, type) => {
      if (value === null || value === undefined) return '-'
      if (type === 'datetime') {
        try {
          return new Date(value).toLocaleString()
        } catch {
          return value
        }
      }
      if (typeof value === 'object') {
        return JSON.stringify(value)
      }
      return String(value)
    },
    []
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="bg-red-50 border-red-100">
        <CardContent className="py-10 text-center text-red-600">{error}</CardContent>
      </Card>
    )
  }

  if (!meta) return null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{meta.label}</CardTitle>
            <CardDescription>可视化检查与编辑记录，每次最多显示 100 行</CardDescription>
          </div>
          <Button variant="outline" onClick={fetchTable}>刷新</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {meta.columns.map(col => (
                    <TableHead key={col.key}>{col.label}</TableHead>
                  ))}
                  <TableHead className="w-24 text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(row => (
                  <TableRow key={row[meta.idField]}>
                    {meta.columns.map(col => (
                      <TableCell key={col.key} className="align-top text-sm">
                        {formatValue(row[col.key], col.type)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => startEdit(row)}>
                        <Edit3 className="h-4 w-4 mr-1" />
                        编辑
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑记录</DialogTitle>
            <p className="text-xs text-muted-foreground break-all">
              {meta.idField}: {editingRow?.[meta.idField]}
            </p>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[50vh] overflow-y-auto">
            {meta.columns.map(col => {
              if (!meta.editableFields.includes(col.key)) {
                return (
                  <div key={col.key} className="text-sm">
                    <Label className="text-muted-foreground">{col.label}</Label>
                    <div className="mt-1 bg-muted rounded-lg px-3 py-2">
                      {formatValue(editingRow?.[col.key], col.type)}
                    </div>
                  </div>
                )
              }
              return (
                <div key={col.key} className="text-sm">
                  <Label>{col.label}</Label>
                  <Input
                    className="mt-1"
                    type={col.type === 'number' ? 'number' : 'text'}
                    value={formData[col.key] ?? ''}
                    onChange={(e) => handleChange(col.key, e.target.value)}
                  />
                </div>
              )
            })}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={saveChanges} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

