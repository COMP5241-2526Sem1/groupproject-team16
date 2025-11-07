const express = require('express');
const router = express.Router();
const { getPrisma } = require('../utils/prisma');
const { authenticateToken } = require('../middleware/auth');
const prisma = getPrisma();

// 获取所有测验
router.get('/', async (req, res) => {
  try {
    const { courseId } = req.query;
    const where = courseId ? { courseId } : {};

    const quizzes = await prisma.quiz.findMany({
      where,
      include: {
        course: {
          include: {
            students: true
          }
        },
        questions: true,
        submissions: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const data = quizzes.map(quiz => {
      const totalStudents = quiz.course.students.length;
      const submitted = quiz.submissions.length;
      const totalScore = quiz.questions.reduce((sum, q) => {
        // 根据题目类型计算分数，这里简化处理
        return sum + 10;
      }, 0);

      return {
        id: quiz.id,
        courseId: quiz.courseId,
        title: quiz.title,
        description: quiz.title, // 可以扩展schema添加description字段
        duration: quiz.duration,
        totalQuestions: quiz.questions.length,
        totalScore,
        passScore: Math.floor(totalScore * 0.6), // 默认60%及格
        status: 'active',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        submitted,
        totalStudents,
        questions: quiz.questions.map(q => ({
          id: q.id,
          type: q.type.toLowerCase().replace('_', ''),
          question: q.question,
          options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]'),
          correctAnswer: q.type === 'MULTIPLE_CHOICE' 
            ? JSON.parse(q.answer || '[]')
            : q.type === 'TRUE_FALSE'
            ? q.answer === 'true'
            : parseInt(q.answer) || 0,
          score: 10
        })),
        createdAt: quiz.createdAt.toISOString()
      };
    });

    res.json({ success: true, data, total: data.length });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: '获取测验列表失败', message: error.message });
  }
});

// 获取单个测验
router.get('/:id', async (req, res) => {
  try {
    const { includeAnswers } = req.query;
    
    const quiz = await prisma.quiz.findUnique({
      where: { id: req.params.id },
      include: {
        course: {
          include: {
            students: true
          }
        },
        questions: true,
        submissions: true
      }
    });

    if (!quiz) {
      return res.status(404).json({ error: '测验不存在' });
    }

    const totalStudents = quiz.course.students.length;
    const submitted = quiz.submissions.length;
    const totalScore = quiz.questions.length * 10;
    const passScore = Math.floor(totalScore * 0.6);

    const data = {
      id: quiz.id,
      courseId: quiz.courseId,
      title: quiz.title,
      description: quiz.title,
      duration: quiz.duration,
      totalQuestions: quiz.questions.length,
      totalScore,
      passScore,
      status: 'active',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      submitted,
      totalStudents,
      questions: quiz.questions.map(q => {
        const question = {
          id: q.id,
          type: q.type.toLowerCase().replace('_', ''),
          question: q.question,
          options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]'),
          score: 10
        };
        
        if (includeAnswers) {
          question.correctAnswer = q.type === 'MULTIPLE_CHOICE' 
            ? JSON.parse(q.answer || '[]')
            : q.type === 'TRUE_FALSE'
            ? q.answer === 'true'
            : parseInt(q.answer) || 0;
        }
        
        return question;
      }),
      createdAt: quiz.createdAt.toISOString()
    };

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: '获取测验详情失败', message: error.message });
  }
});

// 创建测验
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, duration, passScore, courseId, deadline, questions } = req.body;
    if (!title) {
      return res.status(400).json({ error: '测验标题不能为空' });
    }

    const quiz = await prisma.quiz.create({
      data: {
        courseId: courseId || req.user?.courseId || '1',
        title,
        duration: parseInt(duration) || 30
      },
      include: {
        course: {
          include: {
            students: true
          }
        },
        questions: true
      }
    });

    // 如果有题目，创建题目
    if (questions && Array.isArray(questions)) {
      await Promise.all(questions.map(q => {
        const answer = q.type === 'multiple'
          ? JSON.stringify(q.correctAnswer || [])
          : q.type === 'judge'
          ? String(q.correctAnswer)
          : String(q.correctAnswer || 0);

        return prisma.quizQuestion.create({
          data: {
            quizId: quiz.id,
            type: q.type === 'single' ? 'SINGLE_CHOICE' 
              : q.type === 'multiple' ? 'MULTIPLE_CHOICE'
              : 'TRUE_FALSE',
            question: q.question,
            options: JSON.stringify(q.options || []),
            answer
          }
        });
      }));
    }

    const data = {
      id: quiz.id,
      courseId: quiz.courseId,
      title: quiz.title,
      description: description || '',
      duration: quiz.duration,
      totalQuestions: 0,
      totalScore: 0,
      passScore: parseInt(passScore) || 60,
      status: 'active',
      deadline: deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      submitted: 0,
      totalStudents: quiz.course.students.length,
      questions: [],
      createdAt: quiz.createdAt.toISOString()
    };

    res.status(201).json({ success: true, data, message: '测验创建成功' });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ error: '创建测验失败', message: error.message });
  }
});

