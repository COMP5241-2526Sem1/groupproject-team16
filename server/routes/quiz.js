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
        questions: quiz.questions.map(q => {
          const question = {
            id: q.id,
            type: q.type.toLowerCase().replace('_', ''),
            question: q.question,
            options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]'),
            score: 10
          };
          
          // 解析正确答案
          if (q.type === 'MULTIPLE_CHOICE') {
            try {
              question.correctAnswer = JSON.parse(q.answer || '[]');
            } catch (e) {
              if (typeof q.answer === 'string' && q.answer.includes(',')) {
                question.correctAnswer = q.answer.split(',').map(letter => {
                  const index = letter.trim().charCodeAt(0) - 65;
                  return index;
                });
              } else {
                question.correctAnswer = [];
              }
            }
          } else if (q.type === 'TRUE_FALSE') {
            question.correctAnswer = q.answer === 'True' || q.answer === 'true';
          } else if (q.type === 'SINGLE_CHOICE') {
            if (typeof q.answer === 'string' && /^[A-Z]$/.test(q.answer)) {
              question.correctAnswer = q.answer.charCodeAt(0) - 65;
            } else {
              question.correctAnswer = parseInt(q.answer) || 0;
            }
          } else {
            question.correctAnswer = q.answer;
          }
          
          return question;
        }),
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
          if (q.type === 'MULTIPLE_CHOICE') {
            // 支持两种格式：JSON数组 或 逗号分隔的字母字符串 (如 "A,C,D")
            try {
              question.correctAnswer = JSON.parse(q.answer || '[]');
            } catch (e) {
              // 如果不是JSON，尝试解析为逗号分隔的字母
              if (typeof q.answer === 'string' && q.answer.includes(',')) {
                question.correctAnswer = q.answer.split(',').map(letter => {
                  const index = letter.trim().charCodeAt(0) - 65; // A=0, B=1, C=2...
                  return index;
                });
              } else {
                question.correctAnswer = [];
              }
            }
          } else if (q.type === 'TRUE_FALSE') {
            question.correctAnswer = q.answer === 'True' || q.answer === 'true';
          } else if (q.type === 'SINGLE_CHOICE') {
            // 支持数字索引或字母
            if (typeof q.answer === 'string' && /^[A-Z]$/.test(q.answer)) {
              question.correctAnswer = q.answer.charCodeAt(0) - 65; // A=0, B=1...
            } else {
              question.correctAnswer = parseInt(q.answer) || 0;
            }
          } else {
            // ESSAY 或其他类型
            question.correctAnswer = q.answer;
          }
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

