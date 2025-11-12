const express = require('express');
const cors = require('cors');
const path = require('path');

// 硬编码数据库 URL
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_d2jCWZPFSgQ3@ep-red-wave-adt4e4cj-pooler.c-2.us-east-1.aws.neon.tech/agentedu?sslmode=require';

// 创建Express应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务 - 提供上传文件访问
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// 路由 - 使用相对于项目根目录的路径
const authRoutes = require('../server/routes/auth');
const courseRoutes = require('../server/routes/courses');
const homeworkRoutes = require('../server/routes/homework');
const quizRoutes = require('../server/routes/quiz');
const discussionRoutes = require('../server/routes/discussion');
const resourceRoutes = require('../server/routes/resources');
const voteRoutes = require('../server/routes/vote');
const analyticsRoutes = require('../server/routes/analytics');
const agentRoutes = require('../server/routes/agent');
const uploadRoutes = require('../server/routes/upload');
const aiRoutes = require('../server/routes/ai');

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/discussion', discussionRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);

// 健康检查（包含数据库连通性）
app.get('/api/health', async (req, res) => {
  const result = { status: 'ok', message: 'Agent Teaching Management API is running' };
  
  try {
    const { getPrisma } = require('../server/utils/prisma');
    const prisma = getPrisma();
    
    // 测试数据库连接
    await prisma.$queryRaw`SELECT 1`;
    result.database = 'connected';
  } catch (error) {
    result.database = 'disconnected';
    result.error = error.message;
  }
  
  res.json(result);
});

// 根路径
app.get('/api', (req, res) => {
  res.json({
    name: 'Agent Teaching Management API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      courses: '/api/courses/*',
      homework: '/api/homework/*',
      quiz: '/api/quiz/*',
      discussion: '/api/discussion/*',
      resources: '/api/resources/*',
      vote: '/api/vote/*',
      analytics: '/api/analytics/*',
      agent: '/api/agent/*',
      ai: '/api/ai/*',
      upload: '/api/upload/*'
    }
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: err.message || 'Internal server error',
    success: false 
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ 
    error: 'API endpoint not found',
    success: false,
    path: req.path
  });
});

// 导出为 Vercel 无服务器函数
module.exports = app;
