const express = require('express');
const router = express.Router();
const agentService = require('../utils/agentService');

// 生成课程内容
router.post('/generate-course', async (req, res) => {
  try {
    const { topic, outline, weeks, level, resources } = req.body;

    if (!topic || !outline) {
      return res.status(400).json({ 
        error: '参数错误',
        message: '课程主题和知识点大纲不能为空' 
      });
    }

    const result = await agentService.generateCourseContent({
      topic,
      outline,
      weeks: weeks || 12,
      level: level || '初级'
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: '生成失败',
      message: error.message 
    });
  }
});

// 生成Quiz题目
router.post('/generate-quiz', async (req, res) => {
  try {
    const { topic, count, difficulty } = req.body;

    if (!topic) {
      return res.status(400).json({ 
        error: '参数错误',
        message: '主题不能为空' 
      });
    }

    const result = await agentService.generateQuizQuestions({
      topic,
      count: count || 10,
      difficulty: difficulty || 'medium'
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: '生成失败',
      message: error.message 
    });
  }
});

// 生成作业模板
router.post('/generate-homework', async (req, res) => {
  try {
    const { topic, type } = req.body;

    if (!topic) {
      return res.status(400).json({ 
        error: '参数错误',
        message: '主题不能为空' 
      });
    }

    const result = await agentService.generateHomeworkTemplate({
      topic,
      type: type || '编程'
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: '生成失败',
      message: error.message 
    });
  }
});

// 推荐教学资源
router.post('/recommend-resources', async (req, res) => {
  try {
    const { topic, type } = req.body;

    if (!topic) {
      return res.status(400).json({ 
        error: '参数错误',
        message: '主题不能为空' 
      });
    }

    const result = await agentService.recommendResources({
      topic,
      type: type || 'all'
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: '推荐失败',
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