// 保存AI生成的测验（专用端点）
router.post('/save-ai-generated', authenticateToken, async (req, res) => {
  try {
    const { title, courseId, questions } = req.body;
    
    // 验证必填字段
    if (!title || !courseId || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ 
        error: '缺少必填字段', 
        message: '请提供测验标题、课程ID和至少一个题目' 
      });
    }

    // 验证课程是否存在
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return res.status(404).json({ 
        error: '课程不存在', 
        message: `找不到ID为 ${courseId} 的课程` 
      });
    }

    // 计算总时长（所有题目的estimatedTime之和）
    const totalDuration = questions.reduce((sum, q) => {
      return sum + (q.estimatedTime || 2); // 默认2分钟
    }, 0);

    // 创建测验主记录
    const quiz = await prisma.quiz.create({
      data: {
        courseId: courseId,
        title: title,
        duration: totalDuration
      }
    });

    console.log('✅ Quiz created:', quiz.id);

    // 创建题目记录
    const createdQuestions = await Promise.all(questions.map(async (q, index) => {
      // 转换题目类型
      let questionType;
      if (q.type === 'single') {
        questionType = 'SINGLE_CHOICE';
      } else if (q.type === 'multiple') {
        questionType = 'MULTIPLE_CHOICE';
      } else if (q.type === 'judge') {
        questionType = 'TRUE_FALSE';
      } else if (q.type === 'essay') {
        questionType = 'ESSAY';
      } else {
        questionType = 'SINGLE_CHOICE'; // 默认值
      }

      // 处理选项（options）
      let optionsJson = null;
      if (questionType === 'SINGLE_CHOICE' || questionType === 'MULTIPLE_CHOICE') {
        // 单选和多选需要选项
        if (Array.isArray(q.options) && q.options.length > 0) {
          // 将选项数组转换为 "A. option1", "B. option2" 格式
          optionsJson = q.options.map((opt, idx) => {
            const letter = String.fromCharCode(65 + idx); // A, B, C, D...
            return `${letter}. ${opt}`;
          });
        }
      } else if (questionType === 'TRUE_FALSE') {
        // 判断题固定选项
        optionsJson = ["True", "False"];
      }
      // ESSAY类型不需要选项，保持null

      // 处理答案（answer）
      let answerString;
      if (questionType === 'SINGLE_CHOICE') {
        // 单选：将索引转换为字母 (0 -> 'A', 1 -> 'B', ...)
        if (typeof q.correctAnswer === 'number') {
          answerString = String.fromCharCode(65 + q.correctAnswer);
        } else if (typeof q.correctAnswer === 'string') {
          answerString = q.correctAnswer.toUpperCase();
        } else {
          answerString = 'A'; // 默认值
        }
      } else if (questionType === 'MULTIPLE_CHOICE') {
        // 多选：将索引数组转换为逗号分隔的字母 ([0, 2] -> 'A,C')
        if (Array.isArray(q.correctAnswer)) {
          answerString = q.correctAnswer
            .map(idx => String.fromCharCode(65 + idx))
            .sort()
            .join(',');
        } else {
          answerString = 'A'; // 默认值
        }
      } else if (questionType === 'TRUE_FALSE') {
        // 判断题：转换为 'True' 或 'False'
        if (typeof q.correctAnswer === 'boolean') {
          answerString = q.correctAnswer ? 'True' : 'False';
        } else if (typeof q.correctAnswer === 'string') {
          answerString = q.correctAnswer.toLowerCase() === 'true' ? 'True' : 'False';
        } else {
          answerString = 'False'; // 默认值
        }
      } else if (questionType === 'ESSAY') {
        // 简答题：使用explanation作为参考答案
        answerString = q.explanation || 'No reference answer provided';
      } else {
        answerString = '';
      }

      // 创建题目记录
      const createdQuestion = await prisma.quizQuestion.create({
        data: {
          quizId: quiz.id,
          type: questionType,
          question: q.question || `Question ${index + 1}`,
          options: optionsJson, // Prisma会自动处理JSON序列化
          answer: answerString
        }
      });

      console.log(`✅ Question ${index + 1} created:`, {
        id: createdQuestion.id,
        type: createdQuestion.type,
        answer: createdQuestion.answer
      });

      return createdQuestion;
    }));

    // 返回成功响应
    res.status(201).json({
      success: true,
      data: {
        id: quiz.id,
        courseId: quiz.courseId,
        title: quiz.title,
        duration: quiz.duration,
        totalQuestions: createdQuestions.length,
        questionIds: createdQuestions.map(q => q.id)
      },
      message: `测验创建成功！已保存 ${createdQuestions.length} 道题目`
    });

  } catch (error) {
    console.error('❌ Error saving AI-generated quiz:', error);
    res.status(500).json({ 
      error: '保存测验失败', 
      message: error.message,
      details: error.stack
    });
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

      if (question.type === 'ESSAY') {
        // 简答题不自动评分，标记为待评分
        isCorrect = null; // null 表示待人工评分
      } else if (question.type === 'SINGLE_CHOICE') {
        // 用户答案是数字索引，需要转换为字母与存储的答案比较
        let expectedAnswer = question.answer;
        let userAnswerLetter;
        
        if (typeof userAnswer === 'number') {
          // 索引转字母 (0->A, 1->B, ...)
          userAnswerLetter = String.fromCharCode(65 + userAnswer);
        } else if (typeof userAnswer === 'string' && /^[A-Z]$/.test(userAnswer)) {
          userAnswerLetter = userAnswer;
        } else {
          userAnswerLetter = String.fromCharCode(65 + parseInt(userAnswer || 0));
        }
        
        isCorrect = userAnswerLetter === expectedAnswer;
      } else if (question.type === 'MULTIPLE_CHOICE') {
        // 处理多选题答案比较
        let correctAnswerArray;
        
        // 尝试解析存储的答案
        try {
          correctAnswerArray = JSON.parse(question.answer || '[]');
        } catch (e) {
          // 如果不是JSON，可能是 "A,C,D" 格式
          if (typeof question.answer === 'string' && question.answer.includes(',')) {
            correctAnswerArray = question.answer.split(',').map(letter => {
              const index = letter.trim().charCodeAt(0) - 65;
              return index;
            });
          } else {
            correctAnswerArray = [];
          }
        }
        
        // 将用户答案转换为数字数组
        const userAnswerArray = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
        
        // 排序后比较
        const sortedUser = [...userAnswerArray].sort((a, b) => a - b);
        const sortedCorrect = [...correctAnswerArray].sort((a, b) => a - b);
        
        isCorrect = JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect);
      } else if (question.type === 'TRUE_FALSE') {
        // 判断题：用户答案是boolean，存储的是 "True"/"False"
        let userBool;
        if (typeof userAnswer === 'boolean') {
          userBool = userAnswer;
        } else if (typeof userAnswer === 'string') {
          userBool = userAnswer.toLowerCase() === 'true';
        } else {
          userBool = false;
        }
        
        const correctBool = question.answer === 'True' || question.answer === 'true';
        isCorrect = userBool === correctBool;
      }

      // 只有客观题（非简答题）才计入分数
      if (isCorrect === true) {
        score += 10; // 每题10分
      }

      results[question.id] = {
        isCorrect: isCorrect === null ? 'pending' : isCorrect, // pending表示待评分
        userAnswer,
        correctAnswer: question.type === 'MULTIPLE_CHOICE' 
          ? (() => {
              try {
                return JSON.parse(question.answer || '[]');
              } catch (e) {
                if (typeof question.answer === 'string' && question.answer.includes(',')) {
                  return question.answer.split(',').map(l => l.trim().charCodeAt(0) - 65);
                }
                return [];
              }
            })()
          : question.type === 'TRUE_FALSE'
          ? (question.answer === 'True' || question.answer === 'true')
          : question.type === 'SINGLE_CHOICE'
          ? (() => {
              if (typeof question.answer === 'string' && /^[A-Z]$/.test(question.answer)) {
                return question.answer.charCodeAt(0) - 65;
              }
              return parseInt(question.answer) || 0;
            })()
          : question.answer
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
