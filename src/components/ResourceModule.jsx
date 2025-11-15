import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx'
import { FolderOpen, Search, FileText, Video, Image, File, Download, Eye, Trash2, Upload, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { canManageResources, getCurrentUser } from '@/utils/permissions.js'
import { api } from '@/lib/api.js'

const ResourceModule = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [currentCourse, setCurrentCourse] = useState(null)
  const fileInputRef = useRef(null)
  const currentUser = getCurrentUser()

  useEffect(() => {
    const saved = localStorage.getItem('selectedCourse')
    if (saved) {
      try {
        setCurrentCourse(JSON.parse(saved))
      } catch {}
    }
  }, [])

  useEffect(() => {
    if (currentCourse?.id) loadResources()
  }, [currentCourse?.id])

  const loadResources = async () => {
    if (!currentCourse?.id) return
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await api.get(`/resources?courseId=${currentCourse.id}`, token ? { headers: { Authorization: `Bearer ${token}` } } : {})
      setResources(res.data?.data || [])
    } catch (e) {
      console.error('加载资源失败:', e)
      setResources([])
    } finally {
      setLoading(false)
    }
  }

  const formatSize = (bytes) => {
    if (!bytes) return '0 B'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('zh-CN')
  }

  const getFileIcon = (type) => {
    const icons = {
      pdf: { icon: FileText, color: 'text-red-600', bg: 'bg-red-100' },
      video: { icon: Video, color: 'text-blue-600', bg: 'bg-blue-100' },
      mp4: { icon: Video, color: 'text-blue-600', bg: 'bg-blue-100' },
      ppt: { icon: FileText, color: 'text-orange-600', bg: 'bg-orange-100' },
      pptx: { icon: FileText, color: 'text-orange-600', bg: 'bg-orange-100' },
      doc: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
      docx: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
      image: { icon: Image, color: 'text-green-600', bg: 'bg-green-100' },
      default: { icon: File, color: 'text-gray-600', bg: 'bg-gray-100' }
    }
    return icons[type?.toLowerCase()] || icons.default
  }

  const handleUpload = async () => {
    if (!uploadFile || !currentCourse?.id) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('resource', uploadFile)
      formData.append('courseId', currentCourse.id)
      const token = localStorage.getItem('token')
      await api.post('/upload/resource', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      })
      setUploadDialogOpen(false)
      setUploadFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      loadResources()
    } catch (e) {
      alert('上传失败: ' + (e?.response?.data?.message || e.message))
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (resource) => {
    try {
      const token = localStorage.getItem('token')
      const baseURL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:3001/api' : '/api')
      const downloadUrl = `${baseURL}/resources/${resource.id}/download`
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = resource.name || 'download'
      link.style.display = 'none'
      if (token) link.setAttribute('data-token', token)
      document.body.appendChild(link)
      link.click()
      setTimeout(() => {
        document.body.removeChild(link)
      }, 100)
    } catch (e) {
      console.error('下载失败:', e)
      if (resource.url) {
        window.open(resource.url, '_blank')
      } else {
        alert('下载失败: ' + (e?.message || '未知错误'))
      }
    }
  }

  const handlePreview = async (resource) => {
    if (!resource.url) {
      try {
        // 如果URL不存在，从后端获取预览URL
        const token = localStorage.getItem('token')
        const res = await api.get(`/resources/${resource.id}`, token ? { headers: { Authorization: `Bearer ${token}` } } : {})
        const previewUrl = res.data?.data?.url
        if (previewUrl) {
          window.open(previewUrl, '_blank')
        } else {
          alert('无法获取文件预览URL')
        }
      } catch (e) {
        alert('预览失败: ' + (e?.response?.data?.message || e.message))
      }
      return
    }
    window.open(resource.url, '_blank')
  }

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这个资源吗？')) return
    try {
      const token = localStorage.getItem('token')
      await api.delete(`/resources/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      loadResources()
    } catch (e) {
      alert('删除失败: ' + (e?.response?.data?.message || e.message))
    }
  }

  const filteredResources = resources.filter(r =>
    r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.course?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: resources.length,
    pdf: resources.filter(r => r.type === 'pdf').length,
    video: resources.filter(r => ['video', 'mp4'].includes(r.type?.toLowerCase())).length,
    other: resources.filter(r => !['pdf', 'video', 'mp4'].includes(r.type?.toLowerCase())).length
  }

  if (!currentCourse) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">请先选择课程</h3>
          <p className="text-muted-foreground">请从课程管理页面选择一个课程</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">课程资源</h1>
          <p className="text-muted-foreground mt-1">{currentCourse.name}</p>
        </div>
        {canManageResources() && (
          <Button className="gap-2" onClick={() => setUploadDialogOpen(true)}>
            <Upload className="h-4 w-4" />
            上传资源
          </Button>
        )}
      </div>

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

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="搜索资源名称..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">加载中...</div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {filteredResources.map((resource) => {
              const fileConfig = getFileIcon(resource.type)
              const Icon = fileConfig.icon
              return (
                <Card key={resource.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-lg ${fileConfig.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`h-6 w-6 ${fileConfig.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg truncate">{resource.name}</h3>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground flex-wrap">
                              <span>{formatSize(resource.size)}</span>
                              <span>•</span>
                              <span>上传者: {resource.uploadedBy || '未知'}</span>
                              <span>•</span>
                              <span>{formatDate(resource.uploadedAt)}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="gap-1">
                                <Download className="h-3 w-3" />
                                {resource.downloads || 0} 次下载
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button variant="outline" size="sm" className="gap-2" onClick={() => handlePreview(resource)}>
                              <Eye className="h-4 w-4" />
                              预览
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2" onClick={() => handleDownload(resource)}>
                              <Download className="h-4 w-4" />
                              下载
                            </Button>
                            {canManageResources() && (
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(resource.id)}>
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

          {filteredResources.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">未找到资源</h3>
                <p className="text-muted-foreground text-center mb-4">尝试调整搜索条件或上传新资源</p>
                {canManageResources() && (
                  <Button onClick={() => setUploadDialogOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    上传资源
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>上传资源</DialogTitle>
            <DialogDescription>选择要上传的文件，文件将自动上传到当前课程</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>选择文件</Label>
              <Input type="file" ref={fileInputRef} onChange={(e) => setUploadFile(e.target.files[0])} />
              {uploadFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <File className="h-4 w-4" />
                  <span>{uploadFile.name}</span>
                  <span className="text-xs">({formatSize(uploadFile.size)})</span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>取消</Button>
            <Button onClick={handleUpload} disabled={!uploadFile || uploading}>
              {uploading ? '上传中...' : '上传'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
