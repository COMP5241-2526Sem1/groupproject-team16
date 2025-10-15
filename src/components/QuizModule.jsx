import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.jsx'
import { 
  CheckSquare, 
  Plus, 
  Search,
  Clock,
  Users,
  Edit,
  Trash2,
  Play,
  ArrowLeft,
  CheckCircle2,
  XCircle
} from 'lucide-react'

const QuizModule = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [isDoingQuiz, setIsDoingQuiz] = useState(false)
  const [userAnswers, setUserAnswers] = useState({})
  const [quizResult, setQuizResult] = useState(null)
  
  const [quizzes, setQuizzes] = useState([
    {
      id: 1,
      title: '第三章测验 - 数据结构基础',
      description: '考查栈、队列、链表等基础数据结构',
      duration: 30,
      totalQuestions: 3,
      totalScore: 35,
      passScore: 21,
      status: 'active',
      deadline: '2025-10-20',
      submitted: 45,
      totalStudents: 52,
      questions: [
        {
          id: 1,
          type: 'single',
          question: '栈的特点是什么?',
          options: ['先进先出', '先进后出', '随机访问', '顺序访问'],
          correctAnswer: 1,
          score: 10
        },
        {
          id: 2,
          type: 'multiple',
          question: '以下哪些是线性数据结构?',
          options: ['数组', '链表', '树', '栈'],
          correctAnswer: [0, 1, 3],
          score: 15
        },
        {
          id: 3,
          type: 'judge',
          question: '队列是一种后进先出的数据结构',
          correctAnswer: false,
          score: 10
        }
      ]
    },
    {
      id: 2,
      title: '期中测验 - 算法设计',
      description: '涵盖排序、查找、递归等算法',
      duration: 60,
      totalQuestions: 0,
      totalScore: 100,
      passScore: 60,
      status: 'active',
      deadline: '2025-10-25',
      submitted: 38,
      totalStudents: 52,
      questions: []
    }
  ])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30,
    passScore: 60
  })

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreate = () => {
    const newQuiz = {
      id: quizzes.length + 1,
      ...formData,
      totalQuestions: 0,
      totalScore: 0,
      status: 'active',
      submitted: 0,
      totalStudents: 52,
      questions: [],
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
    setQuizzes([newQuiz, ...quizzes])
    setIsCreateDialogOpen(false)
    setFormData({ title: '', description: '', duration: 30, passScore: 60 })
  }

  const handleDelete = (quizId) => {
    if (confirm('Confirm要Delete这个测验吗?')) {
      setQuizzes(quizzes.filter(quiz => quiz.id !== quizId))
    }
  }

  const handleStartQuiz = (quiz) => {
    setSelectedQuiz(quiz)
    setIsDoingQuiz(true)
    setUserAnswers({})
    setQuizResult(null)
  }

  const handleAnswerChange = (questionId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmitQuiz = () => {
    let score = 0
    const results = {}

    selectedQuiz.questions.forEach(question => {
      const userAnswer = userAnswers[question.id]
      let isCorrect = false

      if (question.type === 'single') {
        isCorrect = userAnswer === question.correctAnswer
      } else if (question.type === 'multiple') {
        isCorrect = JSON.stringify(userAnswer?.sort()) === JSON.stringify(question.correctAnswer.sort())
      } else if (question.type === 'judge') {
        isCorrect = userAnswer === question.correctAnswer
      }

      if (isCorrect) {
        score += question.score
      }

      results[question.id] = {
        isCorrect,
        userAnswer,
        correctAnswer: question.correctAnswer
      }
    })

    setQuizResult({
      score,
      totalScore: selectedQuiz.totalScore,
      passed: score >= selectedQuiz.passScore,
      results
    })
    setIsDoingQuiz(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const getStatusBadge = (status) => {
    const config = {
      active: { label: 'Active', variant: 'default' },
      completed: { label: '已结束', variant: 'outline' }
    }
    return <Badge variant={config[status].variant}>{config[status].label}</Badge>
  }

  if (isDoingQuiz && selectedQuiz) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setIsDoingQuiz(false)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Time Limit {selectedQuiz.duration} minutes</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{selectedQuiz.title}</CardTitle>
            <CardDescription>
              Total {selectedQuiz.totalQuestions} questions | Total Score {selectedQuiz.totalScore} 分 | Passing Score {selectedQuiz.passScore} 分
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedQuiz.questions.map((question, index) => (
              <Card key={question.id}>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium">
                      {index + 1}. {question.question}
                      <span className="text-sm text-muted-foreground ml-2">({question.score}分)</span>
                    </h3>
                    <Badge variant="outline">
                      {question.type === 'single' ? 'Single Choice' : question.type === 'multiple' ? 'Multiple Choice' : 'True/False'}
                    </Badge>
                  </div>

                  {question.type === 'single' && (
                    <RadioGroup
                      value={userAnswers[question.id]?.toString()}
                      onValueChange={(value) => handleAnswerChange(question.id, parseInt(value))}
                    >
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center space-x-2">
                          <RadioGroupItem value={optIndex.toString()} id={`q${question.id}-${optIndex}`} />
                          <Label htmlFor={`q${question.id}-${optIndex}`} className="cursor-pointer">
                            {String.fromCharCode(65 + optIndex)}. {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {question.type === 'multiple' && (
                    <div className="space-y-2">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center space-x-2">
                          <Checkbox
                            id={`q${question.id}-${optIndex}`}
                            checked={userAnswers[question.id]?.includes(optIndex)}
                            onCheckedChange={(checked) => {
                              const current = userAnswers[question.id] || []
                              const updated = checked
                                ? [...current, optIndex]
                                : current.filter(i => i !== optIndex)
                              handleAnswerChange(question.id, updated)
                            }}
                          />
                          <Label htmlFor={`q${question.id}-${optIndex}`} className="cursor-pointer">
                            {String.fromCharCode(65 + optIndex)}. {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === 'judge' && (
                    <RadioGroup
                      value={userAnswers[question.id]?.toString()}
                      onValueChange={(value) => handleAnswerChange(question.id, value === 'true')}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id={`q${question.id}-true`} />
                        <Label htmlFor={`q${question.id}-true`} className="cursor-pointer">True</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id={`q${question.id}-false`} />
                        <Label htmlFor={`q${question.id}-false`} className="cursor-pointer">False</Label>
                      </div>
                    </RadioGroup>
                  )}
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-end">
              <Button onClick={handleSubmitQuiz} size="lg">
                Submit测验
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (quizResult && selectedQuiz) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => { setSelectedQuiz(null); setQuizResult(null) }} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back测验列表
        </Button>

        <Card>
          <CardHeader>
            <div className="text-center space-y-4">
              {quizResult.passed ? (
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500 mx-auto" />
              )}
              <div>
                <CardTitle className="text-3xl">
                  {quizResult.passed ? 'Congratulations! You Passed!' : 'Not Passed'}
                </CardTitle>
                <CardDescription className="text-xl mt-2">
                  Score: {quizResult.score} / {quizResult.totalScore}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{quizResult.score}</div>
                <div className="text-sm text-muted-foreground">Total Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {Object.values(quizResult.results).filter(r => r.isCorrect).length}
                </div>
                <div className="text-sm text-muted-foreground">Truequestions数</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {Math.round((quizResult.score / quizResult.totalScore) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">True率</div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <h3 className="font-semibold">答questions详情</h3>
              {selectedQuiz.questions.map((question, index) => {
                const result = quizResult.results[question.id]
                return (
                  <div key={question.id} className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                    {result.isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">第 {index + 1} questions</div>
                      <div className="text-sm text-muted-foreground">{question.question}</div>
                    </div>
                    <div className="text-sm font-medium">{question.score}分</div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Quiz测验</h1>
        <p className="text-muted-foreground mt-2">Online quiz and exam system</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search测验..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create测验
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredQuizzes.map((quiz) => (
          <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                  <CardDescription>{quiz.description}</CardDescription>
                </div>
                {getStatusBadge(quiz.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{quiz.duration} minutes</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckSquare className="h-4 w-4" />
                  <span>{quiz.totalQuestions} questions</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{quiz.submitted}/{quiz.totalStudents} 已Submit</span>
                </div>
                <div className="text-muted-foreground">截止: {quiz.deadline}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Submit进度</span>
                  <span className="font-medium">{Math.round((quiz.submitted / quiz.totalStudents) * 100)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(quiz.submitted / quiz.totalStudents) * 100}%` }} />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="default" size="sm" className="flex-1" onClick={() => handleStartQuiz(quiz)} disabled={quiz.status === 'completed' || quiz.questions.length === 0}>
                  <Play className="h-4 w-4 mr-1" />
                  {quiz.questions.length > 0 ? 'Start Quiz' : 'No questions'}
                </Button>
                <Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(quiz.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create新测验</DialogTitle>
            <DialogDescription>Set up basic quiz information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">测验Title *</Label>
              <Input id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="例如: 第三章测验" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Quiz Description</Label>
              <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="简要描述测验Content" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration(minutes) *</Label>
                <Input id="duration" name="duration" type="number" value={formData.duration} onChange={handleInputChange} min="1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passScore">Passing Score *</Label>
                <Input id="passScore" name="passScore" type="number" value={formData.passScore} onChange={handleInputChange} min="0" max="100" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!formData.title}>Create测验</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default QuizModule

