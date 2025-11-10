const express = require('express');
const router = express.Router();
const agentService = require('../utils/agentService');

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

module.exports = router;

