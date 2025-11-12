import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { 
  FolderOpen, 
  Plus,
  Search,
  FileText,
  Video,
  Image,
  File,
  Download,
  Eye,
  Trash2,
  Upload
} from 'lucide-react'
import { useState } from 'react'
import { canManageResources, getCurrentUser } from '@/utils/permissions.js'

const ResourceModule = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const currentUser = getCurrentUser()

  const resources = [
    {
      id: 1,
      name: '机器学习算法详解.pdf',
      type: 'pdf',
      size: '5.2 MB',
      course: '机器学习基础',
      uploadedBy: '张教授',
      uploadedAt: '2025-10-10',
      downloads: 45
    },
    {
      id: 2,
      name: '神经网络入门视频.mp4',
      type: 'video',
      size: '128 MB',
      course: '机器学习基础',
      uploadedBy: '张教授',
      uploadedAt: '2025-10-08',
      downloads: 38
    },
    {
      id: 3,
      name: '数据结构课件.pptx',
      type: 'ppt',
      size: '3.8 MB',
      course: '数据结构与算法',
      uploadedBy: '李老师',
      uploadedAt: '2025-10-12',
      downloads: 52
    },
    {
      id: 4,
      name: 'React组件设计模式.pdf',
      type: 'pdf',
      size: '2.1 MB',
      course: 'Web全栈开发',
      uploadedBy: '王老师',
      uploadedAt: '2025-10-11',
      downloads: 29
    },
    {
      id: 5,
      name: 'SQL优化案例分析.docx',
      type: 'doc',
      size: '1.5 MB',
      course: '数据库系统原理',
      uploadedBy: '赵教授',
      uploadedAt: '2025-10-09',
      downloads: 34
    },
    {
      id: 6,
      name: '算法可视化演示.mp4',
      type: 'video',
      size: '95 MB',
      course: '数据结构与算法',
      uploadedBy: '李老师',
      uploadedAt: '2025-10-07',
      downloads: 41
    },
  ]

  const getFileIcon = (type) => {
    const icons = {
      pdf: { icon: FileText, color: 'text-red-600', bg: 'bg-red-100' },
      video: { icon: Video, color: 'text-blue-600', bg: 'bg-blue-100' },
      ppt: { icon: FileText, color: 'text-orange-600', bg: 'bg-orange-100' },
      doc: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
      image: { icon: Image, color: 'text-green-600', bg: 'bg-green-100' },
      default: { icon: File, color: 'text-gray-600', bg: 'bg-gray-100' }
    }
    return icons[type] || icons.default
  }

  const filteredResources = resources.filter(resource =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.course.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: resources.length,
    pdf: resources.filter(r => r.type === 'pdf').length,
    video: resources.filter(r => r.type === 'video').length,
    other: resources.filter(r => !['pdf', 'video'].includes(r.type)).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">课程资源</h1>
          <p className="text-muted-foreground mt-1">管理和分享教学资料</p>
        </div>
        {canManageResources() && (
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            上传资源
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">总资源数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">PDF文档</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.pdf}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">视频资源</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.video}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">其他文件</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.other}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索资源名称或课程..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Resource List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredResources.map((resource) => {
          const fileConfig = getFileIcon(resource.type)
          const Icon = fileConfig.icon
          
          return (
            <Card key={resource.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  {/* File Icon */}
                  <div className={`h-12 w-12 rounded-lg ${fileConfig.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-6 w-6 ${fileConfig.color}`} />
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{resource.name}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground flex-wrap">
                          <span>{resource.course}</span>
                          <span>•</span>
                          <span>{resource.size}</span>
                          <span>•</span>
                          <span>上传者: {resource.uploadedBy}</span>
                          <span>•</span>
                          <span>{resource.uploadedAt}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="gap-1">
                            <Download className="h-3 w-3" />
                            {resource.downloads} 次下载
                          </Badge>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="h-4 w-4" />
                          预览
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="h-4 w-4" />
                          下载
                        </Button>
                        {canManageResources() && (
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredResources.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">未找到资源</h3>
            <p className="text-muted-foreground text-center mb-4">
              尝试调整搜索条件或上传新资源
            </p>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              上传资源
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Upload Tips */}
      <Card>
        <CardHeader>
          <CardTitle>上传说明</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>支持的文件格式: PDF, PPT, PPTX, DOC, DOCX, MP4, MP3, ZIP</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>单个文件大小不超过 200MB</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>视频资源建议使用MP4格式以获得最佳兼容性</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>PDF文档支持在线预览功能</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

export default ResourceModule

