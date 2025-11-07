const express = require('express');
const router = express.Router();
const { getPrisma } = require('../utils/prisma');
const { authenticateToken } = require('../middleware/auth');
const prisma = getPrisma();

// 获取所有作业
router.get('/', async (req, res) => {
  try {
    const { courseId } = req.query;
    const where = courseId ? { courseId } : {};
    
    const homeworks = await prisma.homework.findMany({
      where,
      include: {
        course: {
          include: {
            students: true
          }
        },
        submissions: {
          include: {
            student: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const data = homeworks.map(hw => {
      const totalStudents = hw.course.students.length;
      const submitted = hw.submissions.length;
      const isActive = new Date(hw.deadline) > new Date();
      
      return {
        id: hw.id,
        courseId: hw.courseId,
        title: hw.title,
        description: hw.description || '',
        dueDate: hw.deadline.toISOString(),
        totalScore: 100, // 默认总分
        status: isActive ? 'active' : 'closed',
        submitted,
        totalStudents,
        attachments: [], // 可以后续扩展
        submissions: hw.submissions.map(sub => ({
          id: sub.id,
          studentId: sub.studentId,
          studentName: sub.student.name,
          submitTime: sub.submittedAt.toISOString(),
          files: [{ name: sub.fileUrl.split('/').pop(), url: sub.fileUrl }],
          score: sub.score,
          status: sub.score !== null ? 'graded' : 'submitted',
          comment: sub.note || ''
        })),
        createdAt: hw.createdAt.toISOString()
      };
    });

    res.json({ success: true, data, total: data.length });
  } catch (error) {
    console.error('Error fetching homeworks:', error);
    res.status(500).json({ error: '获取作业列表失败', message: error.message });
  }
});

// 获取单个作业
router.get('/:id', async (req, res) => {
  try {
    const homework = await prisma.homework.findUnique({
      where: { id: req.params.id },
      include: {
        course: {
          include: {
            students: true
          }
        },
        submissions: {
          include: {
            student: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    if (!homework) {
      return res.status(404).json({ error: '作业不存在' });
    }

    const totalStudents = homework.course.students.length;
    const submitted = homework.submissions.length;
    const isActive = new Date(homework.deadline) > new Date();

    const data = {
      id: homework.id,
      courseId: homework.courseId,
      title: homework.title,
      description: homework.description || '',
      dueDate: homework.deadline.toISOString(),
      totalScore: 100,
      status: isActive ? 'active' : 'closed',
      submitted,
      totalStudents,
      attachments: [],
      submissions: homework.submissions.map(sub => ({
        id: sub.id,
        studentId: sub.studentId,
        studentName: sub.student.name,
        submitTime: sub.submittedAt.toISOString(),
        files: [{ name: sub.fileUrl.split('/').pop(), url: sub.fileUrl }],
        score: sub.score,
        status: sub.score !== null ? 'graded' : 'submitted',
        comment: sub.note || ''
      })),
      createdAt: homework.createdAt.toISOString()
    };

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching homework:', error);
    res.status(500).json({ error: '获取作业详情失败', message: error.message });
  }
});

// 创建作业
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, dueDate, totalScore, courseId } = req.body;
    if (!title || !description || !dueDate) {
      return res.status(400).json({ error: '缺少必填字段' });
    }

    const homework = await prisma.homework.create({
      data: {
        courseId: courseId || req.user?.courseId || '1',
        title,
        description,
        deadline: new Date(dueDate)
      },
      include: {
        course: {
          include: {
            students: true
          }
        }
      }
    });

    const data = {
      id: homework.id,
      courseId: homework.courseId,
      title: homework.title,
      description: homework.description || '',
      dueDate: homework.deadline.toISOString(),
      totalScore: totalScore || 100,
      status: 'active',
      submitted: 0,
      totalStudents: homework.course.students.length,
      attachments: [],
      submissions: [],
      createdAt: homework.createdAt.toISOString()
    };

    res.status(201).json({ success: true, data, message: '作业创建成功' });
  } catch (error) {
    console.error('Error creating homework:', error);
    res.status(500).json({ error: '创建作业失败', message: error.message });
  }
});

// 更新作业
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, dueDate, totalScore, status } = req.body;
    const updateData = {};
    
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate) updateData.deadline = new Date(dueDate);

    const homework = await prisma.homework.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        course: {
          include: {
            students: true
          }
        },
        submissions: true
      }
    });

    const isActive = new Date(homework.deadline) > new Date();
    const data = {
      id: homework.id,
      courseId: homework.courseId,
      title: homework.title,
      description: homework.description || '',
      dueDate: homework.deadline.toISOString(),
      totalScore: totalScore || 100,
      status: isActive ? 'active' : 'closed',
      submitted: homework.submissions.length,
      totalStudents: homework.course.students.length,
      attachments: [],
      submissions: []
    };

    res.json({ success: true, data, message: '作业更新成功' });
  } catch (error) {
    console.error('Error updating homework:', error);
    res.status(500).json({ error: '更新作业失败', message: error.message });
  }
});

