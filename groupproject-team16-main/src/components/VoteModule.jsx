import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { 
  Vote, 
  Plus,
  Users,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react'
import { canCreateVote, canVote, getCurrentUser } from '@/utils/permissions.js'

const VoteModule = () => {
  const currentUser = getCurrentUser()
  const votes = [
    {
      id: 1,
      title: '下周实验课时间安排',
      course: '机器学习基础',
      type: 'single',
      status: 'active',
      participants: 38,
      total: 45,
      deadline: '2025-10-18',
      options: [
        { text: '周三下午 2:00-4:00', votes: 15, percentage: 39 },
        { text: '周四上午 10:00-12:00', votes: 12, percentage: 32 },
        { text: '周五下午 3:00-5:00', votes: 11, percentage: 29 },
      ]
    },
    {
      id: 2,
      title: '期末考试形式调查',
      course: '数据结构与算法',
      type: 'single',
      status: 'active',
      participants: 49,
      total: 52,
      deadline: '2025-10-20',
      options: [
        { text: '闭卷笔试', votes: 18, percentage: 37 },
        { text: '开卷笔试', votes: 12, percentage: 24 },
        { text: '上机考试', votes: 19, percentage: 39 },
      ]
    },
    {
      id: 3,
      title: '课程难度反馈',
      course: 'Web全栈开发',
      type: 'single',
      status: 'completed',
      participants: 38,
      total: 38,
      deadline: '2025-10-15',
      options: [
        { text: '太简单', votes: 3, percentage: 8 },
        { text: '适中', votes: 28, percentage: 74 },
        { text: '较难', votes: 7, percentage: 18 },
      ]
    },
    {
      id: 4,
      title: '希望增加的教学内容',
      course: '数据库系统原理',
      type: 'multiple',
      status: 'active',
      participants: 42,
      total: 49,
      deadline: '2025-10-22',
      options: [
        { text: 'NoSQL数据库', votes: 28, percentage: 67 },
        { text: '数据库性能调优', votes: 35, percentage: 83 },
        { text: '分布式数据库', votes: 22, percentage: 52 },
        { text: '数据仓库技术', votes: 18, percentage: 43 },
      ]
    },
  ]

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: '进行中', variant: 'default', icon: Clock },
      completed: { label: '已结束', variant: 'outline', icon: CheckCircle },
    }
    const config = statusConfig[status]
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getTypeBadge = (type) => {
    const typeConfig = {
      single: { label: '单选', color: 'bg-blue-100 text-blue-700' },
      multiple: { label: '多选', color: 'bg-purple-100 text-purple-700' },
    }
    const config = typeConfig[type]
    return <Badge className={config.color}>{config.label}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">投票问卷</h1>
          <p className="text-muted-foreground mt-1">收集学生意见和反馈</p>
        </div>
        {canCreateVote() && (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            创建投票
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">总投票数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{votes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">进行中</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {votes.filter(v => v.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">总参与人次</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {votes.reduce((sum, v) => sum + v.participants, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">平均参与率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">86%</div>
          </CardContent>
        </Card>
      </div>

      {/* Vote List */}
      <div className="space-y-6">
        {votes.map((vote) => {
          const participationRate = Math.round((vote.participants / vote.total) * 100)
          
          return (
            <Card key={vote.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <CardTitle className="text-xl">{vote.title}</CardTitle>
                      {getStatusBadge(vote.status)}
                      {getTypeBadge(vote.type)}
                    </div>
                    <CardDescription className="flex items-center gap-2 flex-wrap">
                      <span>{vote.course}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        截止: {vote.deadline}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {vote.participants}/{vote.total} 人参与
                      </span>
                    </CardDescription>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Vote className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Participation Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">参与进度</span>
                    <span className="font-medium">{participationRate}%</span>
                  </div>
                  <Progress value={participationRate} className="h-2" />
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {vote.options.map((option, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">{option.text}</span>
                        <span className="text-muted-foreground">
                          {option.votes} 票 ({option.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
                          style={{ width: `${option.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    查看详细统计
                  </Button>
                  {vote.status === 'active' && (
                    <Button variant="outline" size="sm">
                      结束投票
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>投票使用建议</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>使用投票功能快速收集学生对课程安排、教学方式等的意见</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>单选投票适合二选一或多选一的决策场景</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>多选投票适合收集多个维度的反馈</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>投票结果实时更新,支持图表化展示</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

export default VoteModule

