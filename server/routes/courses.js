const express = require('express');
const router = express.Router();
const { getPrisma } = require('../utils/prisma');
const { authenticateToken } = require('../middleware/auth');
const prisma = getPrisma();

// 获取所有课程
router.get('/', async (req, res) => {
  try {
    const list = await prisma.course.findMany({
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        students: true
      }
    });
    const data = list.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      teacherId: c.teacherId,
      teacherName: c.teacher?.name || '',
      students: c.students?.length || 0,
      startDate: c.startDate,
      status: c.status,
      progress: 0
    }));
    res.json({ success: true, data, total: data.length });
  } catch (error) {
    res.status(500).json({ error: '获取课程列表失败', message: error.message });
  }
});

// 获取单个课程
router.get('/:id', async (req, res) => {
  try {
    const c = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        students: true,
        discussions: true,
        homeworks: true,
        quizzes: true,
        resources: true
      }
    });
    if (!c) return res.status(404).json({ error: '课程不存在' });
    const course = {
      id: c.id,
      name: c.name,
      description: c.description,
      teacherId: c.teacherId,
      teacherName: c.teacher?.name || '',
      students: c.students?.length || 0,
      startDate: c.startDate,
      status: c.status,
      progress: 0
    };
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ error: '获取课程详情失败', message: error.message });
  }
});

// 创建课程（需要登录）
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, startDate, teacherId } = req.body;
    if (!name) return res.status(400).json({ error: '课程名称不能为空' });
    const effectiveTeacherId = teacherId || req.user?.userId;
    if (!effectiveTeacherId) return res.status(400).json({ error: '缺少教师ID' });
    const created = await prisma.course.create({
      data: {
        name,
        description: description || '',
        teacherId: effectiveTeacherId,
        startDate: startDate ? new Date(startDate) : null,
      }
    });
    res.status(201).json({ success: true, message: '课程创建成功', data: created });
  } catch (error) {
    res.status(500).json({ error: '创建课程失败', message: error.message });
  }
});

// 更新课程（需要登录）
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const updated = await prisma.course.update({
      where: { id: req.params.id },
      data: { name, description, status }
    });
    res.json({ success: true, message: '课程更新成功', data: updated });
  } catch (error) {
    res.status(500).json({ error: '更新课程失败', message: error.message });
  }
});

// 删除课程（需要登录）
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.course.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: '课程删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除课程失败', message: error.message });
  }
});

// 加入课程（需要登录）
router.post('/:id/enroll', authenticateToken, async (req, res) => {
  try {
    const courseId = req.params.id;
    const studentId = req.user?.userId;
    if (!studentId) return res.status(400).json({ error: '缺少学生ID' });
    // 去重唯一约束
    await prisma.courseStudent.create({ data: { courseId, studentId } });
    res.json({ success: true, message: '加入课程成功' });
  } catch (error) {
    if (error?.code === 'P2002') {
      return res.json({ success: true, message: '已加入课程' });
    }
    res.status(500).json({ error: '加入课程失败', message: error.message });
  }
});

module.exports = router;

