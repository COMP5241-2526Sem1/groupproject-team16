import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'

export default function Profile({ onLogout }) {
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    organization: '',
    bio: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('user')
    if (saved) {
      const u = JSON.parse(saved)
      setUser(u)
      setForm({
        name: u.name || '',
        email: u.email || '',
        phone: u.phone || '',
        title: u.title || '',
        organization: u.organization || '',
        bio: u.bio || ''
      })
    }
  }, [])

  const roleLabel = useMemo(() => {
    if (!user?.role) return '未设置'
    if (user.role === 'TEACHER') return '教师'
    if (user.role === 'STUDENT') return '学生'
    if (user.role === 'ADMIN') return '管理员'
    return user.role
  }, [user])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSave = () => {
    setSaving(true)
    try {
      const saved = localStorage.getItem('user')
      const u = saved ? JSON.parse(saved) : {}
      const updated = { ...u, ...form }
      localStorage.setItem('user', JSON.stringify(updated))
      setUser(updated)
      alert('已保存个人信息（本地）')
    } finally {
      setSaving(false)
    }
  }

  const handleResetPassword = () => {
    alert('密码重置功能待接入后端 API，当前为预留操作。')
  }

  const handleNotificationSettings = () => {
    alert('通知偏好设置功能待接入，当前为预留操作。')
  }

  const logout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    if (onLogout) onLogout()
    window.location.href = '/'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>账户信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>姓名</Label>
              <Input name="name" value={form.name} onChange={handleChange} placeholder="姓名" />
            </div>
            <div>
              <Label>邮箱</Label>
              <Input name="email" value={form.email} onChange={handleChange} placeholder="邮箱" />
            </div>
            <div>
              <Label>联系电话</Label>
              <Input name="phone" value={form.phone} onChange={handleChange} placeholder="11位手机号 / 联系方式" />
            </div>
            <div>
              <Label>职称 / 班级</Label>
              <Input name="title" value={form.title} onChange={handleChange} placeholder="例如：教授 / 2025级1班" />
            </div>
            <div>
              <Label>所属单位</Label>
              <Input name="organization" value={form.organization} onChange={handleChange} placeholder="学校/学院/组织" />
            </div>
          </div>
          <div>
            <Label>个人简介</Label>
            <Textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="介绍教学/学习背景、擅长领域等..."
              rows={4}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary">角色：{roleLabel}</Badge>
            {user?.email && <Badge variant="outline">登录邮箱：{user.email}</Badge>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSave} disabled={saving}>{saving ? '保存中...' : '保存'}</Button>
            <Button variant="outline" onClick={handleResetPassword}>重置密码</Button>
            <Button variant="outline" onClick={handleNotificationSettings}>通知设置</Button>
            <Button variant="destructive" onClick={logout}>退出登录</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


