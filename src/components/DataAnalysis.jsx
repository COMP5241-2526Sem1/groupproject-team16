import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { 
  BarChart3, 
  TrendingUp,
  Users,
  Award,
  Clock,
  Download
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'

const DataAnalysis = () => {
  // 成绩分布数据
  const gradeDistribution = [
    { range: '0-59', count: 5, percentage: 10 },
    { range: '60-69', count: 8, percentage: 16 },
    { range: '70-79', count: 18, percentage: 36 },
    { range: '80-89', count: 15, percentage: 30 },
    { range: '90-100', count: 4, percentage: 8 },
  ]

  // 作业提交趋势
  const submissionTrend = [
    { week: '第1周', onTime: 42, late: 3, missing: 0 },
    { week: '第2周', onTime: 38, late: 5, missing: 2 },
    { week: '第3周', onTime: 40, late: 4, missing: 1 },
    { week: '第4周', onTime: 35, late: 7, missing: 3 },
    { week: '第5周', onTime: 39, late: 4, missing: 2 },
    { week: '第6周', onTime: 41, late: 3, missing: 1 },
  ]

  // 学生活跃度
  const studentActivity = [
    { name: '登录频率', value: 85 },
    { name: '作业提交', value: 78 },
    { name: '讨论参与', value: 65 },
    { name: 'Quiz完成', value: 82 },
    { name: '资源下载', value: 70 },
  ]

  // 课程完成度
  const courseCompletion = [
    { name: '已完成', value: 65, color: '#22c55e' },
    { name: '进行中', value: 25, color: '#3b82f6' },
    { name: '未开始', value: 10, color: '#94a3b8' },
  ]

  // Quiz平均分趋势
  const quizScoreTrend = [
    { quiz: 'Quiz 1', avgScore: 75, maxScore: 92, minScore: 58 },
    { quiz: 'Quiz 2', avgScore: 78, maxScore: 95, minScore: 62 },
    { quiz: 'Quiz 3', avgScore: 82, maxScore: 98, minScore: 65 },
    { quiz: 'Quiz 4', avgScore: 80, maxScore: 96, minScore: 68 },
    { quiz: 'Quiz 5', avgScore: 85, maxScore: 100, minScore: 72 },
  ]

  const topStudents = [
    { name: '张三', score: 95, submissions: 12, participation: 98 },
    { name: '李四', score: 92, submissions: 12, participation: 95 },
    { name: '王五', score: 90, submissions: 11, participation: 92 },
    { name: '赵六', score: 88, submissions: 12, participation: 90 },
    { name: '孙七', score: 87, submissions: 11, participation: 88 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">数据分析</h1>
          <p className="text-muted-foreground mt-1">深入了解教学效果和学生表现</p>
        </div>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          导出报告
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              平均出勤率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">92%</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+3%</span> 较上月
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" />
              平均成绩
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">82分</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+2分</span> 较上月
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              作业按时率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">87%</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-red-600">-1%</span> 较上月
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              活跃度指数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">76</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+5</span> 较上月
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="grades" className="space-y-6">
        <TabsList>
          <TabsTrigger value="grades">成绩分析</TabsTrigger>
          <TabsTrigger value="homework">作业统计</TabsTrigger>
          <TabsTrigger value="activity">活跃度</TabsTrigger>
          <TabsTrigger value="quiz">测验趋势</TabsTrigger>
        </TabsList>

        {/* 成绩分析 */}
        <TabsContent value="grades" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>成绩分布</CardTitle>
                <CardDescription>学生成绩区间统计</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={gradeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" name="学生人数" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>课程完成度</CardTitle>
                <CardDescription>学生学习进度分布</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={courseCompletion}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {courseCompletion.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Students */}
          <Card>
            <CardHeader>
              <CardTitle>优秀学生排行</CardTitle>
              <CardDescription>综合表现前5名学生</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topStudents.map((student, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{student.name}</div>
                      <div className="text-sm text-muted-foreground">
                        平均分: {student.score} | 作业: {student.submissions}/12 | 参与度: {student.participation}%
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-primary">{student.score}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 作业统计 */}
        <TabsContent value="homework">
          <Card>
            <CardHeader>
              <CardTitle>作业提交趋势</CardTitle>
              <CardDescription>按时、迟交、未交统计</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={submissionTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="onTime" fill="#22c55e" name="按时提交" />
                  <Bar dataKey="late" fill="#f59e0b" name="迟交" />
                  <Bar dataKey="missing" fill="#ef4444" name="未交" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 活跃度 */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>学生活跃度分析</CardTitle>
              <CardDescription>多维度活跃度评估</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={studentActivity}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="活跃度" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 测验趋势 */}
        <TabsContent value="quiz">
          <Card>
            <CardHeader>
              <CardTitle>Quiz成绩趋势</CardTitle>
              <CardDescription>平均分、最高分、最低分变化</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={quizScoreTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quiz" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="avgScore" stroke="hsl(var(--primary))" strokeWidth={2} name="平均分" />
                  <Line type="monotone" dataKey="maxScore" stroke="#22c55e" strokeWidth={2} name="最高分" />
                  <Line type="monotone" dataKey="minScore" stroke="#ef4444" strokeWidth={2} name="最低分" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default DataAnalysis

