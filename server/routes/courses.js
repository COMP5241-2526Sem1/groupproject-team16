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

// 获取当前用户关联课程
router.get('/mine', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;
    let courses = [];

    if (role === 'ADMIN') {
      courses = await prisma.course.findMany({
        include: {
          teacher: { select: { id: true, name: true, email: true } },
          students: true
        }
      });
    } else if (role === 'TEACHER') {
      courses = await prisma.course.findMany({
        where: { teacherId: userId },
        include: {
          teacher: { select: { id: true, name: true, email: true } },
          students: true
        }
      });
    } else {
      // 学生
      const enrollments = await prisma.courseStudent.findMany({
        where: { studentId: userId },
        include: {
          course: {
            include: {
              teacher: { select: { id: true, name: true, email: true } },
              students: true
            }
          }
        }
      });
      courses = enrollments.map(e => e.course);
    }

    const data = courses.map(c => ({
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
    res.status(500).json({ error: '获取用户课程失败', message: error.message });
  }
});

// 课程概览
router.get('/:id/overview', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        students: true,
        homeworks: { include: { submissions: true }, orderBy: { deadline: 'asc' } },
        quizzes: { include: { submissions: true }, orderBy: { createdAt: 'desc' } },
        votes: { include: { results: true }, orderBy: { deadline: 'desc' } },
        resources: { orderBy: { uploadedAt: 'desc' } }
      }
    });
    if (!course) return res.status(404).json({ error: '课程不存在' });

    const homeworkUpcoming = course.homeworks
      .filter(hw => hw.deadline ? new Date(hw.deadline) >= new Date() : true)
      .slice(0, 3)
      .map(hw => ({
        id: hw.id,
        title: hw.title,
        deadline: hw.deadline
      }));

    const quizUpcoming = course.quizzes.slice(0, 3).map(q => ({
      id: q.id,
      title: q.title,
      duration: q.duration,
      date: q.createdAt
    }));

    const voteActive = course.votes
      .filter(v => v.deadline ? new Date(v.deadline) >= new Date() : true)
      .slice(0, 3)
      .map(v => ({
        id: v.id,
        title: v.title,
        deadline: v.deadline
      }));

    const resources = course.resources.slice(0, 5).map(r => ({
      id: r.id,
      name: r.name,
      type: r.type,
      uploader: course.teacher?.name || '教师',
      uploadedAt: r.uploadedAt,
      downloads: r.downloads
    }));

    const response = {
      course: {
        id: course.id,
        name: course.name,
        teacherName: course.teacher?.name || '',
        studentCount: course.students.length,
        startDate: course.startDate
      },
      homework: {
        total: course.homeworks.length,
        pending: homeworkUpcoming.length,
        upcoming: homeworkUpcoming
      },
      quiz: {
        total: course.quizzes.length,
        pending: quizUpcoming.length,
        upcoming: quizUpcoming
      },
      vote: {
        total: course.votes.length,
        active: voteActive.length,
        activeList: voteActive
      },
      resources: {
        total: course.resources.length,
        latest: resources
      }
    };

    res.json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ error: '获取课程概览失败', message: error.message });
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

