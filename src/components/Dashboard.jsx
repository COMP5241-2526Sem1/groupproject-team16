import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { 
  BookOpen, 
  Users, 
  FileText, 
  CheckSquare,
  TrendingUp,
  Clock,
  Award,
  Sparkles,
  Loader2
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'
import { api } from '@/lib/api.js'
import { canCreateCourse } from '@/utils/permissions.js'

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState([
    { title: '活跃课程', value: '0', icon: BookOpen, trend: '+0', color: 'text-blue-600' },
    { title: '注册学生', value: '0', icon: Users, trend: '+0', color: 'text-green-600' },
    { title: '待批改作业', value: '0', icon: FileText, trend: '+0', color: 'text-orange-600' },
    { title: '本周测验', value: '0', icon: CheckSquare, trend: '+0', color: 'text-purple-600' },
  ])
  const [courseData, setCourseData] = useState([])
  const [activityData, setActivityData] = useState([])
  const [recentActivities, setRecentActivities] = useState([])
  const [insights, setInsights] = useState({
    metrics: null,
    gradeDistribution: [],
    homeworkTrend: [],
    studentActivity: [],
    courseCompletion: [],
    quizTrend: [],
    topStudents: []
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const [
          dashboardRes,
          metricsRes,
          gradeRes,
          homeworkRes,
          activityRes,
          completionRes,
          quizRes,
          topRes
        ] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/analytics/metrics'),
          api.get('/analytics/grades/distribution'),
          api.get('/analytics/homework/trend'),
          api.get('/analytics/activity/student'),
          api.get('/analytics/course/completion'),
          api.get('/analytics/quiz/trend'),
          api.get('/analytics/students/top')
        ])
        const dashboardData = dashboardRes.data.data

        // 更新统计数据
        setStats([
          { title: '活跃课程', value: String(dashboardData.stats.activeCourses), icon: BookOpen, trend: '+2', color: 'text-blue-600' },
          { title: '注册学生', value: String(dashboardData.stats.enrolledStudents), icon: Users, trend: '+15', color: 'text-green-600' },
          { title: '待批改作业', value: String(dashboardData.stats.pendingGrading), icon: FileText, trend: '-8', color: 'text-orange-600' },
          { title: '本周测验', value: String(dashboardData.stats.weeklyQuizzes), icon: CheckSquare, trend: '+3', color: 'text-purple-600' },
        ])

        setCourseData(dashboardData.courseData || [])
        setActivityData(dashboardData.activityData || [])
        setRecentActivities(dashboardData.recentActivities || [])
        setInsights({
          metrics: metricsRes.data.data,
          gradeDistribution: gradeRes.data.data || [],
          homeworkTrend: homeworkRes.data.data || [],
          studentActivity: activityRes.data.data || [],
          courseCompletion: completionRes.data.data || [],
          quizTrend: quizRes.data.data || [],
          topStudents: topRes.data.data || []
        })
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">教学管理仪表板</h1>
          <p className="text-muted-foreground mt-1">欢迎回来,查看您的教学概况</p>
        </div>
        {canCreateCourse() && (
          <Button className="gap-2">
            <Sparkles className="h-4 w-4" />
            使用Agent生成课程
          </Button>
        )}
      </div>

      {/* Hero Insight */}
      {insights.metrics && (
        <Card className="overflow-hidden bg-black text-white relative">
          <img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1600&q=80" alt="analytics" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-40" />
          <CardContent className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between p-6">
            <div>
              <p className="text-sm uppercase tracking-wide opacity-80">实时洞察</p>
              <p className="text-2xl font-semibold mt-2">课堂健康度 {insights.metrics.activityIndex}</p>
              <p className="text-sm opacity-75 mt-1">出勤率 {insights.metrics.avgAttendance}% · 平均成绩 {insights.metrics.avgGrade} 分</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm opacity-70">按时率</p>
                <p className="text-3xl font-bold">{insights.metrics.onTimeSubmissionRate}%</p>
                <p className="text-xs text-green-300 flex items-center justify-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {insights.metrics.trends?.submissionRate?.value ?? 0}%
                </p>
              </div>
              <div>
                <p className="text-sm opacity-70">活跃指数</p>
                <p className="text-3xl font-bold">{insights.metrics.activityIndex}</p>
                <p className="text-xs text-green-300 flex items-center justify-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {insights.metrics.trends?.activity?.value ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                    {stat.trend}
                  </span>
                  {' '}较上周
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Unified Insight Tabs */}
      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="courses">课程概览</TabsTrigger>
          <TabsTrigger value="grades">成绩洞察</TabsTrigger>
          <TabsTrigger value="homework">作业趋势</TabsTrigger>
          <TabsTrigger value="activity">活跃度</TabsTrigger>
          <TabsTrigger value="quiz">测验走势</TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>课程统计</CardTitle>
                <CardDescription>各课程学生人数与完成度</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={courseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="students" fill="hsl(var(--primary))" name="学生人数" />
                    <Bar dataKey="completion" fill="hsl(var(--chart-2))" name="完成度%" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>课程完成度</CardTitle>
                <CardDescription>实时进度占比</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={insights.courseCompletion} dataKey="value" cx="50%" cy="50%" outerRadius={110} label={({ name, value }) => `${name} ${value}%`} />
                    <Tooltip />
                    {insights.courseCompletion.map((entry, idx) => (
                      <Cell key={entry.name} fill={entry.color || ['#22c55e','#3b82f6','#94a3b8'][idx % 3]} />
                    ))}
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="grades">
          <Card>
            <CardHeader>
              <CardTitle>成绩分布</CardTitle>
              <CardDescription>来源: 实际作业/测验评分</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={insights.gradeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>优秀学生榜</CardTitle>
              <CardDescription>综合成绩 Top {insights.topStudents.length}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.topStudents.map((student, index) => (
                <div key={student.name} className="flex items-center gap-4 p-3 rounded-lg border">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">{index + 1}</div>
                  <div className="flex-1">
                    <p className="font-medium">{student.name}</p>
                    <p className="text-xs text-muted-foreground">作业 {student.submissions} · 参与度 {student.participation}%</p>
                  </div>
                  <div className="text-xl font-bold text-primary">{student.score}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="homework">
          <Card>
            <CardHeader>
              <CardTitle>作业提交趋势</CardTitle>
              <CardDescription>按时/迟交/未交对比</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={insights.homeworkTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="onTime" fill="#22c55e" name="按时" />
                  <Bar dataKey="late" fill="#f97316" name="迟交" />
                  <Bar dataKey="missing" fill="#ef4444" name="未交" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>本周活跃曲线</CardTitle>
                <CardDescription>登录与提交实时走势</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="submissions" stroke="hsl(var(--primary))" strokeWidth={2} name="作业提交" />
                    <Line type="monotone" dataKey="logins" stroke="hsl(var(--chart-3))" strokeWidth={2} name="登录次数" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>活跃度雷达</CardTitle>
                <CardDescription>多维度参与情况</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <RadarChart data={insights.studentActivity}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quiz">
          <Card>
            <CardHeader>
              <CardTitle>Quiz 成绩趋势</CardTitle>
              <CardDescription>平均/最高/最低分</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={insights.quizTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quiz" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="avgScore" stroke="hsl(var(--primary))" strokeWidth={2} name="平均" />
                  <Line type="monotone" dataKey="maxScore" stroke="#22c55e" strokeWidth={2} name="最高" />
                  <Line type="monotone" dataKey="minScore" stroke="#ef4444" strokeWidth={2} name="最低" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>最近活动</CardTitle>
          <CardDescription>实时查看学生动态</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    <span className="text-primary">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-sm text-muted-foreground">{activity.course}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                  <Clock className="h-3 w-3" />
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard

