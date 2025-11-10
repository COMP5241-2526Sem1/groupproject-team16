import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
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
  Download
} from 'lucide-react'

const QuizModule = () => {
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState([])
  const [error, setError] = useState(null)
  
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

      const response = await fetch('/api/agent/generate-quiz', {
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
            } else if (!Array.isArray(correctAnswer)) {
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

      const response = await fetch('/api/agent/regenerate-quiz-question', {
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
          } else if (!Array.isArray(correctAnswer)) {
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
                  
                  {/* Dev-only test button */}
                  {process.env.NODE_ENV === 'development' && (
                    <Button 
                      variant="outline"
                      className="w-full gap-2 mt-2" 
                      size="sm"
                      onClick={async () => {
                        console.log('🔧 Testing API connection...')
                        try {
                          const response = await fetch('/api/agent/generate-quiz', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              topic: 'Test Topic',
                              count: 1,
                              difficulty: 'Medium',
                              questionTypes: ['single']
                            })
                          })
                          
                          const result = await response.json()
                          console.log('🔧 API test result:', result)
                          alert(`API test ${result.success ? 'succeeded' : 'failed'}: ${JSON.stringify(result, null, 2)}`)
                        } catch (err) {
                          console.error('🔧 API test failed:', err)
                          alert(`API test failed: ${err.message}`)
                        }
                      }}
                    >
                      🔧 Test API Connection
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Main display area */}
            {generatedQuestions.length > 0 && (
              <Card className="border-2 border-primary/50">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-5 w-5" />
                        Generation successful! {generatedQuestions.length} questions generated
                      </CardTitle>
                      <CardDescription>You can edit questions or regenerate individual ones</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                      <Button size="sm" className="gap-2">
                        <Save className="h-4 w-4" />
                        Save as Quiz
                      </Button>
                    </div>
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
                              {question.options.map((option, optIndex) => (
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
                                  {/* Show correct answer marker */}
                                  {question.type === 'single' && question.correctAnswer === optIndex && (
                                      <CheckCircle2 className="h-4 w-4 text-green-600" title="Correct answer" />
                                    )}
                                    {question.type === 'multiple' && Array.isArray(question.correctAnswer) && question.correctAnswer.includes(optIndex) && (
                                      <CheckCircle2 className="h-4 w-4 text-green-600" title="One of the correct answers" />
                                    )}
                                  {/* Click to set as correct answer */}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => {
                                      if (question.type === 'single') {
                                        handleEditQuestion(question.id, 'correctAnswer', optIndex)
                                      } else if (question.type === 'multiple') {
                                        const currentAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer : []
                                        const newAnswers = currentAnswers.includes(optIndex) 
                                          ? currentAnswers.filter(idx => idx !== optIndex)
                                          : [...currentAnswers, optIndex]
                                        handleEditQuestion(question.id, 'correctAnswer', newAnswers)
                                      }
                                    }}
                                    title={question.type === 'single' ? 'Set as correct answer' : 'Toggle correct answer'}
                                  >
                                    {question.type === 'single' && question.correctAnswer === optIndex ? (
                                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    ) : question.type === 'multiple' && Array.isArray(question.correctAnswer) && question.correctAnswer.includes(optIndex) ? (
                                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <div className="h-4 w-4 border border-muted-foreground rounded-full" />
                                    )}
                                  </Button>
                                </div>
                              ))}
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
          <Button onClick={() => setShowAIGenerator(true)} className="gap-2" variant="default">
            <Brain className="h-4 w-4" />
            Generate with AI
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI-generated Quizzes</CardTitle>
          <CardDescription>Click the button below to try the AI quiz generation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Quickly generate quizzes with AI</p>
            <p className="text-sm mb-4">Generate quizzes across multiple question types with standard answers</p>
            <Button onClick={() => setShowAIGenerator(true)} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Try it now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default QuizModule
