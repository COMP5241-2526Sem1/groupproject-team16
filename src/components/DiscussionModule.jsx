import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.jsx'
import { 
  MessageSquare, 
  Plus, 
  Search,
  ThumbsUp,
  MessageCircle,
  Pin,
  Edit,
  Trash2,
  Send,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import { api } from '@/lib/api.js'
import { canPinDiscussion, canEditPost, canDeletePost, getCurrentUser } from '@/utils/permissions.js'

const DiscussionModule = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [replyContent, setReplyContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState([])
  const currentUser = getCurrentUser()
  const [currentCourse, setCurrentCourse] = useState(() => {
    try {
      const saved = localStorage.getItem('selectedCourse')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // 获取讨论列表
  useEffect(() => {
    const saved = localStorage.getItem('selectedCourse')
    if (saved) {
      try {
        setCurrentCourse(JSON.parse(saved))
      } catch {
        setCurrentCourse(null)
      }
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCourse?.id])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const params = currentCourse?.id ? { params: { courseId: currentCourse.id } } : {}
      const { data } = await api.get('/discussion', params)
      const list = (data?.data || []).map(post => ({
        ...post,
        createdAt: post.createdAt ? new Date(post.createdAt).toLocaleString('zh-CN') : '',
        replyList: post.replyList || []
      }))
      setPosts(list)
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      alert('加载讨论失败: ' + (error?.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: ''
  })

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('标题和内容不能为空')
      return
    }
    if (!currentCourse?.id) {
      alert('请先选择课程再发布讨论')
      return
    }
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('登录状态已失效，请重新登录')
        return
      }
      await api.post('/discussion', {
        title: formData.title,
        content: formData.content,
        tags: formData.tags,
        courseId: currentCourse.id
      }, { headers: { Authorization: `Bearer ${token}` } })
      setIsCreateDialogOpen(false)
      setFormData({ title: '', content: '', tags: '' })
      await fetchPosts()
    } catch (error) {
      alert('发布讨论失败: ' + (error?.response?.data?.error || error.message))
    }
  }

  const handleDelete = async (postId) => {
    if (!confirm('确认要删除这个帖子吗?')) return
    try {
      const token = localStorage.getItem('token')
      await api.delete(`/discussion/${postId}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      await fetchPosts()
      if (selectedPost?.id === postId) {
        setSelectedPost(null)
      }
    } catch (error) {
      alert('删除讨论失败: ' + (error?.response?.data?.error || error.message))
    }
  }

  const handleLike = async (postId) => {
    try {
      await api.post(`/discussion/${postId}/like`)
      await fetchPosts()
      if (selectedPost?.id === postId) {
        const { data } = await api.get(`/discussion/${postId}`)
        setSelectedPost({
          ...data.data,
          createdAt: data.data.createdAt ? new Date(data.data.createdAt).toLocaleString('zh-CN') : ''
        })
      }
    } catch (error) {
      console.error('Failed to like post:', error)
    }
  }

  const handlePin = async (postId) => {
    try {
      const token = localStorage.getItem('token')
      await api.post(`/discussion/${postId}/pin`, {}, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      await fetchPosts()
      if (selectedPost?.id === postId) {
        const { data } = await api.get(`/discussion/${postId}`)
        setSelectedPost({
          ...data.data,
          createdAt: data.data.createdAt ? new Date(data.data.createdAt).toLocaleString('zh-CN') : ''
        })
      }
    } catch (error) {
      console.error('Failed to pin post:', error)
    }
  }

  const handleViewPost = async (post) => {
    try {
      const { data } = await api.get(`/discussion/${post.id}`)
      setSelectedPost({
        ...data.data,
        createdAt: data.data.createdAt ? new Date(data.data.createdAt).toLocaleString('zh-CN') : '',
        replyList: (data.data.replyList || []).map(reply => ({
          ...reply,
          createdAt: reply.createdAt ? new Date(reply.createdAt).toLocaleString('zh-CN') : ''
        }))
      })
    } catch (error) {
      console.error('Failed to fetch post details:', error)
      setSelectedPost(post)
    }
  }

  const handleReply = async () => {
    if (!replyContent.trim()) return
    try {
      const token = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')
      const user = savedUser ? JSON.parse(savedUser) : null
      
      await api.post(`/discussion/${selectedPost.id}/reply`, {
        content: replyContent,
        author: user?.name || '当前用户',
        authorId: user?.id || 'user1',
        avatar: user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'current'}`
      }, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      
      setReplyContent('')
      // 重新获取帖子详情
      const { data } = await api.get(`/discussion/${selectedPost.id}`)
      setSelectedPost({
        ...data.data,
        createdAt: data.data.createdAt ? new Date(data.data.createdAt).toLocaleString('zh-CN') : '',
        replyList: (data.data.replyList || []).map(reply => ({
          ...reply,
          createdAt: reply.createdAt ? new Date(reply.createdAt).toLocaleString('zh-CN') : ''
        }))
      })
      await fetchPosts()
    } catch (error) {
      alert('回复失败: ' + (error?.response?.data?.error || error.message))
    }
  }

  const handleReplyLike = async (replyId) => {
    try {
      await api.post(`/discussion/${selectedPost.id}/reply/${replyId}/like`)
      const { data } = await api.get(`/discussion/${selectedPost.id}`)
      setSelectedPost({
        ...data.data,
        createdAt: data.data.createdAt ? new Date(data.data.createdAt).toLocaleString('zh-CN') : '',
        replyList: (data.data.replyList || []).map(reply => ({
          ...reply,
          createdAt: reply.createdAt ? new Date(reply.createdAt).toLocaleString('zh-CN') : ''
        }))
      })
    } catch (error) {
      console.error('Failed to like reply:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (selectedPost) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setSelectedPost(null)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back讨论列表
        </Button>

        <Card className={selectedPost.isPinned ? 'bg-amber-50 border border-amber-200' : ''}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {selectedPost.isPinned && (
                    <Badge variant="secondary" className="gap-1">
                      <Pin className="h-3 w-3" />
                      Pinned
                    </Badge>
                  )}
                  <CardTitle className="text-2xl">{selectedPost.title}</CardTitle>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={selectedPost.avatar} />
                      <AvatarFallback>{selectedPost.author[0]}</AvatarFallback>
                    </Avatar>
                    <span>{selectedPost.author}</span>
                  </div>
                  <span>{selectedPost.createdAt}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose max-w-none">
              <p className="text-foreground whitespace-pre-wrap">{selectedPost.content}</p>
            </div>

            {selectedPost.tags && selectedPost.tags.length > 0 && (
              <div className="flex gap-2">
                {selectedPost.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">{tag}</Badge>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 pt-4 border-t">
              <Button variant="ghost" size="sm" onClick={() => handleLike(selectedPost.id)} className="gap-2">
                <ThumbsUp className="h-4 w-4" />
                {selectedPost.likes}
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                {selectedPost.replies} 回复
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold">All Replies ({selectedPost.replyList?.length || 0})</h3>
              
              {selectedPost.replyList && selectedPost.replyList.length > 0 ? (
                <div className="space-y-4">
                  {selectedPost.replyList.map((reply) => (
                    <Card key={reply.id}>
                      <CardContent className="pt-6">
                        <div className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={reply.avatar} />
                            <AvatarFallback>{reply.author[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{reply.author}</span>
                                <span className="text-sm text-muted-foreground">{reply.createdAt}</span>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => handleReplyLike(reply.id)} className="gap-1">
                                <ThumbsUp className="h-3 w-3" />
                                {reply.likes}
                              </Button>
                            </div>
                            <p className="text-sm">{reply.content}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No replies yet</p>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t">
              <Label>Post Reply</Label>
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                rows={4}
              />
              <div className="flex justify-end">
                <Button onClick={handleReply} disabled={!replyContent.trim()} className="gap-2">
                  <Send className="h-4 w-4" />
                  Send Reply
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Discussion Forum</h1>
        <p className="text-muted-foreground mt-2">Communicate and discuss with classmates and teachers</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search讨论..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Start Discussion
        </Button>
      </div>

      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Card
            key={post.id}
            className={`hover:shadow-md transition-shadow cursor-pointer ${post.isPinned ? 'bg-amber-50 border border-amber-200' : ''}`}
          >
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.avatar} />
                  <AvatarFallback>{post.author[0]}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1" onClick={() => handleViewPost(post)}>
                      <div className="flex items-center gap-2">
                        {post.isPinned && (
                          <Badge variant="default" className="gap-1 bg-amber-500 text-white">
                            <Pin className="h-3 w-3" />
                            已置顶
                          </Badge>
                        )}
                        <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{post.author}</span>
                        <span>•</span>
                        <span>{post.createdAt}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      {canPinDiscussion() && (
                        <Button
                          variant={post.isPinned ? 'secondary' : 'ghost'}
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); handlePin(post.id) }}
                          className={post.isPinned ? 'bg-amber-100 text-amber-600' : ''}
                        >
                          <Pin className="h-4 w-4" />
                        </Button>
                      )}
                      {canDeletePost(post) && (
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(post.id) }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex gap-2">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleLike(post.id) }} className="gap-2">
                      <ThumbsUp className="h-4 w-4" />
                      {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleViewPost(post)} className="gap-2">
                      <MessageCircle className="h-4 w-4" />
                      {post.replies}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Start New Discussion</DialogTitle>
            <DialogDescription>Share your questions or ideas</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="Briefly describe the topic" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea id="content" name="content" value={formData.content} onChange={handleInputChange} placeholder="Describe your question or idea in detail..." rows={6} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" name="tags" value={formData.tags} onChange={handleInputChange} placeholder="用逗号分隔多个Tags,例如: 作业,算法" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!formData.title || !formData.content}>Publish讨论</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DiscussionModule

