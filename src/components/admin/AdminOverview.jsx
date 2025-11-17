import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Loader2, Users, GraduationCap, FileText, Folder, Activity } from 'lucide-react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { api } from '@/lib/api.js'

const roleColors = ['#0f172a', '#2563eb', '#94a3b8']

export default function AdminOverview() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined
        const { data } = await api.get('/admin/overview', headers ? { headers } : {})
        setData(data.data)
        setError('')
      } catch (err) {
        setError(err.response?.data?.error || err.message || '加载概览失败')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

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

  const roleData = [
    { name: 'Admin', value: data.userStats.admins },
    { name: 'Teacher', value: data.userStats.teachers },
    { name: 'Student', value: data.userStats.students }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">数据库概览</h1>
        <p className="text-muted-foreground mt-1">掌控平台关键指标与热点表数据</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          icon={Users}
          title="总用户"
          value={data.userStats.total}
          description={`${data.userStats.admins} 管理员 · ${data.userStats.teachers} 教师`}
          accent="from-slate-900 to-slate-600"
        />
        <SummaryCard
          icon={GraduationCap}
          title="课程总数"
          value={data.courseStats.total}
          description={`${data.courseStats.active} 正在进行`}
          accent="from-blue-600 to-indigo-500"
        />
        <SummaryCard
          icon={FileText}
          title="作业/测验"
          value={`${data.contentStats.homeworks}/${data.contentStats.quizzes}`}
          description="已发布作业 / 测验"
          accent="from-orange-500 to-amber-400"
        />
        <SummaryCard
          icon={Folder}
          title="资源文件"
          value={data.contentStats.resources}
          description="课程资料下载数"
          accent="from-emerald-500 to-green-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>角色分布</CardTitle>
            <CardDescription>Admin / Teacher / Student</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={roleData} innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={4} label>
                  {roleData.map((entry, index) => (
                    <Cell key={entry.name} fill={roleColors[index % roleColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>热门课程</CardTitle>
            <CardDescription>按选课人数排序</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.popularCourses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="hsl(var(--primary))" name="学生数" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>运行状态</CardTitle>
            <CardDescription>掌握教学内容的增长情况</CardDescription>
          </div>
          <Activity className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TrendTile label="活跃课程" value={data.courseStats.active} grow labelDetail="正在运行" />
          <TrendTile label="即将开始" value={data.courseStats.upcoming} />
          <TrendTile label="已结课" value={data.courseStats.completed} />
        </CardContent>
      </Card>
    </div>
  )
}

function SummaryCard({ icon: Icon, title, value, description, accent }) {
  return (
    <Card className="overflow-hidden border-none bg-gradient-to-br text-white shadow-lg">
      <CardHeader className={`bg-gradient-to-r ${accent}`}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm uppercase tracking-wide">{title}</CardTitle>
          <Icon className="h-5 w-5 opacity-80" />
        </div>
        <CardDescription className="text-3xl font-bold text-white">{value}</CardDescription>
      </CardHeader>
      <CardContent className="bg-white text-sm text-muted-foreground">
        <p>{description}</p>
      </CardContent>
    </Card>
  )
}

function TrendTile({ label, value, labelDetail }) {
  return (
    <div className="rounded-xl border p-4 bg-muted/40">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
      {labelDetail && <p className="text-xs text-muted-foreground mt-1">{labelDetail}</p>}
    </div>
  )
}

