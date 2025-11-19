const express = require('express');
const router = express.Router();
const { getPrisma } = require('../utils/prisma');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const prisma = getPrisma();

// 计算投票百分比
const calculatePercentages = (options, totalVotes) => {
  if (totalVotes === 0) {
    return options.map(opt => ({ ...opt, percentage: 0 }));
  }
  return options.map(opt => ({
    ...opt,
    percentage: Math.round((opt.votes / totalVotes) * 100)
  }));
};

// 获取所有投票
router.get('/', async (req, res) => {
  try {
    const { courseId, status } = req.query;
    const where = {};
    
    if (courseId) where.courseId = courseId;

    const votes = await prisma.vote.findMany({
      where,
      include: {
        course: {
          include: {
            students: true
          }
        },
        results: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const now = new Date();
    const data = votes.map(vote => {
      const options = Array.isArray(vote.options) ? vote.options : JSON.parse(vote.options || '[]');
      const totalVotes = options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
      const participants = vote.results.length;
      const total = vote.course.students.length;
      const isActive = new Date(vote.deadline) > now;
      const voteStatus = isActive ? 'active' : 'completed';

      // 如果查询指定了status，进行过滤
      if (status && voteStatus !== status) {
        return null;
      }

      return {
        id: vote.id,
        courseId: vote.courseId,
        title: vote.title,
        course: vote.course.name,
        type: vote.type.toLowerCase(),
        status: voteStatus,
        participants,
        total,
        deadline: vote.deadline.toISOString().split('T')[0],
        createdAt: vote.createdAt.toISOString(),
        options: calculatePercentages(options, totalVotes)
      };
    }).filter(Boolean);

    res.json({ success: true, data, total: data.length });
  } catch (error) {
    console.error('Error fetching votes:', error);
    res.status(500).json({ error: '获取投票列表失败', message: error.message });
  }
});

// 获取单个投票（包含用户是否已投票）
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const vote = await prisma.vote.findUnique({
      where: { id: req.params.id },
      include: {
        course: {
          include: {
            students: true
          }
        },
        results: {
          where: userId ? { studentId: userId } : undefined
        }
      }
    });

    if (!vote) {
      return res.status(404).json({ error: '投票不存在' });
    }

    const options = Array.isArray(vote.options) ? vote.options : JSON.parse(vote.options || '[]');
    const totalVotes = options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
    const participants = await prisma.voteResult.count({ where: { voteId: vote.id } });
    const total = vote.course.students.length;
    const now = new Date();
    const isActive = new Date(vote.deadline) > now;
    const status = isActive ? 'active' : 'completed';

    // 检查用户是否已投票
    const userVote = userId ? await prisma.voteResult.findUnique({
      where: {
        voteId_studentId: {
          voteId: req.params.id,
          studentId: userId
        }
      }
    }) : null;

    const data = {
      id: vote.id,
      courseId: vote.courseId,
      title: vote.title,
      course: vote.course.name,
      type: vote.type.toLowerCase(),
      status,
      participants,
      total,
      deadline: vote.deadline.toISOString().split('T')[0],
      createdAt: vote.createdAt.toISOString(),
      options: calculatePercentages(options, totalVotes),
      hasVoted: !!userVote,
      userSelectedOptions: userVote ? (Array.isArray(userVote.selectedOptions) 
        ? userVote.selectedOptions 
        : JSON.parse(userVote.selectedOptions || '[]')) : []
    };

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching vote:', error);
    res.status(500).json({ error: '获取投票详情失败', message: error.message });
  }
});

