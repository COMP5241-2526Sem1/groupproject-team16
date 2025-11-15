const express = require('express');
const router = express.Router();
const { getPrisma } = require('../utils/prisma');
const { authenticateToken } = require('../middleware/auth');
const OSSClient = require('../utils/oss-client');
const ossConfig = require('../utils/oss-config');
const prisma = getPrisma();
const ossClient = ossConfig.accessKeyId && ossConfig.accessKeySecret && ossConfig.bucket 
  ? new OSSClient(ossConfig.accessKeyId, ossConfig.accessKeySecret, ossConfig.bucket, ossConfig.region, ossConfig.prefix)
  : null;

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

    const data = await Promise.all(homeworks.map(async (hw) => {
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
      submissions: await Promise.all(hw.submissions.map(async (sub) => {
        let fileUrl = sub.fileUrl;
        try {
          if (ossClient && !fileUrl.startsWith('http')) {
            fileUrl = await ossClient.getFileUrl(sub.fileUrl, 3600 * 24 * 7);
          }
        } catch (e) {
          console.warn(`生成作业文件URL失败 (提交ID: ${sub.id}):`, e.message);
        }
        return {
          id: sub.id,
          studentId: sub.studentId,
          studentName: sub.student.name,
          submitTime: sub.submittedAt.toISOString(),
          files: [{ name: sub.fileUrl.split('/').pop(), url: fileUrl }],
          score: sub.score,
          status: sub.score !== null ? 'graded' : 'submitted',
          comment: sub.note || ''
        };
      })),
        createdAt: hw.createdAt.toISOString()
      };
    }));

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
      submissions: await Promise.all(homework.submissions.map(async (sub) => {
        let fileUrl = sub.fileUrl;
        try {
          if (ossClient && !fileUrl.startsWith('http')) {
            fileUrl = await ossClient.getFileUrl(sub.fileUrl, 3600 * 24 * 7);
          }
        } catch (e) {
          console.warn(`生成作业文件URL失败 (提交ID: ${sub.id}):`, e.message);
        }
        return {
          id: sub.id,
          studentId: sub.studentId,
          studentName: sub.student.name,
          submitTime: sub.submittedAt.toISOString(),
          files: [{ name: sub.fileUrl.split('/').pop(), url: fileUrl }],
          score: sub.score,
          status: sub.score !== null ? 'graded' : 'submitted',
          comment: sub.note || ''
        };
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
    if (!courseId) {
      return res.status(400).json({ error: '缺少课程ID' });
    }

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ error: '课程不存在' });
    }

    const homework = await prisma.homework.create({
      data: {
        courseId,
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

    const data = await Promise.all(homework.submissions.map(async (sub) => {
      let fileUrl = sub.fileUrl;
      try {
        if (ossClient && !fileUrl.startsWith('http')) {
          fileUrl = await ossClient.getFileUrl(sub.fileUrl, 3600 * 24 * 7);
        }
      } catch (e) {
        console.warn(`生成作业文件URL失败 (提交ID: ${sub.id}):`, e.message);
      }
      return {
        id: sub.id,
        studentId: sub.studentId,
        studentName: sub.student.name,
        submitTime: sub.submittedAt.toISOString(),
        files: [{ name: sub.fileUrl.split('/').pop(), url: fileUrl }],
        score: sub.score,
        status: sub.score !== null ? 'graded' : 'submitted',
        comment: sub.note || ''
      };
    }));

    res.json({ success: true, data, total: data.length });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: '获取提交列表失败', message: error.message });
  }
});