// 删除作业
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.homework.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: '作业删除成功' });
  } catch (error) {
    console.error('Error deleting homework:', error);
    res.status(500).json({ error: '删除作业失败', message: error.message });
  }
});

// 获取作业提交列表
router.get('/:id/submissions', async (req, res) => {
  try {
    const homework = await prisma.homework.findUnique({
      where: { id: req.params.id },
      include: {
        submissions: {
          include: {
            student: {
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    if (!homework) {
      return res.status(404).json({ error: '作业不存在' });
    }

    const data = homework.submissions.map(sub => ({
      id: sub.id,
      studentId: sub.studentId,
      studentName: sub.student.name,
      submitTime: sub.submittedAt.toISOString(),
      files: [{ name: sub.fileUrl.split('/').pop(), url: sub.fileUrl }],
      score: sub.score,
      status: sub.score !== null ? 'graded' : 'submitted',
      comment: sub.note || ''
    }));

    res.json({ success: true, data, total: data.length });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: '获取提交列表失败', message: error.message });
  }
});

// 提交作业
router.post('/:id/submit', authenticateToken, async (req, res) => {
  try {
    const { files, comment } = req.body;
    const studentId = req.user?.userId;
    
    if (!studentId) {
      return res.status(400).json({ error: '缺少学生ID' });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ error: '缺少文件' });
    }

    // 检查是否已提交
    const existing = await prisma.homeworkSubmission.findUnique({
      where: {
        homeworkId_studentId: {
          homeworkId: req.params.id,
          studentId
        }
      }
    });

    const fileUrl = files[0]?.url || files[0] || '/uploads/submissions/default.zip';

    if (existing) {
      // 更新现有提交
      const submission = await prisma.homeworkSubmission.update({
        where: { id: existing.id },
        data: {
          fileUrl,
          note: comment || '',
          submittedAt: new Date()
        },
        include: {
          student: {
            select: { id: true, name: true }
          }
        }
      });

      return res.json({
        success: true,
        data: {
          id: submission.id,
          studentId: submission.studentId,
          studentName: submission.student.name,
          submitTime: submission.submittedAt.toISOString(),
          files: [{ name: fileUrl.split('/').pop(), url: fileUrl }],
          score: submission.score,
          status: 'submitted',
          comment: submission.note || ''
        },
        message: '作业提交成功'
      });
    }

    // 创建新提交
    const submission = await prisma.homeworkSubmission.create({
      data: {
        homeworkId: req.params.id,
        studentId,
        fileUrl,
        note: comment || ''
      },
      include: {
        student: {
          select: { id: true, name: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: {
        id: submission.id,
        studentId: submission.studentId,
        studentName: submission.student.name,
        submitTime: submission.submittedAt.toISOString(),
        files: [{ name: fileUrl.split('/').pop(), url: fileUrl }],
        score: null,
        status: 'submitted',
        comment: submission.note || ''
      },
      message: '作业提交成功'
    });
  } catch (error) {
    console.error('Error submitting homework:', error);
    res.status(500).json({ error: '提交作业失败', message: error.message });
  }
});

// 评分作业
router.post('/:id/grade', authenticateToken, async (req, res) => {
  try {
    const { submissionId, score, comment } = req.body;
    if (!submissionId || score === undefined) {
      return res.status(400).json({ error: '缺少必填字段' });
    }

    const submission = await prisma.homeworkSubmission.update({
      where: { id: submissionId },
      data: {
        score: parseFloat(score),
        note: comment || ''
      },
      include: {
        student: {
          select: { id: true, name: true }
        }
      }
    });

    res.json({
      success: true,
      data: {
        id: submission.id,
        studentId: submission.studentId,
        studentName: submission.student.name,
        submitTime: submission.submittedAt.toISOString(),
        files: [{ name: submission.fileUrl.split('/').pop(), url: submission.fileUrl }],
        score: submission.score,
        status: 'graded',
        comment: submission.note || ''
      },
      message: '评分成功'
    });
  } catch (error) {
    console.error('Error grading homework:', error);
    res.status(500).json({ error: '评分失败', message: error.message });
  }
});

module.exports = router;
