const express = require('express');
const router = express.Router();
const agentService = require('../utils/agentService');
const { getPrisma } = require('../utils/prisma');
const prisma = getPrisma();

// 生成课程内容
router.post('/generate-course', async (req, res) => {
  const startTime = Date.now();
  
  // 打印请求参数
  console.log('\n=== /api/agent/generate-course 接口调用 ===');
  console.log('时间:', new Date().toISOString());
  console.log('请求IP:', req.ip || req.connection.remoteAddress);
  console.log('请求体:', JSON.stringify(req.body, null, 2));
  
  try {
    const { topic, outline, weeks, level, resources } = req.body;

    if (!topic || !outline) {
      console.log('参数验证失败: 缺少topic或outline字段');
      return res.status(400).json({ 
        error: '参数错误',
        message: '课程主题和知识点大纲不能为空' 
      });
    }

    const params = {
      topic,
      outline,
      weeks: weeks || 12,
      level: level || '初级'
    };
    
    console.log('处理后的参数:', JSON.stringify(params, null, 2));
    console.log('开始调用agentService.generateCourseContent...');

    const result = await agentService.generateCourseContent(params);

    // 打印返回结果
    const endTime = Date.now();
    console.log('课程内容生成成功!');
    console.log('处理时间:', (endTime - startTime) + 'ms');
    console.log('返回数据:', JSON.stringify(result, null, 2));
    console.log('=== /api/agent/generate-course 接口调用结束 ===\n');

    res.json(result);
  } catch (error) {
    const endTime = Date.now();
    console.error('=== /api/agent/generate-course 接口调用失败 ===');
    console.error('处理时间:', (endTime - startTime) + 'ms');
    console.error('错误信息:', error.message);
    console.error('错误堆栈:', error.stack);
    console.error('=== /api/agent/generate-course 接口调用失败结束 ===\n');
    
    res.status(500).json({ 
      error: '生成失败',
      message: error.message 
    });
  }
});

// 生成Quiz题目
router.post('/generate-quiz', async (req, res) => {
  const startTime = Date.now();
  
  // 打印请求参数
  console.log('\n=== /api/agent/generate-quiz 接口调用 ===');
  console.log('时间:', new Date().toISOString());
  console.log('请求IP:', req.ip || req.connection.remoteAddress);
  console.log('请求体:', JSON.stringify(req.body, null, 2));
  
  try {
    const { 
      topic, 
      count, 
      difficulty, 
      audience, 
      subjects, 
      questionTypes 
    } = req.body;

    if (!topic) {
      console.log('参数验证失败: 缺少topic字段');
      return res.status(400).json({ 
        error: '参数错误',
        message: '主题不能为空' 
      });
    }

    // 参数验证和默认值设置
    const params = {
      topic,
      count: count || 5,
      difficulty: difficulty || '中等',
      audience: audience || '大学生',
      subjects: subjects || '',
      questionTypes: questionTypes || ['single']
    };

    console.log('处理后的参数:', JSON.stringify(params, null, 2));
    console.log('开始调用agentService.generateQuizQuestions...');

    const result = await agentService.generateQuizQuestions(params);

    // 打印返回结果
    const endTime = Date.now();
    console.log('Quiz题目生成成功!');
    console.log('处理时间:', (endTime - startTime) + 'ms');
    console.log('生成题目数量:', result.data?.length || 0);
    console.log('返回数据:', JSON.stringify(result, null, 2));
    console.log('=== /api/agent/generate-quiz 接口调用结束 ===\n');

    res.json(result);
  } catch (error) {
    const endTime = Date.now();
    console.error('=== /api/agent/generate-quiz 接口调用失败 ===');
    console.error('处理时间:', (endTime - startTime) + 'ms');
    console.error('错误信息:', error.message);
    console.error('错误堆栈:', error.stack);
    console.error('=== /api/agent/generate-quiz 接口调用失败结束 ===\n');
    
    res.status(500).json({ 
      error: '生成失败',
      message: error.message 
    });
  }
});

