import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Label } from '@/components/ui/label.jsx'
import { getApiUrl } from '@/config/api'
import { canCreateCourse } from '@/utils/permissions.js'
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
  const [isSaving, setIsSaving] = useState(false)
  const [generatedContent, setGeneratedContent] = useState(null)
  const [error, setError] = useState(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  
  // 权限检查
  if (!canCreateCourse()) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">权限不足</h2>
          <p className="text-muted-foreground">只有教师和管理员可以使用AI课程生成器</p>
        </div>
      </div>
    )
  }
  
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
    
    try {
      // Split outline text by numbered chapter headings (支持多位数字)
      // 使用负向后顾断言确保不会在数字中间分割
      const chapters = outline.split(/(?=(?:^|\n)\d+\.\s)/).filter(chapter => chapter.trim());
      
      if (chapters.length === 0) {
        return <p className="text-sm text-muted-foreground">暂无大纲内容</p>;
      }
      
      return (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {chapters.map((chapter, index) => {
            const lines = chapter.trim().split('\n');
            const title = lines[0];
            const content = lines.slice(1).join(' ').trim();
            
            // Extract chapter number and title (支持多位数字)
            const titleMatch = title.match(/^(\d+)\.\s*(.+)$/);
            const chapterNum = titleMatch ? titleMatch[1] : `${index + 1}`;
            const chapterTitle = titleMatch ? titleMatch[2] : title;
            
            return (
              <div key={index} className="border-l-4 border-blue-400 bg-white pl-4 py-2 rounded-r-lg shadow-sm">
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[28px] text-center">
                    {chapterNum}
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
    } catch (error) {
      console.error('格式化大纲失败:', error);
      return <p className="text-sm text-red-600">大纲格式化失败，请查看原始数据</p>;
    }
  };

  // call AI to generate course content
  const handleGenerate = async () => {
    if (!formData.topic || !formData.outline) {
      setError('请提供课程主题和知识点大纲')
      return
    }

    setIsGenerating(true)
    setError(null)
    setSaveSuccess(false)
    
    try {
      // 调用后端Agent API生成课程内容
      const response = await fetch(getApiUrl('/agent/generate-course'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic: formData.topic,
          outline: formData.outline,
          weeks: parseInt(formData.duration) || 12,
          level: formData.level,
          additionalRequirements: formData.additionalRequirements
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'AI生成失败')
      }

      // 处理返回的课程内容数据
      const courseData = data.data || {}
      
      // 格式化课程大纲 - 确保是字符串格式
      let outlineText = '';
      if (Array.isArray(courseData.outline)) {
        // 如果outline是数组,转换为文本格式
        outlineText = courseData.outline.map((week, index) => {
          return `${index + 1}. ${week.title || `第${week.week}周`}\n${week.content || ''}\n关键点: ${(week.keyPoints || []).join(', ')}`;
        }).join('\n\n');
      } else if (typeof courseData.outline === 'string') {
        outlineText = courseData.outline;
      } else {
        outlineText = '课程大纲生成中...';
      }

      // 格式化资源 - 处理对象数组或字符串数组
      let formattedResources = [];
      if (Array.isArray(courseData.resources)) {
        formattedResources = courseData.resources.map(resource => {
          // 如果是对象，提取 name 字段
          if (typeof resource === 'object' && resource !== null) {
            return resource.name || resource.title || JSON.stringify(resource);
          }
          // 如果是字符串，直接使用
          return String(resource);
        });
      }

      const newContent = {
        courseName: courseData.courseTitle || formData.topic,
        outline: outlineText,
        duration: `${courseData.weeks || 12}周`,
        objectives: Array.isArray(courseData.learningObjectives) ? courseData.learningObjectives : [],
        quizTopics: Array.isArray(courseData.quizTopics) ? courseData.quizTopics : [],
        assignments: Array.isArray(courseData.assignments) ? courseData.assignments : [],
        resources: formattedResources,
        prerequisites: courseData.prerequisites || 'Determined based on the course content',
        assessment: courseData.assessment || 'Determined based on the course content',
        quizCount: (courseData.quizTopics || []).length || 3,
        assignmentCount: (courseData.assignments || []).length || 3,
        materialCount: formattedResources.length || 5,
        fallback: data.fallback || false
      }

      console.log('设置生成的内容:', newContent)
      setGeneratedContent(newContent)
      
      // 如果是回退模式,显示提示
      if (data.fallback) {
        console.warn('使用本地生成模式:', data.message);
      }
      
    } catch (error) {
      console.error('生成课程内容失败:', error)
      setError(error.message || '生成失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  // 保存生成的课程到数据库
  const handleSave = async () => {
    if (!generatedContent) {
      setError('没有可保存的内容')
      return
    }

    setIsSaving(true)
    setError(null)
    setSaveSuccess(false)

    try {
      const response = await fetch(getApiUrl('/agent/save-course'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          courseName: generatedContent.courseName,
          outline: generatedContent.outline,
          duration: generatedContent.duration,
          objectives: generatedContent.objectives,
          quizTopics: generatedContent.quizTopics,
          assignments: generatedContent.assignments,
          resources: generatedContent.resources,
          prerequisites: generatedContent.prerequisites,
          level: formData.level
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || '保存失败')
      }

      console.log('课程保存成功:', data.data)
      setSaveSuccess(true)
      
      // 3秒后自动清除成功提示
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)

    } catch (error) {
      console.error('保存课程失败:', error)
      setError(error.message || '保存失败，请重试')
    } finally {
      setIsSaving(false)
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
              AI Course Generator
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

      {/* Success Display */}
      {saveSuccess && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">课程已成功保存到数据库！</span>
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
                  AI Generation Successful!
                </CardTitle>
                <CardDescription>AI has generated the complete course content for you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Course Name</h3>
                  <p className="text-lg">{generatedContent.courseName}</p>
                </div>

                {generatedContent.objectives && generatedContent.objectives.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Learning Objectives</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {generatedContent.objectives.map((objective, index) => (
                        <li key={index} className="text-muted-foreground">{objective}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Course Syllabus</h3>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    {formatOutline(generatedContent.outline)}
                  </div>
                </div>

                {generatedContent.prerequisites && (
                  <div>
                    <h3 className="font-semibold mb-2">Prerequisites</h3>
                    <p className="text-sm text-muted-foreground">{generatedContent.prerequisites}</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{generatedContent.quizCount}</div>
                    <div className="text-sm text-muted-foreground">Quiz Questions</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{generatedContent.assignmentCount}</div>
                    <div className="text-sm text-muted-foreground">Assignment Tasks</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{generatedContent.materialCount}</div>
                    <div className="text-sm text-muted-foreground">Recommended Resources</div>
                  </div>
                </div>

                {generatedContent.quizTopics && generatedContent.quizTopics.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Quiz Topic</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {generatedContent.quizTopics.map((topic, index) => (
                        <div key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {topic}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {generatedContent.assignments && generatedContent.assignments.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Assignment Tasks</h3>
                    <div className="space-y-2">
                      {generatedContent.assignments.map((assignment, index) => (
                        <div key={index} className="text-sm bg-green-50 p-2 rounded border-l-4 border-green-400">
                          {assignment}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {generatedContent.resources && generatedContent.resources.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Recommended Resources</h3>
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
                  <Button 
                    className="flex-1 gap-2" 
                    onClick={handleSave}
                    disabled={isSaving || saveSuccess}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : saveSuccess ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Saved Successfully
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Save to Database
                      </>
                    )}
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
              <CardTitle>Sample Course</CardTitle>
              <CardDescription>Click to AutoFill</CardDescription>
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
                    <div className="text-xs text-muted-foreground">Click to AutoFill</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* How it works */}
          <Card>
            <CardHeader>
              <CardTitle>Working Principle</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    1
                  </div>
                  <div>
                    <div className="font-medium">Input Course Information</div>
                    <div className="text-muted-foreground text-xs">Provide topic and outline</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    2
                  </div>
                  <div>
                    <div className="font-medium">AI Intelligent Analysis</div>
                    <div className="text-muted-foreground text-xs">Processed by Dify Agent</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    3
                  </div>
                  <div>
                    <div className="font-medium">Generate Complete Content</div>
                    <div className="text-muted-foreground text-xs">Including outline, Quiz and assignments</div>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    4
                  </div>
                  <div>
                    <div className="font-medium">One-click Import to System</div>
                    <div className="text-muted-foreground text-xs">Use or edit directly</div>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Courses Generated</span>
                <span className="font-semibold">28</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Usage Times This Month</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Average Generation Time</span>
                <span className="font-semibold">45 seconds</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AgentGenerator

