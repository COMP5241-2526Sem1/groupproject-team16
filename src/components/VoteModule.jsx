import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.jsx'
import { 
  Vote, 
  Plus,
  Users,
  CheckCircle,
  Clock,
  BarChart3,
  X,
  Loader2,
  Radio,
  CheckSquare2
} from 'lucide-react'
import { canCreateVote, getCurrentUser, isTeacher, isStudent } from '@/utils/permissions.js'
import { api } from '@/lib/api.js'
import { toast } from 'sonner'

const VoteModule = () => {
  const currentUser = getCurrentUser()
  const [votes, setVotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentCourse, setCurrentCourse] = useState(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isVoteDialogOpen, setIsVoteDialogOpen] = useState(false)
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false)
  const [selectedVote, setSelectedVote] = useState(null)
  const [selectedOptions, setSelectedOptions] = useState([])
  const [voteStats, setVoteStats] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // 创建投票表单
  const [createForm, setCreateForm] = useState({
    title: '',
    type: 'single',
    deadline: '',
    options: ['', '']
  })

  // 获取当前课程
  useEffect(() => {
    try {
      const savedCourse = localStorage.getItem('selectedCourse')
      if (savedCourse) {
        setCurrentCourse(JSON.parse(savedCourse))
      }
    } catch {
      setCurrentCourse(null)
    }
  }, [])

  // 获取投票列表
  const fetchVotes = async () => {
    if (!currentCourse?.id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await api.get(`/vote?courseId=${currentCourse.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setVotes(response.data?.data || [])
    } catch (error) {
      console.error('获取投票列表失败:', error)
      toast.error('获取投票列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVotes()
  }, [currentCourse?.id])

  // 创建投票
  const handleCreateVote = async () => {
    if (!createForm.title.trim()) {
      toast.error('请输入投票标题')
      return
    }
    if (createForm.options.filter(opt => opt.trim()).length < 2) {
      toast.error('至少需要2个选项')
      return
    }
    if (!createForm.deadline) {
      toast.error('请选择截止时间')
      return
    }

    try {
      setSubmitting(true)
      const token = localStorage.getItem('token')
      await api.post('/vote', {
        title: createForm.title,
        courseId: currentCourse.id,
        type: createForm.type,
        deadline: createForm.deadline,
        options: createForm.options.filter(opt => opt.trim())
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('投票创建成功')
      setIsCreateDialogOpen(false)
      setCreateForm({ title: '', type: 'single', deadline: '', options: ['', ''] })
      fetchVotes()
    } catch (error) {
      console.error('创建投票失败:', error)
      toast.error(error.response?.data?.error || '创建投票失败')
    } finally {
      setSubmitting(false)
    }
  }

  // 打开投票对话框
  const handleOpenVote = async (vote) => {
    try {
      const token = localStorage.getItem('token')
      const response = await api.get(`/vote/${vote.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSelectedVote(response.data?.data)
      setSelectedOptions(response.data?.data?.userSelectedOptions || [])
      setIsVoteDialogOpen(true)
    } catch (error) {
      console.error('获取投票详情失败:', error)
      toast.error('获取投票详情失败')
    }
  }

  // 提交投票
  const handleSubmitVote = async () => {
    if (selectedOptions.length === 0) {
      toast.error('请至少选择一个选项')
      return
    }
    if (selectedVote.type === 'single' && selectedOptions.length !== 1) {
      toast.error('单选投票只能选择一个选项')
      return
    }

    try {
      setSubmitting(true)
      const token = localStorage.getItem('token')
      await api.post(`/vote/${selectedVote.id}/vote`, {
        optionIds: selectedOptions
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('投票成功')
      setIsVoteDialogOpen(false)
      fetchVotes()
    } catch (error) {
      console.error('提交投票失败:', error)
      toast.error(error.response?.data?.error || '提交投票失败')
    } finally {
      setSubmitting(false)
    }
  }

  // 打开统计对话框
  const handleOpenStats = async (vote) => {
    try {
      const token = localStorage.getItem('token')
      const response = await api.get(`/vote/${vote.id}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setVoteStats(response.data?.data)
      setIsStatsDialogOpen(true)
    } catch (error) {
      console.error('获取投票统计失败:', error)
      toast.error('获取投票统计失败')
    }
  }

  // 结束投票
  const handleEndVote = async (voteId) => {
    if (!confirm('确定要结束这个投票吗？')) return

    try {
      const token = localStorage.getItem('token')
      await api.post(`/vote/${voteId}/end`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('投票已结束')
      fetchVotes()
    } catch (error) {
      console.error('结束投票失败:', error)
      toast.error(error.response?.data?.error || '结束投票失败')
    }
  }

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

  if (!currentCourse) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>投票问卷</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">请先选择一个课程</p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">投票问卷</h1>
          <p className="text-muted-foreground mt-1">
            {currentCourse.name} - {isTeacher() ? '管理投票' : '参与投票'}
          </p>
        </div>
        {canCreateVote() && (
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
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
            <div className="text-3xl font-bold text-purple-600">
              {votes.length > 0 
                ? Math.round(votes.reduce((sum, v) => sum + (v.total > 0 ? (v.participants / v.total) * 100 : 0), 0) / votes.length)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vote List */}
      {votes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Vote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">暂无投票</p>
            {canCreateVote() && (
              <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                创建第一个投票
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {votes.map((vote) => {
            const participationRate = vote.total > 0 ? Math.round((vote.participants / vote.total) * 100) : 0
            
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

                  {/* Options Preview */}
                  <div className="space-y-2">
                    {vote.options.slice(0, 3).map((option, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium truncate">{option.text}</span>
                          <span className="text-muted-foreground ml-2">
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
                    {vote.options.length > 3 && (
                      <p className="text-sm text-muted-foreground">还有 {vote.options.length - 3} 个选项...</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {isTeacher() || isStudent() ? (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2"
                          onClick={() => handleOpenStats(vote)}
                        >
                          <BarChart3 className="h-4 w-4" />
                          查看统计
                        </Button>
                        {vote.status === 'active' && isStudent() && (
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleOpenVote(vote)}
                          >
                            {vote.hasVoted ? '修改投票' : '参与投票'}
                          </Button>
                        )}
                        {vote.status === 'active' && isTeacher() && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleEndVote(vote.id)}
                          >
                            结束投票
                          </Button>
                        )}
                      </>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Vote Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>创建投票</DialogTitle>
            <DialogDescription>创建一个新的投票问卷</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">投票标题</Label>
              <Input
                id="title"
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                placeholder="请输入投票标题"
              />
            </div>
            <div className="space-y-2">
              <Label>投票类型</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={createForm.type === 'single'}
                    onChange={() => setCreateForm({ ...createForm, type: 'single' })}
                  />
                  <span>单选</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={createForm.type === 'multiple'}
                    onChange={() => setCreateForm({ ...createForm, type: 'multiple' })}
                  />
                  <span>多选</span>
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">截止时间</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={createForm.deadline}
                onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>投票选项</Label>
              {createForm.options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...createForm.options]
                      newOptions[index] = e.target.value
                      setCreateForm({ ...createForm, options: newOptions })
                    }}
                    placeholder={`选项 ${index + 1}`}
                  />
                  {createForm.options.length > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newOptions = createForm.options.filter((_, i) => i !== index)
                        setCreateForm({ ...createForm, options: newOptions })
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCreateForm({ ...createForm, options: [...createForm.options, ''] })}
              >
                <Plus className="h-4 w-4 mr-2" />
                添加选项
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>取消</Button>
            <Button onClick={handleCreateVote} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vote Dialog */}
      <Dialog open={isVoteDialogOpen} onOpenChange={setIsVoteDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedVote?.title}</DialogTitle>
            <DialogDescription>
              {selectedVote?.type === 'single' ? '请选择一个选项' : '可以选择多个选项'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedVote?.options.map((option) => {
              const isSelected = selectedOptions.includes(option.id)
              return (
                <div
                  key={option.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'
                  }`}
                  onClick={() => {
                    if (selectedVote.type === 'single') {
                      setSelectedOptions([option.id])
                    } else {
                      if (isSelected) {
                        setSelectedOptions(selectedOptions.filter(id => id !== option.id))
                      } else {
                        setSelectedOptions([...selectedOptions, option.id])
                      }
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    {selectedVote.type === 'single' ? (
                      <Radio className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    ) : (
                      <CheckSquare2 className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{option.text}</p>
                      {selectedVote.hasVoted && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {option.votes} 票 ({option.percentage}%)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVoteDialogOpen(false)}>取消</Button>
            <Button onClick={handleSubmitVote} disabled={submitting || selectedOptions.length === 0}>
              {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {selectedVote?.hasVoted ? '修改投票' : '提交投票'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats Dialog */}
      <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{voteStats?.title} - 投票统计</DialogTitle>
            <DialogDescription>
              参与率: {voteStats?.participationRate || 0}% ({voteStats?.participants || 0}/{voteStats?.total || 0})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Options Stats */}
            <div className="space-y-4">
              <h3 className="font-semibold">选项统计</h3>
              {voteStats?.options.map((option, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">{option.text}</span>
                    <span className="text-muted-foreground">
                      {option.votes} 票 ({option.percentage}%)
                    </span>
                  </div>
                  <Progress value={option.percentage} className="h-3" />
                </div>
              ))}
            </div>

            {/* Student Votes */}
            {voteStats?.studentVotes && voteStats.studentVotes.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold">学生投票详情</h3>
                <div className="border rounded-lg divide-y">
                  {voteStats.studentVotes.map((studentVote, index) => (
                    <div key={index} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{studentVote.studentName}</p>
                          <p className="text-sm text-muted-foreground">{studentVote.studentEmail}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(studentVote.submittedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {studentVote.selectedOptions.map((optId, idx) => {
                          const option = voteStats.options.find(opt => opt.id === String(optId))
                          return option ? (
                            <Badge key={idx} variant="outline">{option.text}</Badge>
                          ) : null
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsStatsDialogOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default VoteModule