// 生成作业模板
router.post('/generate-homework', async (req, res) => {
  const startTime = Date.now();
  
  // 打印请求参数
  console.log('\n=== /api/agent/generate-homework 接口调用 ===');
  console.log('时间:', new Date().toISOString());
  console.log('请求IP:', req.ip || req.connection.remoteAddress);
  console.log('请求体:', JSON.stringify(req.body, null, 2));
  
  try {
    const { topic, type } = req.body;

    if (!topic) {
      console.log('参数验证失败: 缺少topic字段');
      return res.status(400).json({ 
        error: '参数错误',
        message: '主题不能为空' 
      });
    }

    const params = {
      topic,
      type: type || '编程'
    };
    
    console.log('处理后的参数:', JSON.stringify(params, null, 2));
    console.log('开始调用agentService.generateHomeworkTemplate...');

    const result = await agentService.generateHomeworkTemplate(params);

    // 打印返回结果
    const endTime = Date.now();
    console.log('作业模板生成成功!');
    console.log('处理时间:', (endTime - startTime) + 'ms');
    console.log('返回数据:', JSON.stringify(result, null, 2));
    console.log('=== /api/agent/generate-homework 接口调用结束 ===\n');

    res.json(result);
  } catch (error) {
    const endTime = Date.now();
    console.error('=== /api/agent/generate-homework 接口调用失败 ===');
    console.error('处理时间:', (endTime - startTime) + 'ms');
    console.error('错误信息:', error.message);
    console.error('错误堆栈:', error.stack);
    console.error('=== /api/agent/generate-homework 接口调用失败结束 ===\n');
    
    res.status(500).json({ 
      error: '生成失败',
      message: error.message 
    });
  }
});

// 推荐教学资源
router.post('/recommend-resources', async (req, res) => {
  const startTime = Date.now();
  
  // 打印请求参数
  console.log('\n=== /api/agent/recommend-resources 接口调用 ===');
  console.log('时间:', new Date().toISOString());
  console.log('请求IP:', req.ip || req.connection.remoteAddress);
  console.log('请求体:', JSON.stringify(req.body, null, 2));
  
  try {
    const { topic, type } = req.body;

    if (!topic) {
      console.log('参数验证失败: 缺少topic字段');
      return res.status(400).json({ 
        error: '参数错误',
        message: '主题不能为空' 
      });
    }

    const params = {
      topic,
      type: type || 'all'
    };
    
    console.log('处理后的参数:', JSON.stringify(params, null, 2));
    console.log('开始调用agentService.recommendResources...');

    const result = await agentService.recommendResources(params);

    // 打印返回结果
    const endTime = Date.now();
    console.log('教学资源推荐成功!');
    console.log('处理时间:', (endTime - startTime) + 'ms');
    console.log('推荐资源数量:', result.data?.length || 0);
    console.log('返回数据:', JSON.stringify(result, null, 2));
    console.log('=== /api/agent/recommend-resources 接口调用结束 ===\n');

    res.json(result);
  } catch (error) {
    const endTime = Date.now();
    console.error('=== /api/agent/recommend-resources 接口调用失败 ===');
    console.error('处理时间:', (endTime - startTime) + 'ms');
    console.error('错误信息:', error.message);
    console.error('错误堆栈:', error.stack);
    console.error('=== /api/agent/recommend-resources 接口调用失败结束 ===\n');
    
    res.status(500).json({ 
      error: '推荐失败',
      message: error.message 
    });
  }
});

