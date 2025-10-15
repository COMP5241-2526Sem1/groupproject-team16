const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务 - 提供上传文件访问
app.use('/uploads', express.static('uploads'));

// 路由
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const homeworkRoutes = require('./routes/homework');
const quizRoutes = require('./routes/quiz');
const discussionRoutes = require('./routes/discussion');
const resourceRoutes = require('./routes/resources');
const voteRoutes = require('./routes/vote');
const analyticsRoutes = require('./routes/analytics');
const agentRoutes = require('./routes/agent');
const uploadRoutes = require('./routes/upload');

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

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Agent Teaching Management API is running' });
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

