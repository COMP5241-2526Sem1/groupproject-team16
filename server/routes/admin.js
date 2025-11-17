const express = require('express')
const router = express.Router()
const { authenticateToken, authorizeRoles } = require('../middleware/auth')
const { getPrisma } = require('../utils/prisma')

const prisma = getPrisma()

const tablesConfig = {
  users: {
    label: '用户（users）',
    description: '平台所有账号与角色信息',
    model: 'user',
    idField: 'id',
    orderBy: { createdAt: 'desc' },
    columns: [
      { key: 'id', label: 'ID', type: 'text' },
      { key: 'name', label: '姓名', type: 'text' },
      { key: 'email', label: '邮箱', type: 'text' },
      { key: 'role', label: '角色', type: 'select', options: ['ADMIN', 'TEACHER', 'STUDENT'] },
      { key: 'createdAt', label: '创建时间', type: 'datetime' }
    ],
    editableFields: ['name', 'email', 'role']
  },
  courses: {
    label: '课程（courses）',
    description: '课程基础信息与状态',
    model: 'course',
    idField: 'id',
    orderBy: { updatedAt: 'desc' },
    columns: [
      { key: 'id', label: 'ID', type: 'text' },
      { key: 'name', label: '课程名', type: 'text' },
      { key: 'status', label: '状态', type: 'select', options: ['ACTIVE', 'UPCOMING', 'COMPLETED'] },
      { key: 'teacherId', label: '教师ID', type: 'text' },
      { key: 'createdAt', label: '创建时间', type: 'datetime' }
    ],
    editableFields: ['name', 'status']
  },
  homeworks: {
    label: '作业（homeworks）',
    description: '课程作业与截止时间',
    model: 'homework',
    idField: 'id',
    orderBy: { createdAt: 'desc' },
    columns: [
      { key: 'id', label: 'ID', type: 'text' },
      { key: 'courseId', label: '课程ID', type: 'text' },
      { key: 'title', label: '标题', type: 'text' },
      { key: 'deadline', label: '截止时间', type: 'datetime' },
      { key: 'createdAt', label: '创建时间', type: 'datetime' }
    ],
    editableFields: ['title', 'deadline']
  },
  quizzes: {
    label: '测验（quizzes）',
    description: '测验基本配置',
    model: 'quiz',
    idField: 'id',
    orderBy: { createdAt: 'desc' },
    columns: [
      { key: 'id', label: 'ID', type: 'text' },
      { key: 'courseId', label: '课程ID', type: 'text' },
      { key: 'title', label: '标题', type: 'text' },
      { key: 'duration', label: '时长(分钟)', type: 'number' },
      { key: 'createdAt', label: '创建时间', type: 'datetime' }
    ],
    editableFields: ['title', 'duration']
  },
  course_resources: {
    label: '资源（course_resources）',
    description: '课程上传的资料与文件',
    model: 'courseResource',
    idField: 'id',
    orderBy: { uploadedAt: 'desc' },
    columns: [
      { key: 'id', label: 'ID', type: 'text' },
      { key: 'courseId', label: '课程ID', type: 'text' },
      { key: 'name', label: '名称', type: 'text' },
      { key: 'type', label: '类型', type: 'text' },
      { key: 'uploadedAt', label: '上传时间', type: 'datetime' }
    ],
    editableFields: ['name', 'type']
  },
  votes: {
    label: '投票（votes）',
    description: '问卷与投票配置',
    model: 'vote',
    idField: 'id',
    orderBy: { createdAt: 'desc' },
    columns: [
      { key: 'id', label: 'ID', type: 'text' },
      { key: 'courseId', label: '课程ID', type: 'text' },
      { key: 'title', label: '标题', type: 'text' },
      { key: 'type', label: '类型', type: 'select', options: ['SINGLE', 'MULTIPLE'] },
      { key: 'deadline', label: '截止时间', type: 'datetime' }
    ],
    editableFields: ['title', 'type', 'deadline']
  }
}

router.use(authenticateToken, authorizeRoles('ADMIN'))

router.get('/tables', async (req, res) => {
  try {
    const entries = await Promise.all(Object.entries(tablesConfig).map(async ([key, config]) => {
      const count = await prisma[config.model].count()
      return {
        key,
        label: config.label,
        description: config.description,
        count
      }
    }))
    res.json({ success: true, data: entries })
  } catch (error) {
    console.error('Admin tables error:', error)
    res.status(500).json({ error: '获取表信息失败', message: error.message })
  }
})

router.get('/tables/:table', async (req, res) => {
  try {
    const { table } = req.params
    const config = tablesConfig[table]
    if (!config) return res.status(404).json({ error: '表不存在' })
    const rows = await prisma[config.model].findMany({
      take: 100,
      orderBy: config.orderBy || undefined
    })
    res.json({
      success: true,
      data: {
        label: config.label,
        columns: config.columns,
        editableFields: config.editableFields,
        idField: config.idField,
        rows
      }
    })
  } catch (error) {
    console.error('Admin table fetch error:', error)
    res.status(500).json({ error: '获取数据失败', message: error.message })
  }
})

router.put('/tables/:table/:id', async (req, res) => {
  try {
    const { table, id } = req.params
    const config = tablesConfig[table]
    if (!config) return res.status(404).json({ error: '表不存在' })
    const payload = config.editableFields.reduce((acc, field) => {
      if (req.body[field] !== undefined) acc[field] = req.body[field]
      return acc
    }, {})
    if (!Object.keys(payload).length) {
      return res.status(400).json({ error: '没有可更新的字段' })
    }
    const updated = await prisma[config.model].update({
      where: { [config.idField]: id },
      data: payload
    })
    res.json({ success: true, data: updated })
  } catch (error) {
    console.error('Admin table update error:', error)
    res.status(500).json({ error: '更新失败', message: error.message })
  }
})

router.get('/overview', async (req, res) => {
  try {
    const [userCounts, courseCounts, homeworkCount, quizCount, resourceCount, topCourses] = await Promise.all([
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true }
      }),
      prisma.course.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.homework.count(),
      prisma.quiz.count(),
      prisma.courseResource.count(),
      prisma.course.findMany({
        take: 5,
        orderBy: { students: { _count: 'desc' } },
        select: {
          id: true,
          name: true,
          status: true,
          _count: { select: { students: true } }
        }
      })
    ])

    const userStats = {
      total: userCounts.reduce((sum, row) => sum + row._count.role, 0),
      admins: userCounts.find(r => r.role === 'ADMIN')?._count.role || 0,
      teachers: userCounts.find(r => r.role === 'TEACHER')?._count.role || 0,
      students: userCounts.find(r => r.role === 'STUDENT')?._count.role || 0
    }

    const courseStats = {
      total: courseCounts.reduce((sum, row) => sum + row._count.status, 0),
      active: courseCounts.find(r => r.status === 'ACTIVE')?._count.status || 0,
      upcoming: courseCounts.find(r => r.status === 'UPCOMING')?._count.status || 0,
      completed: courseCounts.find(r => r.status === 'COMPLETED')?._count.status || 0
    }

    res.json({
      success: true,
      data: {
        userStats,
        courseStats,
        contentStats: {
          homeworks: homeworkCount,
          quizzes: quizCount,
          resources: resourceCount
        },
        popularCourses: topCourses.map(course => ({
          id: course.id,
          name: course.name,
          students: course._count.students,
          status: course.status
        }))
      }
    })
  } catch (error) {
    console.error('Admin overview error:', error)
    res.status(500).json({ error: '获取概览数据失败', message: error.message })
  }
})

module.exports = router

