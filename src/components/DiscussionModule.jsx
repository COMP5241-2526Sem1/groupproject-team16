import { useState } from 'react'
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
  ArrowLeft
} from 'lucide-react'

const DiscussionModule = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [replyContent, setReplyContent] = useState('')
  
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: '关于第三章作业的疑问',
      content: '请问第三章的递归算法作业中,如何优化时间复杂度?',
      author: '李明',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
      createdAt: '2025-10-10 14:30',
      isPinned: true,
      likes: 15,
      replies: 2,
      tags: ['作业', '算法'],
      replyList: [
        {
          id: 101,
          author: '张教授',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher',
          content: '可以考虑使用动态规划来优化,避免重复计算。',
          createdAt: '2025-10-10 15:00',
          likes: 5
        },
        {
          id: 102,
          author: '王同学',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
          content: '我也遇到了同样的问questions,期待老师的解答!',
          createdAt: '2025-10-10 15:15',
          likes: 2
        }
      ]
    },
    {
      id: 2,
      title: '课程项目小组招募',
      content: '我们小组还缺2名成员,希望擅长前端开发的同学加入!',
      author: '赵强',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
      createdAt: '2025-10-09 10:20',
      isPinned: false,
      likes: 23,
      replies: 0,
      tags: ['项目', '招募'],
      replyList: []
    },
    {
      id: 3,
      title: '期中考试复习资料分享',
      content: '整理了一份期中考试的复习大纲和重点questions目,分享给大家。',
      author: '刘芳',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
      createdAt: '2025-10-08 16:45',
      isPinned: true,
      likes: 45,
      replies: 0,
      tags: ['考试', '资料'],
      replyList: []
    }
  ])

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

  const handleCreate = () => {
    const newPost = {
      id: posts.length + 1,
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      author: '当前用户',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current',
      createdAt: new Date().toLocaleString('zh-CN'),
      isPinned: false,
      likes: 0,
      replies: 0,
      replyList: []
    }
    setPosts([newPost, ...posts])
    setIsCreateDialogOpen(false)
    setFormData({ title: '', content: '', tags: '' })
  }

  const handleDelete = (postId) => {
    if (confirm('Confirm要Delete这个帖子吗?')) {
      setPosts(posts.filter(post => post.id !== postId))
    }
  }

  const handleLike = (postId) => {
    setPosts(posts.map(post =>
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ))
  }

  const handlePin = (postId) => {
    setPosts(posts.map(post =>
      post.id === postId ? { ...post, isPinned: !post.isPinned } : post
    ))
  }

  const handleViewPost = (post) => {
    setSelectedPost(post)
  }

  const handleReply = () => {
    if (!replyContent.trim()) return

    const newReply = {
      id: Date.now(),
      author: '当前用户',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current',
      content: replyContent,
      createdAt: new Date().toLocaleString('zh-CN'),
      likes: 0
    }

    setPosts(posts.map(post =>
      post.id === selectedPost.id
        ? {
            ...post,
            replies: post.replies + 1,
            replyList: [...(post.replyList || []), newReply]
          }
        : post
    ))

    setSelectedPost({
      ...selectedPost,
      replies: selectedPost.replies + 1,
      replyList: [...(selectedPost.replyList || []), newReply]
    })

    setReplyContent('')
  }

  const handleReplyLike = (replyId) => {
    const updatedPost = {
      ...selectedPost,
      replyList: selectedPost.replyList.map(reply =>
        reply.id === replyId ? { ...reply, likes: reply.likes + 1 } : reply
      )
    }
    setSelectedPost(updatedPost)
    setPosts(posts.map(post =>
      post.id === selectedPost.id ? updatedPost : post
    ))
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

        <Card>
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
          <Card key={post.id} className="hover:shadow-md transition-shadow cursor-pointer">
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
                          <Badge variant="secondary" className="gap-1">
                            <Pin className="h-3 w-3" />
                            Pinned
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
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handlePin(post.id) }}>
                        <Pin className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(post.id) }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
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

