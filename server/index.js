const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { getPrisma } = require('./utils/prisma');

// 加载环境变量（固定从 server/.env 读取）
dotenv.config({ path: path.join(__dirname, '.env') });

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务 - 提供上传文件访问
// 在 serverless 环境中使用 /tmp 目录
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
const uploadsPath = isServerless ? '/tmp/uploads' : path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// 路由
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const homeworkRoutes = require('./routes/homework');
const quizRoutes = require('./routes/quiz');
const discussionRoutes = require('./routes/discussion');
const resourceRoutes = require('./routes/resources');
const voteRoutes = require('./routes/vote');
const analyticsRoutes = require('./routes/analytics');
const adminRoutes = require('./routes/admin');
const agentRoutes = require('./routes/agent');
const uploadRoutes = require('./routes/upload');
const aiRoutes = require('./routes/ai');

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/discussion', discussionRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);

// 健康检查（包含数据库连通性）
app.get('/health', async (req, res) => {
  const result = { status: 'ok', message: 'Agent Teaching Management API is running' };
  try {
    if (process.env.DATABASE_URL) {
      const prisma = getPrisma();
      // 尝试一次简单的连接（查询当前时间）
      await prisma.$queryRaw`SELECT 1`;
      result.dbConnected = true;
    } else {
      result.dbConnected = false;
      result.dbMessage = 'DATABASE_URL 未配置';
    }
  } catch (e) {
    result.dbConnected = false;
    result.dbMessage = e.message;
  }
  res.json(result);
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📚 Agent Teaching Management API v1.0`);
});

module.exports = app;