// 重新生成单个Quiz题目
router.post('/regenerate-quiz-question', async (req, res) => {
  const startTime = Date.now();
  
  // 打印请求参数
  console.log('\n=== /api/agent/regenerate-quiz-question 接口调用 ===');
  console.log('时间:', new Date().toISOString());
  console.log('请求IP:', req.ip || req.connection.remoteAddress);
  console.log('请求体:', JSON.stringify(req.body, null, 2));
  
  try {
    const { 
      topic, 
      difficulty, 
      audience, 
      subjects, 
      questionType,
      currentQuestion 
    } = req.body;

    if (!topic || !questionType) {
      console.log('参数验证失败: 缺少topic或questionType字段');
      return res.status(400).json({ 
        error: '参数错误',
        message: '主题和题型不能为空' 
      });
    }

    // 参数验证和默认值设置
    const params = {
      topic,
      count: 1, // 只生成一道题
      difficulty: difficulty || '中等',
      audience: audience || '大学生',
      subjects: subjects || '',
      questionTypes: [questionType],
      currentQuestion: currentQuestion || null
    };

    console.log('处理后的参数:', JSON.stringify(params, null, 2));
    console.log('开始调用agentService.regenerateQuizQuestion...');

    const result = await agentService.regenerateQuizQuestion(params);

    // 打印返回结果
    const endTime = Date.now();
    console.log('单个Quiz题目重新生成成功!');
    console.log('处理时间:', (endTime - startTime) + 'ms');
    console.log('返回数据:', JSON.stringify(result, null, 2));
    console.log('=== /api/agent/regenerate-quiz-question 接口调用结束 ===\n');

    res.json(result);
  } catch (error) {
    const endTime = Date.now();
    console.error('=== /api/agent/regenerate-quiz-question 接口调用失败 ===');
    console.error('处理时间:', (endTime - startTime) + 'ms');
    console.error('错误信息:', error.message);
    console.error('错误堆栈:', error.stack);
    console.error('=== /api/agent/regenerate-quiz-question 接口调用失败结束 ===\n');
    
    res.status(500).json({ 
      error: '重新生成失败',
      message: error.message 
    });
  }
});

// 获取示例课程
router.get('/example-courses', (req, res) => {
  const examples = [
    {
      id: 'ex1',
      name: '机器学习入门',
      topic: '深度学习基础',
      weeks: 12,
      level: '初级'
    },
    {
      id: 'ex2',
      name: 'Web前端开发',
      topic: 'HTML, CSS, JavaScript及React框架',
      weeks: 10,
      level: '中级'
    },
    {
      id: 'ex3',
      name: '数据结构与算法',
      topic: '常用数据结构及算法设计',
      weeks: 14,
      level: '高级'
    }
  ];

  res.json({
    success: true,
    data: examples
  });
});