// 更新测验
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, duration, questions } = req.body;
    const updateData = {};
    
    if (title) updateData.title = title;
    if (duration) updateData.duration = parseInt(duration);

    const quiz = await prisma.quiz.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        course: {
          include: {
            students: true
          }
        },
        questions: true,
        submissions: true
      }
    });

    // 如果提供了新题目，更新题目
    if (questions && Array.isArray(questions)) {
      // 删除旧题目
      await prisma.quizQuestion.deleteMany({ where: { quizId: quiz.id } });
      
      // 创建新题目
      await Promise.all(questions.map(q => {
        const answer = q.type === 'multiple'
          ? JSON.stringify(q.correctAnswer || [])
          : q.type === 'judge'
          ? String(q.correctAnswer)
          : String(q.correctAnswer || 0);

        return prisma.quizQuestion.create({
          data: {
            quizId: quiz.id,
            type: q.type === 'single' ? 'SINGLE_CHOICE' 
              : q.type === 'multiple' ? 'MULTIPLE_CHOICE'
              : 'TRUE_FALSE',
            question: q.question,
            options: JSON.stringify(q.options || []),
            answer
          }
        });
      }));
    }

    const totalScore = quiz.questions.length * 10;
    const data = {
      id: quiz.id,
      courseId: quiz.courseId,
      title: quiz.title,
      description: quiz.title,
      duration: quiz.duration,
      totalQuestions: quiz.questions.length,
      totalScore,
      passScore: Math.floor(totalScore * 0.6),
      status: 'active',
      submitted: quiz.submissions.length,
      totalStudents: quiz.course.students.length,
      questions: []
    };

    res.json({ success: true, data, message: '测验更新成功' });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({ error: '更新测验失败', message: error.message });
  }
});

// 删除测验
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.quiz.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: '测验删除成功' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ error: '删除测验失败', message: error.message });
  }
});

// 提交测验答案
router.post('/:id/submit', authenticateToken, async (req, res) => {
  try {
    const { answers } = req.body;
    const studentId = req.user?.userId;
    
    if (!studentId || !answers) {
      return res.status(400).json({ error: '缺少必填字段' });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: req.params.id },
      include: {
        questions: true
      }
    });

    if (!quiz) {
      return res.status(404).json({ error: '测验不存在' });
    }

    // 计算分数
    let score = 0;
    const results = {};

    quiz.questions.forEach(question => {
      const userAnswer = answers[question.id];
      let isCorrect = false;

      if (question.type === 'SINGLE_CHOICE') {
        isCorrect = String(userAnswer) === question.answer;
      } else if (question.type === 'MULTIPLE_CHOICE') {
        const correctAnswer = JSON.parse(question.answer || '[]');
        const userAnswerArray = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
        isCorrect = JSON.stringify(userAnswerArray.sort()) === JSON.stringify(correctAnswer.sort());
      } else if (question.type === 'TRUE_FALSE') {
        isCorrect = String(userAnswer) === question.answer;
      }

      if (isCorrect) {
        score += 10; // 每题10分
      }

      results[question.id] = {
        isCorrect,
        userAnswer,
        correctAnswer: question.type === 'MULTIPLE_CHOICE' 
          ? JSON.parse(question.answer || '[]')
          : question.type === 'TRUE_FALSE'
          ? question.answer === 'true'
          : parseInt(question.answer) || 0
      };
    });

    const totalScore = quiz.questions.length * 10;
    const passScore = Math.floor(totalScore * 0.6);
    const passed = score >= passScore;

    // 保存提交记录
    const existing = await prisma.quizSubmission.findUnique({
      where: {
        quizId_studentId: {
          quizId: req.params.id,
          studentId
        }
      }
    });

    if (existing) {
      await prisma.quizSubmission.update({
        where: { id: existing.id },
        data: {
          answers: answers,
          score,
          submittedAt: new Date()
        }
      });
    } else {
      await prisma.quizSubmission.create({
        data: {
          quizId: req.params.id,
          studentId,
          answers: answers,
          score
        }
      });
    }

    res.json({
      success: true,
      data: {
        score,
        totalScore,
        passed,
        results
      },
      message: passed ? '恭喜通过测验!' : '很遗憾未通过测验'
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: '提交测验失败', message: error.message });
  }
});

module.exports = router;
