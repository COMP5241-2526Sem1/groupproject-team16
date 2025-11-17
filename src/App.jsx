import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { BookOpen, Users, FileText, MessageSquare, BarChart3, Brain, CheckSquare, Vote, FolderOpen, GraduationCap, Settings, LogOut, Home, Menu, ChevronLeft, ChevronRight, Bell, Bot } from 'lucide-react'
import './App.css'
import Dashboard from './components/Dashboard'
import CourseManagement from './components/CourseManagement'
import HomeworkModule from './components/HomeworkModule'
import QuizModule from './components/QuizModule'
import DiscussionModule from './components/DiscussionModule'
import ResourceModule from './components/ResourceModule'
import VoteModule from './components/VoteModule'
import AgentGenerator from './components/AgentGenerator'
import AIChat from './components/AIChat'
import Login from './components/Login'
import Notifications from './components/Notifications.jsx'
import Profile from './components/Profile.jsx'
import StudentOverview from './components/StudentOverview.jsx'
import AdminPanel from './components/admin/AdminPanel.jsx'

// NavHead - 顶部导航栏组件
function NavHead({ currentCourse, user, onLogout }) {
  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo和系统标题 */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <GraduationCap className="h-8 w-8 text-primary" />
              <div className="hidden sm:block">
                <div className="text-lg font-bold text-primary">Agent Teaching Platform</div>
                {currentCourse && (
                  <div className="text-xs text-muted-foreground">{currentCourse}</div>
                )}
              </div>
            </Link>
          </div>

          {/* 右侧用户区域 */}
          <div className="flex items-center gap-3">
            <Link to="/notifications" className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
            {user && (
              <>
                <div className="hidden sm:flex flex-col items-end mr-2">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.role === 'TEACHER' ? 'Teacher' : user.role === 'STUDENT' ? 'Student' : 'Admin'}</span>
                </div>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-semibold text-sm">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                )}
              </>
            )}
            <Button variant="ghost" size="icon" onClick={onLogout} title="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

// LeftAside - 左侧导航栏组件
function LeftAside({ collapsed, onToggle, user }) {
  const location = useLocation()
  
  // 根据用户角色过滤菜单项
  const allMenuItems = [
    { path: '/course/overview', icon: Home, label: 'Overview', roles: ['TEACHER', 'STUDENT', 'ADMIN'] },
    { path: '/course/discussion', icon: MessageSquare, label: 'Discussion', roles: ['TEACHER', 'STUDENT', 'ADMIN'] },
    { path: '/course/homework', icon: FileText, label: 'Homework', roles: ['TEACHER', 'STUDENT', 'ADMIN'] },
    { path: '/course/quiz', icon: CheckSquare, label: 'AI Quiz', roles: ['TEACHER', 'STUDENT', 'ADMIN'] },
    { path: '/course/resources', icon: FolderOpen, label: 'Resources', roles: ['TEACHER', 'STUDENT', 'ADMIN'] },
    { path: '/course/vote', icon: Vote, label: 'Polls', roles: ['TEACHER', 'STUDENT', 'ADMIN'] },
    { path: '/course/agent', icon: Brain, label: 'AI Course', roles: ['TEACHER', 'ADMIN'] },
    { path: '/course/ai-chat', icon: Bot, label: 'AI Chat', roles: ['TEACHER', 'STUDENT', 'ADMIN'] },
  ]
  
  const menuItems = user ? allMenuItems.filter(item => item.roles.includes(user.role)) : []

  return (
    <aside 
      className={`bg-white border-r border-border transition-all duration-300 flex flex-col ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* 折叠按钮 */}
      <div className="flex justify-end p-2 border-b border-border">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onToggle}
          className="h-8 w-8"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <Link key={item.path} to={item.path}>
              <div
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </div>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

// 应用内容组件
function AppContent() {
  const [currentCourse, setCurrentCourse] = useState(() => {
    try {
      const saved = localStorage.getItem('selectedCourse')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()

  // 检查登录状态
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    try {
      if (savedUser && token) {
        setUser(JSON.parse(savedUser))
      }
    } catch (err) {
      console.error('Failed to parse user data:', err)
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    }
    try {
      const savedCourse = localStorage.getItem('selectedCourse')
      if (savedCourse) setCurrentCourse(JSON.parse(savedCourse))
    } catch {
      setCurrentCourse(null)
    }
    
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (user?.role !== 'ADMIN') return
    const path = location.pathname
    const inAdminPanel = path.startsWith('/admin')
    const allowedStandalone = path.startsWith('/notifications') || path.startsWith('/profile')
    if (!inAdminPanel && !allowedStandalone) {
      navigate('/admin/overview', { replace: true })
    }
  }, [user, location.pathname, navigate])

  // 登录处理
  const handleLogin = (userData) => {
    setUser(userData)
  }

  // 登出处理
  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('selectedCourse')
    setUser(null)
    setCurrentCourse(null)
    navigate('/')
  }

  // 选择课程
  const handleSelectCourse = (course) => {
    setCurrentCourse(course)
    try {
      localStorage.setItem('selectedCourse', JSON.stringify(course))
    } catch {}
    navigate('/course/overview')
  }

  // 加载中
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // 未登录显示登录页
  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  // 判断是否在课程内部
  const isInCourse = location.pathname.startsWith('/course/')

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* NavHead - 顶部导航栏 */}
      <NavHead currentCourse={currentCourse?.name} user={user} onLogout={handleLogout} />
      
      {/* 主体内容区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* LeftAside - 左侧导航栏 (仅在课程内显示) */}
        {isInCourse && (
          <LeftAside 
            collapsed={sidebarCollapsed} 
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            user={user}
          />
        )}

        {/* Main - 主内容区 */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              {/* 控制台模式 - 课程选择页 */}
              <Route path="/" element={<CourseManagement onSelectCourse={handleSelectCourse} />} />
              
              {/* 课程内部模式 */}
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile onLogout={handleLogout} />} />
              <Route
                path="/admin/*"
                element={user?.role === 'ADMIN' ? <AdminPanel /> : <Navigate to="/" replace />}
              />
              <Route
                path="/course/overview"
                element={user?.role === 'STUDENT' ? <StudentOverview /> : <Dashboard />}
              />
              <Route path="/course/discussion" element={<DiscussionModule />} />
              <Route path="/course/homework" element={<HomeworkModule />} />
              <Route path="/course/quiz" element={<QuizModule />} />
              <Route path="/course/resources" element={<ResourceModule />} />
              <Route path="/course/vote" element={<VoteModule />} />
              <Route path="/course/agent" element={<AgentGenerator />} />
              <Route path="/course/ai-chat" element={<AIChat />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}

// 主应用组件
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App

