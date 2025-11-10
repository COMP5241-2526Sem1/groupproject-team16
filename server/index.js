const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-app.vercel.app'] // 替换为你的域名
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务 - 提供上传文件访问
if (process.env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

// 引入AI服务
const getDoubaoResponse = require('./utils/doubao_api');

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

// AI聊天接口
app.post('/api/ai/chat', async (req, res) => {
  const startTime = Date.now();
  
  // 打印请求参数
  console.log('\n=== /api/ai/chat 接口调用 ===');
  console.log('时间:', new Date().toISOString());
  console.log('请求IP:', req.ip || req.connection.remoteAddress);
  console.log('User-Agent:', req.get('User-Agent'));
  console.log('请求体:', JSON.stringify(req.body, null, 2));
  
  try {
    const { system, user } = req.body;
    
    // 验证输入
    if (!system || !user) {
      console.log('参数验证失败: 缺少system或user字段');
      return res.status(400).json({ 
        ok: false, 
        message: '缺少参数：需要提供system和user字段' 
      });
    }
    
    console.log('参数验证通过，开始调用AI服务...');
    
    // 调用豆包API
    const response = await getDoubaoResponse(system, user);
    
    const responseData = {
      ok: true,
      data: {
        response: response
      }
    };
    
    // 打印返回结果
    const endTime = Date.now();
    console.log('AI聊天接口调用成功!');
    console.log('处理时间:', (endTime - startTime) + 'ms');
    console.log('返回数据:', JSON.stringify(responseData, null, 2));
    console.log('=== /api/ai/chat 接口调用结束 ===\n');
    
    // 返回结果
    res.json(responseData);
  } catch (error) {
    const endTime = Date.now();
    console.error('=== /api/ai/chat 接口调用失败 ===');
    console.error('处理时间:', (endTime - startTime) + 'ms');
    console.error('错误信息:', error.message);
    console.error('错误堆栈:', error.stack);
    console.error('=== /api/ai/chat 接口调用失败结束 ===\n');
    
    res.status(500).json({
      ok: false,
      message: error.message
    });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Agent Teaching Management API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// 根路径响应
app.get('/', (req, res) => {
  res.json({
    name: 'Agent Teaching Management API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      courses: '/api/courses',
      homework: '/api/homework',
      quiz: '/api/quiz',
      discussion: '/api/discussion',
      resources: '/api/resources',
      vote: '/api/vote',
      analytics: '/api/analytics',
      agent: '/api/agent',
      upload: '/api/upload'
    }
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({ 
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// 仅在非生产环境启动服务器（Vercel会自动处理）
//if (process.env.NODE_ENV !== 'production') {

//}

  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📚 Agent Teaching Management API v1.0`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });

module.exports = app;