// 创建投票（仅教师和管理员）
router.post('/', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), async (req, res) => {
  try {
    const { title, courseId, type, deadline, options } = req.body;
    if (!title || !options || options.length < 2) {
      return res.status(400).json({ error: '标题和选项不能为空，至少需要2个选项' });
    }
    if (!courseId) {
      return res.status(400).json({ error: '课程ID不能为空' });
    }

    const voteOptions = options.map((opt, index) => ({
      id: String(index + 1),
      text: opt,
      votes: 0
    }));

    const vote = await prisma.vote.create({
      data: {
        courseId,
        title,
        type: type === 'multiple' ? 'MULTIPLE' : 'SINGLE',
        options: voteOptions,
        deadline: deadline ? new Date(deadline) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
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
      id: vote.id,
      courseId: vote.courseId,
      course: vote.course.name,
      title: vote.title,
      type: vote.type.toLowerCase(),
      status: 'active',
      participants: 0,
      total: vote.course.students.length,
      deadline: vote.deadline.toISOString().split('T')[0],
      createdAt: vote.createdAt.toISOString(),
      options: voteOptions.map(opt => ({ ...opt, percentage: 0 }))
    };

    res.status(201).json({ success: true, data, message: '投票创建成功' });
  } catch (error) {
    console.error('Error creating vote:', error);
    res.status(500).json({ error: '创建投票失败', message: error.message });
  }
});

// 更新投票
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, deadline } = req.body;
    const updateData = {};
    
    if (title) updateData.title = title;
    if (deadline) updateData.deadline = new Date(deadline);

    const vote = await prisma.vote.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        course: {
          include: {
            students: true
          }
        },
        results: true
      }
    });

    const options = Array.isArray(vote.options) ? vote.options : JSON.parse(vote.options || '[]');
    const totalVotes = options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
    const data = {
      id: vote.id,
      courseId: vote.courseId,
      title: vote.title,
      course: vote.course.name,
      type: vote.type.toLowerCase(),
      status: new Date(vote.deadline) > new Date() ? 'active' : 'completed',
      participants: vote.results.length,
      total: vote.course.students.length,
      deadline: vote.deadline.toISOString().split('T')[0],
      options: calculatePercentages(options, totalVotes)
    };

    res.json({ success: true, data, message: '投票更新成功' });
  } catch (error) {
    console.error('Error updating vote:', error);
    res.status(500).json({ error: '更新投票失败', message: error.message });
  }
});

// 删除投票
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.vote.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: '投票删除成功' });
  } catch (error) {
    console.error('Error deleting vote:', error);
    res.status(500).json({ error: '删除投票失败', message: error.message });
  }
});

// 提交投票
router.post('/:id/vote', authenticateToken, async (req, res) => {
  try {
    const { optionIds } = req.body;
    const studentId = req.user?.userId;
    
    if (!studentId) {
      return res.status(400).json({ error: '用户ID不能为空' });
    }

    const vote = await prisma.vote.findUnique({
      where: { id: req.params.id },
      include: {
        results: true
      }
    });

    if (!vote) {
      return res.status(404).json({ error: '投票不存在' });
    }

    // 检查是否已过期
    if (new Date(vote.deadline) < new Date()) {
      return res.status(400).json({ error: '投票已结束' });
    }

    if (!optionIds || !Array.isArray(optionIds) || optionIds.length === 0) {
      return res.status(400).json({ error: '请选择至少一个选项' });
    }

    // 单选投票验证
    if (vote.type === 'SINGLE' && optionIds.length !== 1) {
      return res.status(400).json({ error: '单选投票只能选择一个选项' });
    }

    // 检查是否已投票
    const existing = await prisma.voteResult.findUnique({
      where: {
        voteId_studentId: {
          voteId: req.params.id,
          studentId
        }
      }
    });

    const options = Array.isArray(vote.options) ? vote.options : JSON.parse(vote.options || '[]');
    
    // 如果已投票，先撤销之前的投票
    if (existing) {
      const prevOptions = Array.isArray(existing.selectedOptions) 
        ? existing.selectedOptions 
        : JSON.parse(existing.selectedOptions || '[]');
      
      prevOptions.forEach(optId => {
        const option = options.find(opt => opt.id === String(optId));
        if (option) {
          option.votes = Math.max(0, (option.votes || 0) - 1);
        }
      });
    }

    // 记录新投票
    optionIds.forEach(optId => {
      const option = options.find(opt => opt.id === String(optId));
      if (option) {
        option.votes = (option.votes || 0) + 1;
      }
    });

    // 更新投票选项
    await prisma.vote.update({
      where: { id: req.params.id },
      data: {
        options: options
      }
    });

    // 保存投票结果
    if (existing) {
      await prisma.voteResult.update({
        where: { id: existing.id },
        data: {
          selectedOptions: optionIds,
          submittedAt: new Date()
        }
      });
    } else {
      await prisma.voteResult.create({
        data: {
          voteId: req.params.id,
          studentId,
          selectedOptions: optionIds
        }
      });
    }

    // 重新获取投票数据
    const updatedVote = await prisma.vote.findUnique({
      where: { id: req.params.id },
      include: {
        course: {
          include: {
            students: true
          }
        },
        results: true
      }
    });

    const updatedOptions = Array.isArray(updatedVote.options) 
      ? updatedVote.options 
      : JSON.parse(updatedVote.options || '[]');
    const totalVotes = updatedOptions.reduce((sum, opt) => sum + (opt.votes || 0), 0);

    res.json({
      success: true,
      data: {
        ...updatedVote,
        options: calculatePercentages(updatedOptions, totalVotes),
        participants: updatedVote.results.length
      },
      message: '投票成功'
    });
  } catch (error) {
    console.error('Error submitting vote:', error);
    res.status(500).json({ error: '提交投票失败', message: error.message });
  }
});

