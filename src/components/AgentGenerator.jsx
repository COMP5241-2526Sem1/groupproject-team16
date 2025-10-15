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
  Eye
} from 'lucide-react'

const AgentGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState(null)

  const handleGenerate = () => {
    setIsGenerating(true)
    // 模拟生成过程
    setTimeout(() => {
      setGeneratedContent({
        courseName: '深度学习基础',
        outline: '1. 神经网络基础\n2. 反向传播算法\n3. 卷积神经网络\n4. 循环神经网络\n5. 实战项目',
        quizCount: 5,
        assignmentCount: 3,
        materialCount: 8
      })
      setIsGenerating(false)
    }, 3000)
  }

  const features = [
    {
      icon: FileText,
      title: '课程大纲生成',
      description: '基于主题自动生成结构化的课程大纲和知识点'
    },
    {
      icon: CheckCircle,
      title: 'Quiz自动创建',
      description: '智能生成多种题型的测验题目和标准答案'
    },
    {
      icon: Upload,
      title: '作业模板生成',
      description: '根据课程内容创建配套的作业任务和评分标准'
    },
    {
      icon: Brain,
      title: '教学资源推荐',
      description: '推荐相关的学习资料、案例和参考文献'
    },
  ]

  const examples = [
    {
      topic: '机器学习入门',
      description: '涵盖监督学习、无监督学习和强化学习基础',
      duration: '12周'
    },
    {
      topic: 'Web前端开发',
      description: 'HTML、CSS、JavaScript及React框架',
      duration: '10周'
    },
    {
      topic: '数据结构与算法',
      description: '常用数据结构及经典算法设计',
      duration: '14周'
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            Agent课程生成器
          </h1>
          <p className="text-muted-foreground mt-1">利用AI智能体快速创建完整的课程内容</p>
        </div>
      </div>

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
                创建新课程
              </CardTitle>
              <CardDescription>填写课程信息,让AI为您生成完整的教学内容</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">课程主题 *</Label>
                <Input 
                  id="topic" 
                  placeholder="例如: 深度学习基础" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="outline">知识点大纲 *</Label>
                <Textarea 
                  id="outline" 
                  placeholder="请输入课程的主要知识点和章节安排..."
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">课程周数</Label>
                  <Input 
                    id="duration" 
                    type="number"
                    placeholder="12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">难度级别</Label>
                  <select 
                    id="level"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option>初级</option>
                    <option>中级</option>
                    <option>高级</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resources">参考资源 (可选)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    点击上传或拖拽文件到此处
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    支持 PDF, DOCX, PPT 等格式
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
                    AI正在生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    生成课程内容
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
                  生成成功!
                </CardTitle>
                <CardDescription>AI已为您生成完整的课程内容</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">课程名称</h3>
                  <p className="text-lg">{generatedContent.courseName}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">课程大纲</h3>
                  <pre className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap">
                    {generatedContent.outline}
                  </pre>
                </div>

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
                >
                  <h4 className="font-semibold text-sm mb-1">{example.topic}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{example.description}</p>
                  <div className="text-xs text-primary">{example.duration}</div>
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

