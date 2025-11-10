import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Label } from '@/components/ui/label.jsx'
import { 
  Brain, 
  Sparkles,
  Upload,
  FileText,
  CheckCircle,
  Loader2,
  Download,
  Eye,
  AlertCircle
} from 'lucide-react'

const AgentGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState(null)
  const [error, setError] = useState(null)
  
  // form state
  const [formData, setFormData] = useState({
    topic: '',
    outline: '',
    duration: '',
    level: 'Beginner',
    additionalRequirements: ''
  })

  // handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // quick fill example data
  const fillExample = (example) => {
    setFormData({
      topic: example.topic,
      outline: example.description,
      // normalize duration by extracting digits (works for '12周' or '12 weeks')
      duration: (example.duration || '').toString().replace(/\D/g, ''),
      level: 'Intermediate',
      additionalRequirements: ''
    })
  }

  // Format course outline for display
  const formatOutline = (outline) => {
    if (!outline) return null;
    
  // Split outline text by numbered chapter headings
    const chapters = outline.split(/(?=\d+\.\s)/).filter(chapter => chapter.trim());
    
    return (
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {chapters.map((chapter, index) => {
          const lines = chapter.trim().split('\n');
          const title = lines[0];
          const content = lines.slice(1).join(' ').trim();
          
          // Extract chapter number and title
          const titleMatch = title.match(/^(\d+\.\s*)(.+)$/);
          const chapterNum = titleMatch ? titleMatch[1] : `${index + 1}. `;
          const chapterTitle = titleMatch ? titleMatch[2] : title;
          
          return (
            <div key={index} className="border-l-4 border-blue-400 bg-white pl-4 py-2 rounded-r-lg shadow-sm">
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[28px] text-center">
                  {chapterNum.replace('.', '')}
                </span>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 text-sm leading-tight mb-1">
                    {chapterTitle}
                  </h4>
                  {content && (
                    <p className="text-gray-600 text-xs leading-relaxed">
                      {content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // call AI to generate course content
  const handleGenerate = async () => {
    if (!formData.topic || !formData.outline) {
      setError('Please provide the course topic and outline')
      return
    }

    setIsGenerating(true)
    setError(null)
    
    try {
      // build system prompt
      const systemPrompt = `You are a professional course design expert and educational consultant. Your task is to generate detailed, structured course content based on the course information provided by the user.

Please return the response strictly in the following JSON format:
{
  "courseName": "Course title",
  "outline": "Detailed course outline (including chapters and learning points)",
  "duration": "Suggested course duration",
  "objectives": ["Learning objective 1", "Learning objective 2", "Learning objective 3"],
  "quizTopics": ["Quiz topic 1", "Quiz topic 2", "Quiz topic 3"],
  "assignments": ["Assignment 1", "Assignment 2", "Assignment 3"],
  "resources": ["Recommended resource 1", "Recommended resource 2", "Recommended resource 3"],
  "prerequisites": "Prerequisites",
  "assessment": "Assessment methods"
}`

  // build user prompt
  const userPrompt = `Please generate comprehensive teaching content for the following course:

**Course Topic**: ${formData.topic}

**Knowledge Outline**: 
${formData.outline}

**Course Weeks**: ${formData.duration || '12'} weeks

**Difficulty Level**: ${formData.level}

${formData.additionalRequirements ? `**Additional Requirements**: ${formData.additionalRequirements}` : ''}

Please produce a detailed course design.`

  // Call AI API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          system: systemPrompt,
          user: userPrompt
        })
      })

      const data = await response.json()

      if (!data.ok) {
        throw new Error(data.message || 'AI generation failed')
      }

      // Try to parse the JSON content returned by the AI
      let parsedContent
      try {
        // Extract JSON portion (the AI may return extra text)
        const jsonMatch = data.data.response.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          parsedContent = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('Unable to parse AI response')
        }
      } catch (parseError) {
        // if parsing fails, display as text
        parsedContent = {
          courseName: formData.topic,
          outline: data.data.response,
          duration: `${formData.duration || 12} weeks`,
          objectives: ['Please refer to the detailed outline'],
          quizTopics: ['Generate based on course content'],
          assignments: ['Arrange according to course schedule'],
          resources: ['AI recommended resources'],
          prerequisites: 'Please see course notes',
          assessment: 'To be determined based on course characteristics'
        }
      }

      setGeneratedContent({
        ...parsedContent,
        quizCount: parsedContent.quizTopics?.length || 3,
        assignmentCount: parsedContent.assignments?.length || 3,
        materialCount: parsedContent.resources?.length || 5,
        rawResponse: data.data.response // save raw response
      })
      
    } catch (error) {
  console.error('Error generating course content:', error)
  setError(error.message || 'Generation failed, please try again')
    } finally {
      setIsGenerating(false)
    }
  }

  const features = [
    {
      icon: FileText,
      title: 'Outline Generator',
      description: 'Generate a structured course outline and key learning points from the topic'
    },
    {
      icon: CheckCircle,
      title: 'Quiz Creator',
      description: 'Intelligently generate quiz questions and model answers across multiple types'
    },
    {
      icon: Upload,
      title: 'Assignment Templates',
      description: 'Create assignment tasks and grading rubrics based on course content'
    },
    {
      icon: Brain,
      title: 'Resource Recommendations',
      description: 'Recommend relevant learning materials, case studies and references'
    },
  ]

  const examples = [
    {
      topic: 'Introduction to Machine Learning',
      description: 'Covers fundamentals of supervised, unsupervised and reinforcement learning, including linear/logistic regression, decision trees, random forests, SVMs and practical applications',
      duration: '12 weeks'
    },
    {
      topic: 'Web Frontend Development',
      description: 'HTML5 semantics, CSS3 styling, JavaScript ES6+, React development, responsive design, and frontend engineering tools',
      duration: '10 weeks'
    },
    {
      topic: 'Data Structures & Algorithms',
      description: 'Arrays, linked lists, stacks, queues, trees, graphs, sorting/searching algorithms, dynamic programming, and greedy strategies',
      duration: '14 weeks'
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
              Agent Course Generator
          </h1>
          <p className="text-muted-foreground mt-1">Quickly create complete course content using AI</p>
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

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-base">{feature.title}</CardTitle>
                <CardDescription className="text-sm">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      {/* Generator Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Create New Course
              </CardTitle>
              <CardDescription>Provide course details and let the AI generate full teaching content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Course Topic *</Label>
                <Input 
                  id="topic" 
                  placeholder="e.g., Fundamentals of Deep Learning" 
                  value={formData.topic}
                  onChange={(e) => handleInputChange('topic', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="outline">Knowledge Outline *</Label>
                <Textarea 
                  id="outline" 
                  placeholder="Enter main knowledge points and chapter structure..."
                  rows={6}
                  value={formData.outline}
                  onChange={(e) => handleInputChange('outline', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Course Weeks</Label>
                  <Input 
                    id="duration" 
                    type="number"
                    placeholder="12"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Difficulty Level</Label>
                  <select 
                    id="level"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.level}
                    onChange={(e) => handleInputChange('level', e.target.value)}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Additional Requirements (optional)</Label>
                <Textarea 
                  id="requirements" 
                  placeholder="e.g., include hands-on projects, emphasize practical applications..."
                  rows={3}
                  value={formData.additionalRequirements}
                  onChange={(e) => handleInputChange('additionalRequirements', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resources">Reference Resources (optional)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag files here
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports PDF, DOCX, PPT and more
                  </p>
                </div>
              </div>

              <Button 
                className="w-full gap-2" 
                size="lg"
                onClick={handleGenerate}
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
                        Generate Course Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Content */}
          {generatedContent && (
            <Card className="mt-6 border-2 border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  AI生成成功!
                </CardTitle>
                <CardDescription>AI已为您生成完整的课程内容</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">课程名称</h3>
                  <p className="text-lg">{generatedContent.courseName}</p>
                </div>

                {generatedContent.objectives && (
                  <div>
                    <h3 className="font-semibold mb-2">学习目标</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {generatedContent.objectives.map((objective, index) => (
                        <li key={index} className="text-muted-foreground">{objective}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">课程大纲</h3>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    {formatOutline(generatedContent.outline)}
                  </div>
                </div>

                {generatedContent.prerequisites && (
                  <div>
                    <h3 className="font-semibold mb-2">前置要求</h3>
                    <p className="text-sm text-muted-foreground">{generatedContent.prerequisites}</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{generatedContent.quizCount}</div>
                    <div className="text-sm text-muted-foreground">测验题目</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{generatedContent.assignmentCount}</div>
                    <div className="text-sm text-muted-foreground">作业任务</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{generatedContent.materialCount}</div>
                    <div className="text-sm text-muted-foreground">推荐资源</div>
                  </div>
                </div>

                {generatedContent.quizTopics && (
                  <div>
                    <h3 className="font-semibold mb-2">测验主题</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {generatedContent.quizTopics.map((topic, index) => (
                        <div key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {topic}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {generatedContent.assignments && (
                  <div>
                    <h3 className="font-semibold mb-2">作业任务</h3>
                    <div className="space-y-2">
                      {generatedContent.assignments.map((assignment, index) => (
                        <div key={index} className="text-sm bg-green-50 p-2 rounded border-l-4 border-green-400">
                          {assignment}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {generatedContent.resources && (
                  <div>
                    <h3 className="font-semibold mb-2">推荐资源</h3>
                    <div className="space-y-1">
                      {generatedContent.resources.map((resource, index) => (
                        <div key={index} className="text-sm text-purple-700 bg-purple-50 px-2 py-1 rounded">
                          📚 {resource}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button className="flex-1 gap-2">
                    <Eye className="h-4 w-4" />
                    预览详情
                  </Button>
                  <Button className="flex-1 gap-2" variant="outline">
                    <Download className="h-4 w-4" />
                    导出内容
                  </Button>
                  <Button className="flex-1 gap-2">
                    <CheckCircle className="h-4 w-4" />
                    导入系统
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Examples */}
          <Card>
            <CardHeader>
              <CardTitle>示例课程</CardTitle>
              <CardDescription>点击快速填充</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {examples.map((example, index) => (
                <div 
                  key={index} 
                  className="p-3 border rounded-lg hover:border-primary cursor-pointer transition-colors"
                  onClick={() => fillExample(example)}
                >
                  <h4 className="font-semibold text-sm mb-1">{example.topic}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{example.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-primary">{example.duration}</div>
                    <div className="text-xs text-muted-foreground">点击填充</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* How it works */}
          <Card>
            <CardHeader>
              <CardTitle>工作原理</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    1
                  </div>
                  <div>
                    <div className="font-medium">输入课程信息</div>
                    <div className="text-muted-foreground text-xs">提供主题和大纲</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    2
                  </div>
                  <div>
                    <div className="font-medium">AI智能分析</div>
                    <div className="text-muted-foreground text-xs">Dify Agent处理</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    3
                  </div>
                  <div>
                    <div className="font-medium">生成完整内容</div>
                    <div className="text-muted-foreground text-xs">包含大纲、Quiz、作业</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    4
                  </div>
                  <div>
                    <div className="font-medium">一键导入系统</div>
                    <div className="text-muted-foreground text-xs">直接使用或编辑</div>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>使用统计</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">已生成课程</span>
                <span className="font-semibold">28</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">本月使用次数</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">平均生成时长</span>
                <span className="font-semibold">45秒</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AgentGenerator

