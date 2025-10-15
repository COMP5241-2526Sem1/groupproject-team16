import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { 
  BookOpen, 
  Users, 
  FileText, 
  CheckSquare,
  TrendingUp,
  Clock,
  Award,
  Sparkles
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

const Dashboard = () => {
  const stats = [
    { title: '活跃课程', value: '12', icon: BookOpen, trend: '+2', color: 'text-blue-600' },
    { title: '注册学生', value: '248', icon: Users, trend: '+15', color: 'text-green-600' },
    { title: '待批改作业', value: '34', icon: FileText, trend: '-8', color: 'text-orange-600' },
    { title: '本周测验', value: '8', icon: CheckSquare, trend: '+3', color: 'text-purple-600' },
  ]

  const courseData = [
    { name: '机器学习', students: 45, completion: 78 },
    { name: '数据结构', students: 52, completion: 85 },
    { name: 'Web开发', students: 38, completion: 72 },
    { name: '算法设计', students: 41, completion: 68 },
    { name: '数据库', students: 49, completion: 82 },
  ]

  const activityData = [
    { day: '周一', submissions: 12, logins: 45 },
    { day: '周二', submissions: 19, logins: 52 },
    { day: '周三', submissions: 15, logins: 48 },
    { day: '周四', submissions: 22, logins: 58 },
    { day: '周五', submissions: 28, logins: 65 },
    { day: '周六', submissions: 8, logins: 25 },
    { day: '周日', submissions: 5, logins: 18 },
  ]

  const recentActivities = [
    { user: '张三', action: '提交了作业', course: '机器学习基础', time: '5分钟前' },
    { user: '李四', action: '完成了测验', course: 'Web开发实战', time: '15分钟前' },
    { user: '王五', action: '发起了讨论', course: '数据结构', time: '1小时前' },
    { user: '赵六', action: '上传了资源', course: '算法设计', time: '2小时前' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">教学管理仪表板</h1>
          <p className="text-muted-foreground mt-1">欢迎回来,查看您的教学概况</p>
        </div>
        <Button className="gap-2">
          <Sparkles className="h-4 w-4" />
          使用Agent生成课程
        </Button>
      </div>

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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Statistics */}
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

        {/* Activity Trend */}
        <Card>
          <CardHeader>
            <CardTitle>活动趋势</CardTitle>
            <CardDescription>本周学生活跃度统计</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="submissions" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="作业提交"
                />
                <Line 
                  type="monotone" 
                  dataKey="logins" 
                  stroke="hsl(var(--chart-3))" 
                  strokeWidth={2}
                  name="登录次数"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

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