// 提交作业（接收上传后的文件信息）
router.post('/:id/submit', authenticateToken, async (req, res) => {
  try {
    const { fileUrl, ossPath, comment } = req.body;
    const studentId = req.user?.userId;
    
    if (!studentId) return res.status(400).json({ error: '缺少学生ID' });
    if (!fileUrl && !ossPath) return res.status(400).json({ error: '缺少文件信息' });

    const homework = await prisma.homework.findUnique({ where: { id: req.params.id } });
    if (!homework) return res.status(404).json({ error: '作业不存在' });

    const finalFileUrl = ossPath || fileUrl;

    // 检查是否已提交
    const existing = await prisma.homeworkSubmission.findUnique({
      where: {
        homeworkId_studentId: {
          homeworkId: req.params.id,
          studentId
        }
      }
    });

    if (existing) {
      // 删除旧的OSS文件
      if (ossClient && existing.fileUrl && !existing.fileUrl.startsWith('http')) {
        try {
          await ossClient.deleteFile(existing.fileUrl);
        } catch (e) {
          console.warn('删除旧作业文件失败:', e.message);
        }
      }
      
      // 更新现有提交
      const submission = await prisma.homeworkSubmission.update({
        where: { id: existing.id },
        data: {
          fileUrl: finalFileUrl,
          note: comment || '',
          submittedAt: new Date()
        },
        include: {
          student: {
            select: { id: true, name: true }
          }
        }
      });

      let previewUrl = finalFileUrl;
      try {
        if (ossClient && !finalFileUrl.startsWith('http')) {
          previewUrl = await ossClient.getFileUrl(finalFileUrl, 3600 * 24 * 7);
        }
      } catch (e) {
        console.warn('生成预览URL失败:', e.message);
      }

      return res.json({
        success: true,
        data: {
          id: submission.id,
          studentId: submission.studentId,
          studentName: submission.student.name,
          submitTime: submission.submittedAt.toISOString(),
          files: [{ name: finalFileUrl.split('/').pop(), url: previewUrl }],
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
        fileUrl: finalFileUrl,
        note: comment || ''
      },
      include: {
        student: {
          select: { id: true, name: true }
        }
      }
    });

    let previewUrl = finalFileUrl;
    try {
      if (ossClient && !finalFileUrl.startsWith('http')) {
        previewUrl = await ossClient.getFileUrl(finalFileUrl, 3600 * 24 * 7);
      }
    } catch (e) {
      console.warn('生成预览URL失败:', e.message);
    }

    res.status(201).json({
      success: true,
      data: {
        id: submission.id,
        studentId: submission.studentId,
        studentName: submission.student.name,
        submitTime: submission.submittedAt.toISOString(),
        files: [{ name: finalFileUrl.split('/').pop(), url: previewUrl }],
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

// 删除作业提交
router.delete('/submissions/:submissionId', authenticateToken, async (req, res) => {
  try {
    const submission = await prisma.homeworkSubmission.findUnique({
      where: { id: req.params.submissionId },
      include: { homework: true }
    });
    if (!submission) return res.status(404).json({ error: '提交不存在' });
    
    const studentId = req.user?.userId;
    if (submission.studentId !== studentId && req.user?.role !== 'TEACHER' && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: '无权删除此提交' });
    }
    
    // 从OSS删除文件
    if (ossClient && submission.fileUrl && !submission.fileUrl.startsWith('http')) {
      try {
        await ossClient.deleteFile(submission.fileUrl);
      } catch (e) {
        console.warn('OSS删除失败，继续删除数据库记录:', e.message);
      }
    }
    
    await prisma.homeworkSubmission.delete({ where: { id: req.params.submissionId } });
    res.json({ success: true, message: '提交删除成功' });
  } catch (error) {
    console.error('Error deleting submission:', error);
    res.status(500).json({ error: '删除提交失败', message: error.message });
  }
});

// 下载作业提交
router.get('/submissions/:submissionId/download', async (req, res) => {
  try {
    const submission = await prisma.homeworkSubmission.findUnique({
      where: { id: req.params.submissionId },
      include: {
        student: { select: { name: true } },
        homework: { select: { title: true } }
      }
    });
    if (!submission) return res.status(404).json({ error: '提交不存在' });
    
    if (!ossClient) return res.status(500).json({ error: 'OSS未配置' });
    
    const ossPath = submission.fileUrl;
    console.log(`尝试从OSS下载作业文件，路径: ${ossPath}`);
    
    try {
      const fileStream = await ossClient.getFileStream(ossPath);
      const fileName = `${submission.student.name}_${submission.homework.title}_${ossPath.split('/').pop()}`;
      
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
      res.setHeader('Content-Type', fileStream.res.headers['content-type'] || 'application/octet-stream');
      if (fileStream.res.headers['content-length']) {
        res.setHeader('Content-Length', fileStream.res.headers['content-length']);
      }
      
      fileStream.stream.pipe(res);
    } catch (ossError) {
      console.error(`OSS获取文件流失败 (路径: ${ossPath}):`, ossError.message);
      try {
        const fileUrl = await ossClient.getFileUrl(ossPath, 3600);
        res.redirect(fileUrl);
      } catch (urlError) {
        console.error('生成下载URL也失败:', urlError.message);
        res.status(500).json({ error: '下载失败', message: `OSS错误: ${ossError.message}` });
      }
    }
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: '下载失败', message: error.message });
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

    // 生成文件URL
    let fileUrl = submission.fileUrl;
    try {
      if (ossClient && !fileUrl.startsWith('http')) {
        fileUrl = await ossClient.getFileUrl(submission.fileUrl, 3600 * 24 * 7);
      }
    } catch (e) {
      console.warn('生成文件URL失败:', e.message);
    }

    res.json({
      success: true,
      data: {
        id: submission.id,
        studentId: submission.studentId,
        studentName: submission.student.name,
        submitTime: submission.submittedAt.toISOString(),
        files: [{ name: submission.fileUrl.split('/').pop(), url: fileUrl }],
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
