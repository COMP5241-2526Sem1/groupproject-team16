import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group.jsx'
import { getApiUrl } from '@/config/api'
import { canCreateQuiz, canTakeQuiz, getCurrentUser } from '@/utils/permissions.js'
import { 
  Brain,
  Sparkles,
  Loader2,
  Target,
  Settings,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Trash2,
  Save,
  Eye,
  Download,
  CheckSquare,
  Plus,
  Search,
  Clock,
  Users,
  Edit,
  Play,
  XCircle
} from 'lucide-react'

const QuizModule = () => {
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState([])
  const [error, setError] = useState(null)
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  
  // 测验列表相关状态
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [isDoingQuiz, setIsDoingQuiz] = useState(false)
  const [userAnswers, setUserAnswers] = useState({})
  const [quizResult, setQuizResult] = useState(null)
  
  // AI generator form state
  const [aiFormData, setAiFormData] = useState({
    topic: '',
    audience: 'Undergraduate',
    questionCount: 5,
    questionTypes: {
      single: true,
      multiple: true,
      judge: true,
      essay: false
    },
    difficulty: 'Medium',
    subjects: ''
  })

  // 获取课程列表
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(getApiUrl('/courses'), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const result = await response.json()
          if (result.success && Array.isArray(result.data)) {
            setCourses(result.data)
            // 默认选择第一个课程
            if (result.data.length > 0) {
              setSelectedCourse(result.data[0].id)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching courses:', error)
      }
    }
    
    fetchCourses()
  }, [])

  // 获取测验列表
  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(getApiUrl('/quiz'), {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      
      if (response.ok) {
        const result = await response.json()
        const list = (result?.data || []).map(q => ({
          ...q,
          deadline: q.deadline ? new Date(q.deadline).toISOString().split('T')[0] : '',
          questions: q.questions || []
        }))
        setQuizzes(list)
      }
    } catch (error) {
      console.error('Failed to fetch quizzes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartQuiz = async (quiz) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(getApiUrl(`/quiz/${quiz.id}`), {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      
      if (response.ok) {
        const result = await response.json()
        setSelectedQuiz(result.data)
        setIsDoingQuiz(true)
        setUserAnswers({})
        setQuizResult(null)
      }
    } catch (error) {
      console.error('Failed to fetch quiz details:', error)
      setSelectedQuiz(quiz)
      setIsDoingQuiz(true)
      setUserAnswers({})
      setQuizResult(null)
    }
  }

  const handleAnswerChange = (questionId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmitQuiz = async () => {
    try {
      console.log('🚀 提交测验，用户答案:', userAnswers)
      
      const token = localStorage.getItem('token')
      
      if (!token) {
        alert('未登录或登录已过期，请重新登录')
        return
      }
      
      const url = getApiUrl(`/quiz/${selectedQuiz.id}/submit`)
      
      console.log('📡 提交到:', url)
      console.log('🔑 Token:', token ? token.substring(0, 20) + '...' : '未设置')
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answers: userAnswers })
      })
      
      console.log('📨 响应状态:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ 服务器返回错误:', errorText)
        
        // 特殊处理403错误
        if (response.status === 403) {
          alert('登录已过期，请重新登录')
          // 可以选择跳转到登录页面
          // window.location.href = '/login'
          return
        }
        
        throw new Error(`提交失败: ${response.status} ${response.statusText}`)
      }
      
      const result = await response.json()
      console.log('✅ 提交成功，结果:', result)
      
      if (result.success && result.data) {
        setQuizResult(result.data)
        setIsDoingQuiz(false)
      } else {
        throw new Error(result.message || result.error || '提交失败')
      }
    } catch (error) {
      console.error('❌ 提交测验出错:', error)
      alert('提交测验失败: ' + error.message)
    }
  }

  const handleDeleteQuiz = async (quizId) => {
    if (!confirm('确认要删除这个测验吗?')) return
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(getApiUrl(`/quiz/${quizId}`), {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      
      if (response.ok) {
        await fetchQuizzes()
      }
    } catch (error) {
      alert('删除测验失败: ' + error.message)
    }
  }

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status) => {
    const config = {
      active: { label: 'Active', variant: 'default' },
      completed: { label: '已结束', variant: 'outline' }
    }
    const s = config[status] || config.active
    return <Badge variant={s.variant}>{s.label}</Badge>
  }

  // AI generator helpers
  const handleAiInputChange = (field, value) => {
    setAiFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleQuestionTypeChange = (type, checked) => {
    setAiFormData(prev => ({
      ...prev,
      questionTypes: {
        ...prev.questionTypes,
        [type]: checked
      }
    }))
  }

  // Generate quiz questions
  const handleGenerateQuestions = async () => {
    if (!aiFormData.topic) {
      setError('Please enter a quiz topic')
      return
    }

    const selectedTypes = Object.entries(aiFormData.questionTypes)
      .filter(([, checked]) => checked)
      .map(([type]) => type)

    if (selectedTypes.length === 0) {
      setError('Please select at least one question type')
      return
    }

    setIsGenerating(true)
    setError(null)
    setGeneratedQuestions([]) // clear previous results

    try {
  // call AI API to generate questions
  console.log('🚀 Starting API call to generate questions...')
      const requestData = {
        topic: aiFormData.topic,
        count: aiFormData.questionCount,
        difficulty: aiFormData.difficulty,
        audience: aiFormData.audience,
        subjects: aiFormData.subjects,
        questionTypes: selectedTypes
      }
  console.log('Request payload:', requestData)

      const response = await fetch(getApiUrl('/agent/generate-quiz'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

    console.log('📡 API response status:', response.status, response.statusText)

      if (!response.ok) {
    const errorText = await response.text()
    console.error('❌ API response error:', errorText)
    throw new Error(`API call failed: ${response.status} ${response.statusText}`)
      }

    const result = await response.json()
    console.log('📦 API returned raw data:', result)

      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        // Convert API response into the format expected by the component
        const formattedQuestions = result.data.map((q, index) => {
    // convert correct answer format
          let correctAnswer = q.correctAnswer
          
          if (q.type === 'SINGLE_CHOICE') {
            // single choice: convert letter to index
            if (typeof correctAnswer === 'string') {
              const letterToIndex = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5 }
              correctAnswer = letterToIndex[correctAnswer.toUpperCase()] || 0
            }
          } else if (q.type === 'MULTIPLE_CHOICE') {
            // multiple choice: ensure array format
            if (typeof correctAnswer === 'string') {
              // if it's a string like "A,C", convert to numeric array
              correctAnswer = correctAnswer.split(',').map(letter => {
                const letterToIndex = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5 }
                return letterToIndex[letter.trim().toUpperCase()] || 0
              })
            } else if (Array.isArray(correctAnswer)) {
              // if it's already an array like ["A", "B"], convert each letter to numeric index
              correctAnswer = correctAnswer.map(letter => {
                if (typeof letter === 'string') {
                  const letterToIndex = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5 }
                  return letterToIndex[letter.trim().toUpperCase()] || 0
                }
                return letter // already a number
              })
            } else {
              correctAnswer = [0] // default
            }
          } else if (q.type === 'TRUE_FALSE') {
            // true/false: ensure boolean (accept both English and Chinese true values)
            if (typeof correctAnswer === 'string') {
              correctAnswer = correctAnswer.toLowerCase() === 'true' || correctAnswer === '正确'
            }
          }

          const formatted = {
            id: q.id || `q_${Date.now()}_${index}`,
            type: mapQuestionType(q.type),
            question: q.question || `Question ${index + 1}`,
            options: Array.isArray(q.options) ? q.options : [],
            correctAnswer: correctAnswer,
            explanation: q.explanation || `This is an example explanation for "${aiFormData.topic}".`,
            score: typeof q.score === 'number' ? q.score : 10,
            difficulty: q.difficulty || aiFormData.difficulty,
            knowledgePoints: Array.isArray(q.knowledgePoints) ? q.knowledgePoints : [`${aiFormData.topic} - related knowledge points`],
            cognitiveLevel: q.cognitiveLevel || 'Understanding',
            estimatedTime: typeof q.estimatedTime === 'number' ? q.estimatedTime : 2
          }
          console.log(`✅ Formatted question ${index + 1}:`, formatted)
          return formatted
        })
        
    setGeneratedQuestions(formattedQuestions)
    console.log(`🎉 Successfully generated ${formattedQuestions.length} questions`)
    setError(null) // clear error state
      } else {
    console.error('❌ API returned data in unexpected format:', result)
    throw new Error('API returned empty or invalid data')
      }

    } catch (error) {
      console.error('Error generating quiz questions:', error)
      
      // provide more detailed error messages based on error type
      let errorMessage = 'Generation failed, please try again'
      if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'Network connection failed, please check your connection'
      } else if (error.message.includes('API call failed') || error.message.includes('API调用失败')) {
        errorMessage = 'Server response error, please try again later'
      } else if (error.message.includes('JSON') || error.message.includes('parse')) {
        errorMessage = 'Data parsing failed, please contact the administrator'
      }
      
      setError(`❌ ${errorMessage}`)
      
  // for demo purposes, provide fallback data in development
      if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Development: providing fallback sample data')
        const sampleQuestions = generateSampleQuestions()
        setGeneratedQuestions(sampleQuestions)
  setError(null) // clear error because we provided fallback data
      }
    } finally {
      setIsGenerating(false)
    }
  }  // map API question types to internal format
  const mapQuestionType = (apiType) => {
  const typeMap = {
      'SINGLE_CHOICE': 'single',
      'MULTIPLE_CHOICE': 'multiple', 
      'TRUE_FALSE': 'judge',
      'ESSAY': 'essay',
  // Support other possible formats
      'single': 'single',
      'multiple': 'multiple',
      'judge': 'judge',
      'essay': 'essay'
    }
    return typeMap[apiType] || 'single' // default to single choice
  }

  // Generate sample questions (development fallback)
  const generateSampleQuestions = () => {
    const questions = []
    let id = 1

    if (aiFormData.questionTypes.single && questions.length < aiFormData.questionCount) {
      questions.push({
        id: id++,
        type: 'single',
    question: `Which of the following descriptions about "${aiFormData.topic}" is correct?`,
      options: ['Option A - example', 'Option B - example', 'Option C - example', 'Option D - example'],
        correctAnswer: 0,
  explanation: 'This is an example AI-generated explanation.',
        score: 10,
        difficulty: aiFormData.difficulty
      })
    }

    if (aiFormData.questionTypes.multiple && questions.length < aiFormData.questionCount) {
      questions.push({
        id: id++,
        type: 'multiple',
    question: `Which of the following are important characteristics of "${aiFormData.topic}"? (multiple)`,
    options: ['Feature A', 'Feature B', 'Feature C', 'Feature D'],
        correctAnswer: [0, 2],
    explanation: 'This is an example explanation generated for a multiple-choice question.',
        score: 15,
        difficulty: aiFormData.difficulty
      })
    }

    if (aiFormData.questionTypes.judge && questions.length < aiFormData.questionCount) {
      questions.push({
        id: id++,
        type: 'judge',
    question: `"${aiFormData.topic}" has a certain property.`,
    correctAnswer: true,
    explanation: 'This is an example explanation generated for a true/false question.',
        score: 10,
        difficulty: aiFormData.difficulty
      })
    }

  // fill up questions to requested count
    while (questions.length < aiFormData.questionCount) {
      questions.push({
        id: id++,
        type: 'single',
    question: `Additional generated ${aiFormData.topic} question ${questions.length + 1}`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 0,
    explanation: 'AI-generated explanation for the additional question.',
    score: 10,
    difficulty: aiFormData.difficulty
  })
    }

    return questions
  }

  // Delete a single question
  const handleDeleteQuestion = (questionId) => {
    setGeneratedQuestions(prev => prev.filter(q => q.id !== questionId))
  }

  // Edit a question
  const handleEditQuestion = (questionId, field, value) => {
    setGeneratedQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, [field]: value } : q
    ))
  }

  // Regenerate a single question
  const handleRegenerateQuestion = async (questionId) => {
    const questionIndex = generatedQuestions.findIndex(q => q.id === questionId)
    if (questionIndex === -1) return

    const currentQuestion = generatedQuestions[questionIndex]
    
    // Set regenerating state
    setGeneratedQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, isRegenerating: true } 
        : q
    ))

    try {
      console.log('🔄 Starting to regenerate question...', {
        questionId,
        currentType: currentQuestion.type,
        topic: aiFormData.topic
      })

      const requestData = {
        topic: aiFormData.topic,
        difficulty: currentQuestion.difficulty || aiFormData.difficulty,
        audience: aiFormData.audience,
        subjects: aiFormData.subjects,
        questionType: currentQuestion.type,
        currentQuestion: {
          type: currentQuestion.type,
          question: currentQuestion.question,
          options: currentQuestion.options,
          correctAnswer: currentQuestion.correctAnswer
        }
      }

  console.log('Regeneration request payload:', requestData)

      const response = await fetch(getApiUrl('/agent/regenerate-quiz-question'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      })

  console.log('📡 Regeneration API response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Regeneration API response error:', errorText)
        throw new Error(`Regeneration failed: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
  console.log('📦 Regeneration API returned data:', result)

      if (result.success && result.data) {
  // convert API response to internal format
        let correctAnswer = result.data.correctAnswer
        
        if (result.data.type === 'SINGLE_CHOICE') {
          // single choice: convert letter to numeric index
          if (typeof correctAnswer === 'string') {
            const letterToIndex = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5 }
            correctAnswer = letterToIndex[correctAnswer.toUpperCase()] || 0
          }
        } else if (result.data.type === 'MULTIPLE_CHOICE') {
          // multiple choice: ensure array format
          if (typeof correctAnswer === 'string') {
            correctAnswer = correctAnswer.split(',').map(letter => {
              const letterToIndex = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5 }
              return letterToIndex[letter.trim().toUpperCase()] || 0
            })
          } else if (Array.isArray(correctAnswer)) {
            // if it's already an array like ["A", "B"], convert each letter to numeric index
            correctAnswer = correctAnswer.map(letter => {
              if (typeof letter === 'string') {
                const letterToIndex = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5 }
                return letterToIndex[letter.trim().toUpperCase()] || 0
              }
              return letter // already a number
            })
          } else {
            correctAnswer = [0]
          }
        } else if (result.data.type === 'TRUE_FALSE') {
          // true/false: ensure boolean
          if (typeof correctAnswer === 'string') {
            correctAnswer = correctAnswer.toLowerCase() === 'true' || correctAnswer === '正确'
          }
        }

        const regeneratedQuestion = {
          id: result.data.id || `regen_${Date.now()}`,
          type: mapQuestionType(result.data.type),
          question: result.data.question || `Regenerated ${aiFormData.topic} question`,
          options: Array.isArray(result.data.options) ? result.data.options : [],
          correctAnswer: correctAnswer,
          explanation: result.data.explanation || `This is a regenerated explanation for "${aiFormData.topic}".`,
          score: typeof result.data.score === 'number' ? result.data.score : currentQuestion.score,
          difficulty: result.data.difficulty || currentQuestion.difficulty,
          knowledgePoints: Array.isArray(result.data.knowledgePoints) ? result.data.knowledgePoints : currentQuestion.knowledgePoints || [`${aiFormData.topic} - related knowledge points`],
          cognitiveLevel: result.data.cognitiveLevel || currentQuestion.cognitiveLevel || 'Understanding',
          estimatedTime: typeof result.data.estimatedTime === 'number' ? result.data.estimatedTime : currentQuestion.estimatedTime || 2,
          tags: Array.isArray(result.data.tags) ? result.data.tags : ['Regenerated'],
          novelty: result.data.novelty || 'Fresh perspective question',
          isRegenerating: false
        }

        // Update question list
        setGeneratedQuestions(prev => prev.map(q => 
          q.id === questionId ? regeneratedQuestion : q
        ))

        console.log(`✅ Question regenerated successfully:`, {
          oldId: questionId,
          newId: regeneratedQuestion.id,
          newQuestion: regeneratedQuestion.question.substring(0, 50) + '...'
        })

        // clear error state
        setError(null)
        
      } else {
        console.error('❌ Regeneration API returned data in unexpected format:', result)
        throw new Error('Regeneration failed: API returned unexpected data format')
      }

    } catch (error) {
      console.error('Error regenerating question:', error)
      
      // remove regenerating state and show error
      setGeneratedQuestions(prev => prev.map(q => 
        q.id === questionId 
          ? { ...q, isRegenerating: false } 
          : q
      ))

      // provide more detailed error messages based on error type
      let errorMessage = 'Regeneration failed, please try again'
      if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'Network connection failed, please check your connection'
      } else if (error.message.includes('Regeneration failed')) {
        errorMessage = 'Server response error, please try again later'
      }

      setError(`❌ ${errorMessage}`)

      // provide fallback in development for demo
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Development: providing fallback regeneration')
        setTimeout(() => {
          const fallbackQuestion = {
            ...currentQuestion,
            id: `fallback_${Date.now()}`,
            question: `Regenerated ${aiFormData.topic} question - ${new Date().toLocaleTimeString()}`,
            novelty: 'Development fallback regeneration',
            tags: [...(currentQuestion.tags || []), 'Fallback Regeneration'],
            isRegenerating: false
          }
          
          setGeneratedQuestions(prev => prev.map(q => 
            q.id === questionId ? fallbackQuestion : q
          ))
          
          setError(null) // clear error because we provided fallback
        }, 1000)
      }
    }
  }

  // 保存AI生成的测验到数据库
  const handleSaveAsQuiz = async () => {
    if (!selectedCourse) {
      setError('❌ 请先选择一个课程')
      return
    }

    if (!generatedQuestions || generatedQuestions.length === 0) {
      setError('❌ 没有可保存的题目')
      return
    }

    setIsSaving(true)
    setError(null)
    setSaveSuccess(false)

    try {
      const token = localStorage.getItem('token')
      
      // 生成测验标题
      const quizTitle = aiFormData.topic 
        ? `${aiFormData.topic} Quiz` 
        : 'AI Generated Quiz'

      const requestData = {
        title: quizTitle,
        courseId: selectedCourse,
        questions: generatedQuestions
      }

      console.log('💾 Saving quiz to database:', requestData)

      const response = await fetch(getApiUrl('/quiz/save-ai-generated'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      })

      console.log('📡 Save API response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Save API error:', errorText)
        throw new Error(`保存失败: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ Quiz saved successfully:', result)

      if (result.success) {
        setSaveSuccess(true)
        setError(null)
        
        // 显示成功消息3秒后清除
        setTimeout(() => {
          setSaveSuccess(false)
        }, 3000)
      } else {
        throw new Error(result.message || '保存失败')
      }

    } catch (error) {
      console.error('Error saving quiz:', error)
      
      let errorMessage = '保存测验失败，请重试'
      if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
        errorMessage = '网络连接失败，请检查网络连接'
      } else if (error.message.includes('401') || error.message.includes('403')) {
        errorMessage = '未授权，请先登录'
      } else if (error.message.includes('404')) {
        errorMessage = '课程不存在，请选择其他课程'
      }
      
      setError(`❌ ${errorMessage}`)
    } finally {
      setIsSaving(false)
    }
  }

  // 答题界面
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
            <span>Duration: {selectedQuiz.duration} minutes</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{selectedQuiz.title}</CardTitle>
            <CardDescription>
              Total Questions: {selectedQuiz.totalQuestions} | Total Score: {selectedQuiz.totalScore} | Passing Score: {selectedQuiz.passScore}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedQuiz.questions.map((question, index) => (
              <Card key={question.id}>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium">
                      {index + 1}. {question.question}
                      <span className="text-sm text-muted-foreground ml-2">({question.score}pts)</span>
                    </h3>
                    <Badge variant="outline">
                      {question.type === 'singlechoice' ? 'single choice' : 
                       question.type === 'multiplechoice' ? 'multiple choice' : 
                       question.type === 'truefalse' ? 'true·false' : 'short answer'}
                    </Badge>
                  </div>

                  {(question.type === 'singlechoice' || question.type === 'single') && (
                    <RadioGroup
                      value={userAnswers[question.id] !== undefined ? userAnswers[question.id].toString() : undefined}
                      onValueChange={(value) => handleAnswerChange(question.id, parseInt(value))}
                    >
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center space-x-2">
                          <RadioGroupItem value={optIndex.toString()} id={`q${question.id}-${optIndex}`} />
                          <Label htmlFor={`q${question.id}-${optIndex}`} className="cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {(question.type === 'multiplechoice' || question.type === 'multiple') && (
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
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}

                  {(question.type === 'truefalse' || question.type === 'judge') && (
                    <RadioGroup
                      value={userAnswers[question.id] !== undefined ? String(userAnswers[question.id]) : undefined}
                      onValueChange={(value) => handleAnswerChange(question.id, value === 'true')}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id={`q${question.id}-true`} />
                        <Label htmlFor={`q${question.id}-true`} className="cursor-pointer">正确</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id={`q${question.id}-false`} />
                        <Label htmlFor={`q${question.id}-false`} className="cursor-pointer">错误</Label>
                      </div>
                    </RadioGroup>
                  )}

                  {(question.type === 'essay') && (
                    <Textarea
                      placeholder="请输入您的答案..."
                      rows={5}
                      value={userAnswers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    />
                  )}
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-between items-center gap-2 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Answered Questions: {Object.keys(userAnswers).length} / {selectedQuiz.questions.length}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsDoingQuiz(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitQuiz} 
                  size="lg"
                  disabled={Object.keys(userAnswers).length === 0}
                >
                  Submit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 测验结果界面
  if (quizResult && selectedQuiz) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => { setSelectedQuiz(null); setQuizResult(null) }} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Return to Quiz List
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
                  {quizResult.passed ? 'Congratulations! You have passed the quiz!' : 'Unfortunately, you did not pass.'}
                </CardTitle>
                <CardDescription className="text-xl mt-2">
                  Your Score: {quizResult.score} / {quizResult.totalScore}
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
                  {Object.values(quizResult.results).filter(r => r.isCorrect === true).length}
                </div>
                <div className="text-sm text-muted-foreground">Correct Answers</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {Math.round((quizResult.score / quizResult.totalScore) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Accuracy Rate</div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <h3 className="font-semibold">答题详情</h3>
              {selectedQuiz.questions.map((question, index) => {
                const result = quizResult.results[question.id]
                const isPending = result.isCorrect === 'pending'
                const isCorrect = result.isCorrect === true
                
                return (
                  <div key={question.id} className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                    {isPending ? (
                      <Clock className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    ) : isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">
                        No. {index + 1}  
                        {isPending && <Badge variant="outline" className="ml-2 text-yellow-600 border-yellow-600">pending</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground">{question.question}</div>
                    </div>
                    <div className="text-sm font-medium">{question.score}pts</div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // AI generator UI
  if (showAIGenerator) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Button variant="ghost" onClick={() => setShowAIGenerator(false)} className="gap-2 mb-2">
              <ArrowLeft className="h-4 w-4" />
              Back to quizzes
            </Button>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              Quiz AI Generator
            </h1>
            <p className="text-muted-foreground mt-1">Generate quizzes across multiple question types with standard answers</p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Top input area */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Define content to generate
                </CardTitle>
                <CardDescription>Set basic quiz parameters and scope</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic">Quiz Topic *</Label>
                    <Input 
                      id="topic" 
                      placeholder="e.g., Data Structures and Algorithms"
                      value={aiFormData.topic}
                      onChange={(e) => handleAiInputChange('topic', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="audience">Audience</Label>
                    <select 
                      id="audience"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={aiFormData.audience}
                      onChange={(e) => handleAiInputChange('audience', e.target.value)}
                    >
                      <option value="High School">High School</option>
                      <option value="Undergraduate">Undergraduate</option>
                      <option value="Postgraduate">Postgraduate</option>
                      <option value="Professional">Professional</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="questionCount">Number of Questions</Label>
                    <Input 
                      id="questionCount" 
                      type="number"
                      min="1"
                      max="20"
                      value={aiFormData.questionCount}
                      onChange={(e) => handleAiInputChange('questionCount', parseInt(e.target.value) || 5)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <select 
                      id="difficulty"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={aiFormData.difficulty}
                      onChange={(e) => handleAiInputChange('difficulty', e.target.value)}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                      <option value="Mixed">Mixed</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subjects">Subjects / Topics (optional)</Label>
                  <Textarea 
                    id="subjects" 
                    placeholder="e.g., Stack, Queue, Linked List, Binary Tree..."
                    rows={3}
                    value={aiFormData.subjects}
                    onChange={(e) => handleAiInputChange('subjects', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Middle control area */}
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Generation settings
                </CardTitle>
                <CardDescription>Choose question types and trigger generation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-base font-medium mb-3 block">Select question types</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="single"
                        checked={aiFormData.questionTypes.single}
                        onCheckedChange={(checked) => handleQuestionTypeChange('single', checked)}
                      />
                      <Label htmlFor="single" className="cursor-pointer">Single Choice</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="multiple"
                        checked={aiFormData.questionTypes.multiple}
                        onCheckedChange={(checked) => handleQuestionTypeChange('multiple', checked)}
                      />
                      <Label htmlFor="multiple" className="cursor-pointer">Multiple Choice</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="judge"
                        checked={aiFormData.questionTypes.judge}
                        onCheckedChange={(checked) => handleQuestionTypeChange('judge', checked)}
                      />
                      <Label htmlFor="judge" className="cursor-pointer">True / False</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="essay"
                        checked={aiFormData.questionTypes.essay}
                        onCheckedChange={(checked) => handleQuestionTypeChange('essay', checked)}
                      />
                      <Label htmlFor="essay" className="cursor-pointer">Short Answer</Label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    className="w-full gap-2" 
                    size="lg"
                    onClick={handleGenerateQuestions}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        AI is generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Generate Quiz Questions
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Main display area */}
            {generatedQuestions.length > 0 && (
              <Card className="border-2 border-primary/50">
                <CardHeader>
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="h-5 w-5" />
                          Generation successful! {generatedQuestions.length} questions generated
                        </CardTitle>
                        <CardDescription>You can edit questions or regenerate individual ones</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {/* <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="h-4 w-4" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="h-4 w-4" />
                          Export
                        </Button> */}
                      </div>
                    </div>
                    
                    {/* 课程选择和保存区域 */}
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-4 bg-muted/50 rounded-lg border border-muted">
                      <div className="flex-1 w-full sm:w-auto">
                        <Label htmlFor="course-select" className="text-sm font-medium mb-2 block">
                          Select Course *
                        </Label>
                        <select
                          id="course-select"
                          value={selectedCourse}
                          onChange={(e) => setSelectedCourse(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          disabled={isSaving}
                        >
                          {courses.length === 0 && (
                            <option value="">No courses available</option>
                          )}
                          {courses.map(course => (
                            <option key={course.id} value={course.id}>
                              {course.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <Button 
                        size="lg" 
                        className="gap-2 w-full sm:w-auto sm:mt-6" 
                        onClick={handleSaveAsQuiz}
                        disabled={isSaving || !selectedCourse || saveSuccess}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : saveSuccess ? (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Saved!
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save as Quiz
                          </>
                        )}
                      </Button>
                    </div>

                    {/* 保存成功提示 */}
                    {saveSuccess && (
                      <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-medium">Successfully saved to the course!</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {generatedQuestions.map((question, index) => (
                    <Card key={question.id} className="border border-muted">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center">
                                  {index + 1}
                                </span>
                                <Badge variant="outline">
                         {question.type === 'single' ? 'Single' : 
                          question.type === 'multiple' ? 'Multiple' : 
                          question.type === 'judge' ? 'True/False' : 'Short Answer'}
                                </Badge>
                        <Badge variant="secondary">{question.score} pts</Badge>
                                <Badge variant="outline">{question.difficulty}</Badge>
                                <Badge variant="default" className="text-xs">
                                  {question.cognitiveLevel}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {question.estimatedTime} min
                                </Badge>
                                {question.tags && question.tags.includes('Regenerated') && (
                                  <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                                    ✨ Regenerated
                                  </Badge>
                                )}
                                {question.novelty && question.novelty !== 'AI-generated novel question' && (
                                  <Badge variant="outline" className="text-xs border-blue-500 text-blue-600" title={question.novelty}>
                                    💡 Novel
                                  </Badge>
                                )}
                              </div>
                              <Textarea
                                value={question.question}
                                onChange={(e) => handleEditQuestion(question.id, 'question', e.target.value)}
                                className="font-medium resize-none"
                                rows={2}
                              />
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <Button 
                                variant="outline" 
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleRegenerateQuestion(question.id)}
                                disabled={question.isRegenerating || isGenerating}
                                title="Regenerate this question"
                              >
                                {question.isRegenerating ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <RefreshCw className="h-4 w-4" />
                                )}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteQuestion(question.id)}
                                disabled={question.isRegenerating || isGenerating}
                                title="Delete this question"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Multiple-choice options */}
                          {(question.type === 'single' || question.type === 'multiple') && question.options && (
                            <div className="space-y-2 pl-8">
                              {question.options.map((option, optIndex) => {
                                const isCorrect = question.type === 'single' 
                                  ? question.correctAnswer === optIndex
                                  : Array.isArray(question.correctAnswer) && question.correctAnswer.includes(optIndex)
                                
                                return (
                                  <div key={optIndex} className="flex items-center gap-2">
                                    <span className="text-sm font-medium w-6">
                                      {String.fromCharCode(65 + optIndex)}.
                                    </span>
                                    <Input
                                      value={option}
                                      onChange={(e) => {
                                        const newOptions = [...question.options]
                                        newOptions[optIndex] = e.target.value
                                        handleEditQuestion(question.id, 'options', newOptions)
                                      }}
                                      className="flex-1"
                                    />
                                    {/* Click to set as correct answer */}
                                    <Checkbox
                                      checked={question.type === 'single' 
                                        ? question.correctAnswer === optIndex
                                        : Array.isArray(question.correctAnswer) && question.correctAnswer.includes(optIndex)}
                                      onCheckedChange={() => {
                                        if (question.type === 'single') {
                                          handleEditQuestion(question.id, 'correctAnswer', optIndex)
                                        } else {
                                          const currentAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer : []
                                          const newAnswers = currentAnswers.includes(optIndex) 
                                            ? currentAnswers.filter(idx => idx !== optIndex)
                                            : [...currentAnswers, optIndex]
                                          handleEditQuestion(question.id, 'correctAnswer', newAnswers)
                                        }
                                      }}
                                      title={question.type === 'single' ? 'Set as correct answer' : 'Toggle correct answer'}
                                    />
                                  </div>
                                )
                              })}
                            </div>
                          )}

                          {/* True/False answer controls */}
                          {question.type === 'judge' && (
                            <div className="pl-8">
                              <div className="flex items-center gap-4">
                                <span className="text-sm font-medium">Correct answer:</span>
                                <div className="flex gap-2">
                                  <Button
                                    variant={question.correctAnswer === true ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleEditQuestion(question.id, 'correctAnswer', true)}
                                  >
                                    True
                                  </Button>
                                  <Button
                                    variant={question.correctAnswer === false ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleEditQuestion(question.id, 'correctAnswer', false)}
                                  >
                                    False
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Explanation */}
                          {question.explanation && (
                            <div className="pl-8">
                              <Label className="text-sm font-medium mb-2 block">Explanation</Label>
                              <Textarea
                                value={question.explanation}
                                onChange={(e) => handleEditQuestion(question.id, 'explanation', e.target.value)}
                                rows={3}
                                className="text-sm"
                                placeholder="Add explanation..."
                              />
                            </div>
                          )}

                          {/* Knowledge points */}
                          {question.knowledgePoints && question.knowledgePoints.length > 0 && (
                            <div className="pl-8">
                              <Label className="text-sm font-medium mb-2 block">Knowledge Points</Label>
                              <div className="flex flex-wrap gap-2">
                                {question.knowledgePoints.map((point, pointIndex) => (
                                  <Badge key={pointIndex} variant="outline" className="text-xs">
                                    {point}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Generation stats */}
            <Card>
              <CardHeader>
                <CardTitle>Generation Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Questions generated</span>
                  <span className="font-semibold">{generatedQuestions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total points</span>
                  <span className="font-semibold">
                    {generatedQuestions.reduce((sum, q) => sum + q.score, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Estimated duration</span>
                  <span className="font-semibold">
                    {generatedQuestions.reduce((sum, q) => sum + (q.estimatedTime || 2), 0)} min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Cognitive levels</span>
                  <span className="font-semibold text-xs">
                    {[...new Set(generatedQuestions.map(q => q.cognitiveLevel || 'Understanding'))].join(' / ')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* How to use */}
            <Card>
              <CardHeader>
                  <CardTitle>How to use</CardTitle>
                </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      1
                    </div>
                    <div>
                      <div className="font-medium">Fill in basic information</div>
                      <div className="text-muted-foreground text-xs">Topic, audience, question count, etc.</div>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      2
                    </div>
                    <div>
                      <div className="font-medium">Select question types</div>
                      <div className="text-muted-foreground text-xs">Select at least one type</div>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      3
                    </div>
                    <div>
                      <div className="font-medium">Generate with AI</div>
                      <div className="text-muted-foreground text-xs">Click the generate button</div>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      4
                    </div>
                    <div>
                      <div className="font-medium">Edit and save</div>
                      <div className="text-muted-foreground text-xs">Fine-tune then save as a quiz</div>
                    </div>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // main quiz list view
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quiz</h1>
          <p className="text-muted-foreground mt-2">Online quiz and exam system</p>
        </div>
        <div className="flex gap-2">
          {canCreateQuiz() && (
            <Button onClick={() => setShowAIGenerator(true)} className="gap-2" variant="default">
              <Brain className="h-4 w-4" />
              Generate with AI
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search Quizzes..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="pl-9" 
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Brain className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">还没有测验</p>
              <p className="text-sm mb-4">使用AI生成器快速创建测验</p>
              {canCreateQuiz() && (
                <Button onClick={() => setShowAIGenerator(true)} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  开始生成
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
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
                    <span>{quiz.duration} mins</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckSquare className="h-4 w-4" />
                    <span>{quiz.totalQuestions} questions</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{quiz.submitted}/{quiz.totalStudents} submitted</span>
                  </div>
                  <div className="text-muted-foreground">
                    ddl: {quiz.deadline || '无'}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">progress</span>
                    <span className="font-medium">
                      {quiz.totalStudents > 0 
                        ? Math.round((quiz.submitted / quiz.totalStudents) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300" 
                      style={{ 
                        width: `${quiz.totalStudents > 0 
                          ? (quiz.submitted / quiz.totalStudents) * 100 
                          : 0}%` 
                      }} 
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  {canTakeQuiz() && (
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1 gap-1" 
                      onClick={() => handleStartQuiz(quiz)} 
                      disabled={quiz.status === 'completed' || quiz.questions.length === 0}
                    >
                      <Play className="h-4 w-4" />
                      {quiz.questions.length > 0 ? 'start' : 'no questions'}
                    </Button>
                  )}
      
                  {canCreateQuiz() && (
                    <>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteQuiz(quiz.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default QuizModule
