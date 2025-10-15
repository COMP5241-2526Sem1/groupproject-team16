import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx'
import { FileText, Plus, Search, Calendar, Users, Edit, Trash2, Upload, Download, ArrowLeft, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

const HomeworkModule = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedHomework, setSelectedHomework] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [homeworks, setHomeworks] = useState([
    {
      id: 1,
      title: '第三章编程作业 - 链表实现',
      description: '实现单链表的基本操作,包括插入、Delete、查找等功能',
      dueDate: '2025-10-20 23:59',
      totalScore: 100,
      status: 'active',
      submitted: 38,
      totalStudents: 52,
      attachments: ['作业要求.pdf', '测试用例.zip'],
      submissions: [
        { id: 1, studentName: '张三', studentId: '2021001', submitTime: '2025-10-15 14:30', files: ['homework.py'], score: null, status: 'submitted' },
        { id: 2, studentName: '李四', studentId: '2021002', submitTime: '2025-10-16 09:20', files: ['solution.cpp'], score: 95, status: 'graded' }
      ]
    },
    {
      id: 2,
      title: '算法分析报告',
      description: '分析快速排序和归并排序的时间复杂度,并进行实验验证',
      dueDate: '2025-10-25 23:59',
      totalScore: 100,
      status: 'active',
      submitted: 25,
      totalStudents: 52,
      attachments: ['报告模板.docx'],
      submissions: []
    }
  ])

  const [formData, setFormData] = useState({ title: '', description: '', dueDate: '', totalScore: 100 })

  const filteredHomeworks = homeworks.filter(hw => hw.title.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleCreate = () => {
    const newHomework = { id: homeworks.length + 1, ...formData, status: 'active', submitted: 0, totalStudents: 52, attachments: [], submissions: [] }
    setHomeworks([newHomework, ...homeworks])
    setIsCreateDialogOpen(false)
    setFormData({ title: '', description: '', dueDate: '', totalScore: 100 })
  }

  const handleDelete = (hwId) => {
    if (confirm('Confirm要Delete这个作业吗?')) {
      setHomeworks(homeworks.filter(hw => hw.id !== hwId))
    }
  }

  const handleViewDetails = (hw) => {
    setSelectedHomework(hw)
    setIsSubmitting(false)
  }

  const handleStartSubmit = () => setIsSubmitting(true)

  const handleSubmit = () => {
    alert('作业Submit成功!')
    setIsSubmitting(false)
    setSelectedHomework(null)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const getStatusBadge = (status) => {
    const config = { active: { label: 'Active', variant: 'default', icon: Clock }, closed: { label: 'Closed', variant: 'outline', icon: AlertCircle } }
    const { label, variant, icon: Icon } = config[status]
    return <Badge variant={variant} className="gap-1"><Icon className="h-3 w-3" />{label}</Badge>
  }

  const getSubmissionStatusBadge = (status) => {
    const config = { submitted: { label: '已Submit', variant: 'secondary' }, graded: { label: 'Graded', variant: 'default' } }
    return <Badge variant={config[status].variant}>{config[status].label}</Badge>
  }

  if (selectedHomework && !isSubmitting) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setSelectedHomework(null)} className="gap-2"><ArrowLeft className="h-4 w-4" />Back作业列表</Button>
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl">{selectedHomework.title}</CardTitle>
                <CardDescription>{selectedHomework.description}</CardDescription>
              </div>
              {getStatusBadge(selectedHomework.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div><div className="text-sm text-muted-foreground">Deadline</div><div className="font-medium">{selectedHomework.dueDate}</div></div>
              <div><div className="text-sm text-muted-foreground">Total Score</div><div className="font-medium">{selectedHomework.totalScore} 分</div></div>
              <div><div className="text-sm text-muted-foreground">Submit情况</div><div className="font-medium">{selectedHomework.submitted}/{selectedHomework.totalStudents} 人</div></div>
            </div>

            {selectedHomework.attachments.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Homework Attachments</h3>
                <div className="space-y-2">
                  {selectedHomework.attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{file}</span></div>
                      <Button variant="ghost" size="sm" className="gap-1"><Download className="h-4 w-4" />Download</Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleStartSubmit} disabled={selectedHomework.status === 'closed'} className="gap-2"><Upload className="h-4 w-4" />Submit作业</Button>
              <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />批量DownloadSubmit</Button>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <h3 className="font-semibold">StudentSubmit情况 ({selectedHomework.submissions.length})</h3>
              {selectedHomework.submissions.length > 0 ? (
                <div className="space-y-2">
                  {selectedHomework.submissions.map((submission) => (
                    <Card key={submission.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="font-medium">{submission.studentName}</span>
                              <span className="text-sm text-muted-foreground">{submission.studentId}</span>
                              {getSubmissionStatusBadge(submission.status)}
                            </div>
                            <div className="text-sm text-muted-foreground">Submit时间: {submission.submitTime}</div>
                            <div className="flex gap-2">{submission.files.map((file, idx) => <Badge key={idx} variant="outline">{file}</Badge>)}</div>
                          </div>
                          <div className="text-right space-y-2">
                            {submission.score !== null ? <div className="text-2xl font-bold text-primary">{submission.score}</div> : <Button size="sm">Grade</Button>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : <p className="text-center text-muted-foreground py-8">暂无Submit</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSubmitting && selectedHomework) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setIsSubmitting(false)} className="gap-2"><ArrowLeft className="h-4 w-4" />Back</Button>
        <Card>
          <CardHeader>
            <CardTitle>Submit作业: {selectedHomework.title}</CardTitle>
            <CardDescription>Upload your homework file</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Homework File *</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-2">Click or drag files here to upload</p>
                <p className="text-xs text-muted-foreground">Supports .zip, .rar, .pdf, .doc, .docx formats</p>
                <Button variant="outline" className="mt-4">Choose File</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">Notes</Label>
              <Textarea id="comment" placeholder="Add notes or comments(可选)" rows={4} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit} className="gap-2"><CheckCircle2 className="h-4 w-4" />确认Submit</Button>
              <Button variant="outline" onClick={() => setIsSubmitting(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Homework Management</h1>
        <p className="text-muted-foreground mt-2">Publish和管理课程作业</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search作业..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2"><Plus className="h-4 w-4" />Publish作业</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredHomeworks.map((hw) => (
          <Card key={hw.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{hw.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{hw.description}</CardDescription>
                </div>
                {getStatusBadge(hw.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /><span>{hw.dueDate}</span></div>
                <div className="flex items-center gap-2 text-muted-foreground"><FileText className="h-4 w-4" /><span>{hw.totalScore} 分</span></div>
                <div className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" /><span>{hw.submitted}/{hw.totalStudents} 已Submit</span></div>
                {hw.attachments.length > 0 && <div className="flex items-center gap-2 text-muted-foreground"><Download className="h-4 w-4" /><span>{hw.attachments.length} attachments</span></div>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Submit进度</span>
                  <span className="font-medium">{Math.round((hw.submitted / hw.totalStudents) * 100)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(hw.submitted / hw.totalStudents) * 100}%` }} />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="default" size="sm" className="flex-1" onClick={() => handleViewDetails(hw)}>View Details</Button>
                <Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(hw.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Publish新作业</DialogTitle>
            <DialogDescription>Set up basic homework information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">作业Title *</Label>
              <Input id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="例如: 第三章编程作业" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Homework Description *</Label>
              <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="详细描述作业要求和Content" rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Deadline *</Label>
                <Input id="dueDate" name="dueDate" type="datetime-local" value={formData.dueDate} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalScore">Total Score *</Label>
                <Input id="totalScore" name="totalScore" type="number" value={formData.totalScore} onChange={handleInputChange} min="1" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!formData.title || !formData.description || !formData.dueDate}>Publish作业</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default HomeworkModule

