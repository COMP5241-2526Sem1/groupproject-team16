import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.jsx'
import { api } from '@/lib/api.js'
import { canCreateCourse, canEditCourse, canDeleteCourse, canJoinCourse, hasManagePermission } from '@/utils/permissions.js'
import { 
  BookOpen, 
  Plus, 
  Search,
  Users,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Shield
} from 'lucide-react'

const CourseManagement = ({ onSelectCourse }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })
  
  // 获取当前用户信息
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser))
      } catch {
        setCurrentUser(null)
      }
    }
  }, [])

  const [allCourses, setAllCourses] = useState([])
  const [myCourses, setMyCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingAll, setLoadingAll] = useState(false)
  const [loadingMine, setLoadingMine] = useState(false)
  const [error, setError] = useState('')

  const mapCourseList = (dataList = []) => (dataList || []).map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description || '',
    teacher: c.teacherName || '',
    teacherId: c.teacherId,
    students: c.students || 0,
    startDate: c.startDate ? String(c.startDate).slice(0, 10) : '',
    status: (c.status || 'ACTIVE').toLowerCase(),
    progress: c.progress || 0
  }))

  const fetchAllCourses = async () => {
    setLoadingAll(true)
    try {
      const { data } = await api.get('/courses')
      const list = mapCourseList(data?.data)
      setAllCourses(list)
    } catch (e) {
      setError(e?.message || '加载课程失败')
    } finally {
      setLoadingAll(false)
    }
  }

  const fetchMyCourses = async () => {
    setLoadingMine(true)
    try {
      const token = localStorage.getItem('token')
      if (!token || !currentUser) {
        setMyCourses(mapCourseList(allCourses))
      } else {
        const { data } = await api.get('/courses/mine', { headers: { Authorization: `Bearer ${token}` } })
        setMyCourses(mapCourseList(data?.data))
      }
    } catch (e) {
      // 如果出错，回退到全部课程
      setMyCourses(mapCourseList(allCourses))
    } finally {
      setLoadingMine(false)
    }
  }

  // 加载课程数据（从后端）
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await fetchAllCourses()
      await fetchMyCourses()
      setLoading(false)
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (currentUser?.role === 'STUDENT') {
      fetchMyCourses()
    } else if (currentUser && currentUser.role !== 'STUDENT') {
      setMyCourses(mapCourseList(allCourses))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, allCourses])

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    teacher: '',
    startDate: '',
    status: 'active'
  })
  const [joinSearch, setJoinSearch] = useState('') // Join对话框内搜索
  const [showStudentCoursesOnly] = useState(true) // 学生默认仅展示关联课程

  // 根据角色过滤课程
  const getFilteredCourses = () => {
    const dataSource = currentUser?.role === 'STUDENT' && showStudentCoursesOnly ? myCourses : (currentUser?.role === 'STUDENT' ? myCourses : allCourses)
    let filtered = dataSource
    return filtered.filter(course =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.teacher.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const filteredCourses = getFilteredCourses()

  // 使用权限工具函数

  // 检查Student是否已Join Course
  const isEnrolled = (course) => {
    if (!currentUser || currentUser.role !== 'STUDENT') return false
    return course.enrolledStudents?.includes(currentUser.id)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Active', variant: 'default' },
      upcoming: { label: 'Upcoming', variant: 'secondary' },
      completed: { label: 'Completed', variant: 'outline' }
    }
    const config = statusConfig[status]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      description: '',
      teacher: currentUser?.name || '',
      startDate: '',
      status: 'active'
    })
    setIsCreateDialogOpen(true)
  }

  const handleOpenEdit = (course) => {
    setEditingCourse(course)
    setFormData({
      name: course.name,
      description: course.description,
      teacher: course.teacher,
      startDate: course.startDate,
      status: course.status
    })
    setIsEditDialogOpen(true)
  }

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem('token')
      const payload = {
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        teacherId: currentUser?.id
      }
      await api.post('/courses', payload, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      setIsCreateDialogOpen(false)
      setFormData({ name: '', description: '', teacher: '', startDate: '', status: 'active' })
      await fetchAllCourses()
      await fetchMyCourses()
    } catch (e) {
      alert(e?.response?.data?.error || e?.message || '创建课程失败')
    }
  }

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token')
      await api.put(`/courses/${editingCourse.id}`,
        { name: formData.name, description: formData.description, status: formData.status.toUpperCase() },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      )
      setIsEditDialogOpen(false)
      setEditingCourse(null)
      await fetchAllCourses()
      await fetchMyCourses()
    } catch (e) {
      alert(e?.response?.data?.error || e?.message || '更新课程失败')
    }
  }

  const handleDelete = async (courseId) => {
    if (!confirm('Confirm要Delete这门课程吗?')) return
    try {
      const token = localStorage.getItem('token')
      await api.delete(`/courses/${courseId}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      await fetchAllCourses()
      await fetchMyCourses()
    } catch (e) {
      alert(e?.response?.data?.error || e?.message || '删除课程失败')
    }
  }

  const handleJoinCourse = async (course) => {
    try {
      const token = localStorage.getItem('token')
      await api.post(`/courses/${course.id}/enroll`, {}, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      setIsJoinDialogOpen(false)
      await fetchAllCourses()
      await fetchMyCourses()
    } catch (e) {
      alert(e?.response?.data?.error || e?.message || '加入课程失败')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // 获取可加入的课程列表(Student用)
  const joinedIds = new Set(myCourses.map(c => c.id))
  const availableCourses = currentUser?.role === 'STUDENT' 
    ? allCourses.filter(course => 
        !joinedIds.has(course.id) &&
        (course.name.toLowerCase().includes(joinSearch.toLowerCase()) || 
        course.teacher.toLowerCase().includes(joinSearch.toLowerCase()))
      )
    : allCourses.filter(course =>
        course.name.toLowerCase().includes(joinSearch.toLowerCase()) || 
        course.teacher.toLowerCase().includes(joinSearch.toLowerCase())
      )

  const isStudent = currentUser?.role === 'STUDENT'
  const isLoadingCourses = loading || (isStudent && loadingMine)

  return (
    <div className="space-y-6">
      {/* 页面Title */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Course Management</h1>
          <p className="text-muted-foreground mt-2">
            {currentUser?.role === 'TEACHER' && '管理您Create的课程'}
            {currentUser?.role === 'STUDENT' && 'View your enrolled courses'}
            {currentUser?.role === 'ADMIN' && 'Manage all courses'}
          </p>
        </div>
        {currentUser && (
          <Badge variant="outline" className="gap-1">
            <Shield className="h-3 w-3" />
            {currentUser.role === 'TEACHER' ? 'Teacher' : currentUser.role === 'STUDENT' ? 'Student' : 'Admin'}
          </Badge>
        )}
      </div>

      {/* 操作栏 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses or teachers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          {/* Student显示Join Course按钮 */}
          {canJoinCourse() && (
            <Button onClick={() => { setIsJoinDialogOpen(true); fetchAllCourses(); }} variant="outline" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Join Course
            </Button>
          )}
          
          {/* Teacher和Admin显示Create按钮 */}
          {canCreateCourse() && (
            <Button onClick={handleOpenCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Create New Course
            </Button>
          )}
        </div>
      </div>

      {/* 课程网格 */}
      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}
      {isLoadingCourses ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            正在加载课程，请稍候…
          </CardContent>
        </Card>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const canManage = hasManagePermission(course)
            
            return (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{course.name}</CardTitle>
                        <CardDescription className="text-sm">{course.teacher}</CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(course.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{course.students} Student</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{course.startDate}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => onSelectCourse(course)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Enter Course
                    </Button>
                    
                    {canEditCourse(course) && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenEdit(course)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {canDeleteCourse(course) && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(course.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {isStudent ? "Haven't joined any courses yet" : "No courses yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {isStudent 
                ? 'Click "Join Course" button to start learning' 
                : 'Click "Create New Course" button to start creating'}
            </p>
            {canJoinCourse() ? (
              <Button onClick={() => { setIsJoinDialogOpen(true); fetchAllCourses() }} className="gap-2">
                <UserPlus className="h-4 w-4" />
                Join Course
              </Button>
            ) : canCreateCourse() ? (
              <Button onClick={handleOpenCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Create New Course
              </Button>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Create课程对话框 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>
              填写课程基本信息,Create一门新课程
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Course Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="例如: 机器学习基础"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Course Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="简要描述课程Content和目标"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="teacher">Instructor *</Label>
              <Input
                id="teacher"
                name="teacher"
                value={formData.teacher}
                onChange={handleInputChange}
                placeholder="例如: 张教授"
                disabled={currentUser?.role === 'TEACHER'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Course Status</Label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreate}
              disabled={!formData.name || !formData.teacher || !formData.startDate}
            >
              Create课程
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit课程对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit课程</DialogTitle>
            <DialogDescription>
              Modify course information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Course Name *</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="例如: 机器学习基础"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Course Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="简要描述课程Content和目标"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-teacher">Instructor *</Label>
              <Input
                id="edit-teacher"
                name="teacher"
                value={formData.teacher}
                onChange={handleInputChange}
                placeholder="例如: 张教授"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-startDate">Start Date *</Label>
              <Input
                id="edit-startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Course Status</Label>
              <select
                id="edit-status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate}
              disabled={!formData.name || !formData.teacher || !formData.startDate}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join Course对话框(Student用) */}
      <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Join Course</DialogTitle>
            <DialogDescription>
              Select courses you want to join
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索课程名称或教师..."
                value={joinSearch}
                onChange={(e) => setJoinSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-3 py-2 max-h-[520px] overflow-y-auto">
            {availableCourses.length > 0 ? (
              availableCourses.map((course) => (
                <Card key={course.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{course.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{course.teacher}</span>
                          <span>•</span>
                          <span>{course.students} Student</span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleJoinCourse(course)}
                        className="gap-1"
                      >
                        <UserPlus className="h-4 w-4" />
                        加入
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No courses available to join
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsJoinDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CourseManagement