// 获取投票统计和详情（包含学生投票情况）
router.get('/:id/stats', authenticateToken, async (req, res) => {
  try {
    const vote = await prisma.vote.findUnique({
      where: { id: req.params.id },
      include: {
        course: {
          include: {
            students: true,
            teacher: { select: { id: true, name: true, email: true } }
          }
        },
        results: {
          include: {
            student: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });

    if (!vote) {
      return res.status(404).json({ error: '投票不存在' });
    }

    const options = Array.isArray(vote.options) ? vote.options : JSON.parse(vote.options || '[]');
    const totalVotes = options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
    const participants = vote.results.length;
    const total = vote.course.students.length;
    const participationRate = total > 0 ? Math.round((participants / total) * 100) : 0;

    // 构建学生投票详情
    const studentVotes = vote.results.map(result => ({
      studentId: result.studentId,
      studentName: result.student?.name || '未知',
      studentEmail: result.student?.email || '',
      selectedOptions: Array.isArray(result.selectedOptions) 
        ? result.selectedOptions 
        : JSON.parse(result.selectedOptions || '[]'),
      submittedAt: result.submittedAt
    }));

    res.json({
      success: true,
      data: {
        ...vote,
        options: calculatePercentages(options, totalVotes),
        participants,
        total,
        participationRate,
        studentVotes
      }
    });
  } catch (error) {
    console.error('Error fetching vote stats:', error);
    res.status(500).json({ error: '获取投票统计失败', message: error.message });
  }
});

// 结束投票（仅教师和管理员）
router.post('/:id/end', authenticateToken, authorizeRoles('TEACHER', 'ADMIN'), async (req, res) => {
  try {
    const vote = await prisma.vote.update({
      where: { id: req.params.id },
      data: {
        deadline: new Date() // 将截止时间设为当前时间，使其失效
      },
      include: {
        course: {
          include: {
            students: true
          }
        },
        results: true
      }
    });

    const options = Array.isArray(vote.options) ? vote.options : JSON.parse(vote.options || '[]');
    const totalVotes = options.reduce((sum, opt) => sum + (opt.votes || 0), 0);

    res.json({
      success: true,
      data: {
        ...vote,
        status: 'completed',
        options: calculatePercentages(options, totalVotes)
      },
      message: '投票已结束'
    });
  } catch (error) {
    console.error('Error ending vote:', error);
    res.status(500).json({ error: '结束投票失败', message: error.message });
  }
});

module.exports = router;