// 保存生成的课程到数据库
router.post('/save-course', async (req, res) => {
  const startTime = Date.now();
  
  console.log('\n=== /api/agent/save-course 接口调用 ===');
  console.log('时间:', new Date().toISOString());
  console.log('请求IP:', req.ip || req.connection.remoteAddress);
  console.log('请求体:', JSON.stringify(req.body, null, 2));
  
  try {
    const { 
      courseName, 
      outline, 
      duration, 
      objectives, 
      quizTopics, 
      assignments, 
      resources,
      prerequisites,
      level
    } = req.body;

    if (!courseName || !outline) {
      console.log('参数验证失败: 缺少courseName或outline字段');
      return res.status(400).json({ 
        error: '参数错误',
        message: '课程名称和大纲不能为空' 
      });
    }

    // 开始数据库事务（设置更长的超时时间）
    const result = await prisma.$transaction(async (tx) => {
      // 1. 先检查或创建默认的老师用户
      let teacher = await tx.user.findUnique({
        where: { email: 'default_teacher@example.com' }
      });

      if (!teacher) {
        console.log('创建默认老师用户...');
        teacher = await tx.user.create({
          data: {
            email: 'default_teacher@example.com',
            password: '$2b$10$default.hashed.password.placeholder', // 占位密码哈希
            name: 'Default Teacher',
            role: 'TEACHER'
          }
        });
        console.log('默认老师用户创建成功, ID:', teacher.id);
      }

      // 2. 插入课程信息
      // 将学习目标和先修要求整合到description
      let description = '';
      if (objectives && objectives.length > 0) {
        description += 'Learning Objectives:\n';
        objectives.forEach((obj, index) => {
          description += `${index + 1}. ${obj}\n`;
        });
      }
      if (prerequisites) {
        description += `\nPrerequisites: ${prerequisites}`;
      }

      console.log('创建课程...');
      const course = await tx.course.create({
        data: {
          name: courseName,
          description: description || outline.substring(0, 500), // 使用整合后的描述或大纲前500字符
          teacherId: teacher.id,
          status: 'ACTIVE'
        }
      });
      console.log('课程创建成功, ID:', course.id);

      // 3. 插入作业任务（批量插入）
      let createdHomeworks = [];
      if (assignments && assignments.length > 0) {
        console.log('创建作业任务...');
        const homeworkData = assignments.map((assignment, i) => ({
          courseId: course.id,
          title: `Assignment ${i + 1}`,
          description: assignment,
          deadline: new Date(Date.now() + (30 + i * 15) * 24 * 60 * 60 * 1000)
        }));
        
        await tx.homework.createMany({ data: homeworkData });
        createdHomeworks = await tx.homework.findMany({
          where: { courseId: course.id }
        });
        console.log(`成功创建 ${createdHomeworks.length} 个作业任务`);
      }

      // 4. 插入测验主题（批量插入）
      let createdQuizzes = [];
      if (quizTopics && quizTopics.length > 0) {
        console.log('创建测验...');
        const quizData = quizTopics.map((topic) => ({
          courseId: course.id,
          title: topic,
          duration: 60
        }));
        
        await tx.quiz.createMany({ data: quizData });
        createdQuizzes = await tx.quiz.findMany({
          where: { courseId: course.id }
        });
        console.log(`成功创建 ${createdQuizzes.length} 个测验`);
      }

      // 5. 插入推荐资源（批量插入）
      let createdResources = [];
      if (resources && resources.length > 0) {
        console.log('创建推荐资源...');
        
        // 准备资源数据
        const resourceData = resources.map((resourceName, i) => {
          // 根据资源名称推断类型
          let type = 'other';
          if (resourceName.toLowerCase().includes('book') || resourceName.toLowerCase().includes('书籍')) {
            type = 'book';
          } else if (resourceName.toLowerCase().includes('course') || resourceName.toLowerCase().includes('课程')) {
            type = 'course';
          } else if (resourceName.toLowerCase().includes('doc') || resourceName.toLowerCase().includes('文档')) {
            type = 'documentation';
          } else if (resourceName.toLowerCase().includes('dataset') || resourceName.toLowerCase().includes('数据')) {
            type = 'dataset';
          } else if (resourceName.toLowerCase().includes('video') || resourceName.toLowerCase().includes('视频')) {
            type = 'video';
          }
          
          return {
            courseId: course.id,
            name: resourceName,
            type: type,
            fileUrl: `https://placeholder-resource.com/resource${i + 1}`,
            size: 0
          };
        });
        
        await tx.courseResource.createMany({ data: resourceData });
        createdResources = await tx.courseResource.findMany({
          where: { courseId: course.id }
        });
        console.log(`成功创建 ${createdResources.length} 个推荐资源`);
      }

      return {
        course,
        homeworks: createdHomeworks,
        quizzes: createdQuizzes,
        resources: createdResources
      };
    }, {
      maxWait: 10000, // 最大等待10秒
      timeout: 20000, // 最大执行20秒
    });

    const endTime = Date.now();
    console.log('课程数据保存成功!');
    console.log('处理时间:', (endTime - startTime) + 'ms');
    console.log('保存结果:', {
      courseId: result.course.id,
      homeworkCount: result.homeworks.length,
      quizCount: result.quizzes.length,
      resourceCount: result.resources.length
    });
    console.log('=== /api/agent/save-course 接口调用结束 ===\n');

    res.json({
      success: true,
      message: '课程保存成功',
      data: {
        courseId: result.course.id,
        courseName: result.course.name,
        homeworkCount: result.homeworks.length,
        quizCount: result.quizzes.length,
        resourceCount: result.resources.length
      }
    });

  } catch (error) {
    const endTime = Date.now();
    console.error('=== /api/agent/save-course 接口调用失败 ===');
    console.error('处理时间:', (endTime - startTime) + 'ms');
    console.error('错误信息:', error.message);
    console.error('错误堆栈:', error.stack);
    console.error('=== /api/agent/save-course 接口调用失败结束 ===\n');
    
    res.status(500).json({ 
      error: '保存失败',
      message: error.message 
    });
  }
});

module.exports = router;

