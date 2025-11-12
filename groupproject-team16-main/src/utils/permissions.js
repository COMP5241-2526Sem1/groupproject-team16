// 权限工具函数
export const getCurrentUser = () => {
  try {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  } catch {
    return null
  }
}

// 检查是否为管理员
export const isAdmin = () => {
  const user = getCurrentUser()
  return user?.role === 'ADMIN'
}

// 检查是否为教师
export const isTeacher = () => {
  const user = getCurrentUser()
  return user?.role === 'TEACHER'
}

// 检查是否为学生
export const isStudent = () => {
  const user = getCurrentUser()
  return user?.role === 'STUDENT'
}

// 检查是否有管理权限（管理员或课程创建者）
export const hasManagePermission = (course) => {
  const user = getCurrentUser()
  if (!user) return false
  if (user.role === 'ADMIN') return true
  if (user.role === 'TEACHER' && course?.teacherId === user.id) return true
  return false
}

// 检查是否可以创建课程（教师或管理员）
export const canCreateCourse = () => {
  return isAdmin() || isTeacher()
}

// 检查是否可以发布作业（教师或管理员）
export const canPublishHomework = () => {
  return isAdmin() || isTeacher()
}

// 检查是否可以创建测验（教师或管理员）
export const canCreateQuiz = () => {
  return isAdmin() || isTeacher()
}

// 检查是否可以批改作业（教师或管理员）
export const canGradeHomework = () => {
  return isAdmin() || isTeacher()
}

// 检查是否可以查看数据分析（教师或管理员）
export const canViewAnalytics = () => {
  return isAdmin() || isTeacher()
}

// 检查是否可以管理资源（教师或管理员）
export const canManageResources = () => {
  return isAdmin() || isTeacher()
}

// 检查是否可以创建投票（教师或管理员）
export const canCreateVote = () => {
  return isAdmin() || isTeacher()
}

// 检查是否可以置顶讨论（教师或管理员）
export const canPinDiscussion = () => {
  return isAdmin() || isTeacher()
}

// 检查是否可以编辑/删除自己的帖子
export const canEditPost = (post) => {
  const user = getCurrentUser()
  if (!user) return false
  if (user.role === 'ADMIN') return true
  if (post?.authorId === user.id) return true
  return false
}

// 检查是否可以删除自己的帖子
export const canDeletePost = (post) => {
  return canEditPost(post)
}

// 检查是否可以编辑/删除课程
export const canEditCourse = (course) => {
  return hasManagePermission(course)
}

// 检查是否可以删除课程
export const canDeleteCourse = (course) => {
  return hasManagePermission(course)
}

// 检查是否可以加入课程（学生）
export const canJoinCourse = () => {
  return isStudent()
}

// 检查是否可以提交作业（学生）
export const canSubmitHomework = () => {
  return isStudent()
}

// 检查是否可以参加测验（学生）
export const canTakeQuiz = () => {
  return isStudent()
}

// 检查是否可以参与投票（学生）
export const canVote = () => {
  return isStudent() || isTeacher() || isAdmin()
}

