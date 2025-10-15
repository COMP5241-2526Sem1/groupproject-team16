const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 模拟用户数据库 (实际应使用Prisma)
const users = [
  {
    id: '1',
    email: 'teacher@example.com',
    password: '$2a$10$YourHashedPasswordHere', // 'password123'
    name: '张教授',
    role: 'TEACHER'
  },
  {
    id: '2',
    email: 'student@example.com',
    password: '$2a$10$YourHashedPasswordHere',
    name: '李同学',
    role: 'STUDENT'
  }
];

// 注册
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // 验证输入
    if (!email || !password || !name) {
      return res.status(400).json({ error: '请填写所有必填字段' });
    }

    // 检查用户是否已存在
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: '该邮箱已被注册' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    const newUser = {
      id: String(users.length + 1),
      email,
      password: hashedPassword,
      name,
      role: role || 'STUDENT'
    };

    users.push(newUser);

    // 生成JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: '注册成功',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: '注册失败', message: error.message });
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 验证输入
    if (!email || !password) {
      return res.status(400).json({ error: '请输入邮箱和密码' });
    }

    // 查找用户
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 生成JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: '登录失败', message: error.message });
  }
});

// 发送验证码 (模拟)
router.post('/send-code', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: '请输入邮箱地址' });
    }

    // 模拟发送验证码
    const code = Math.floor(100000 + Math.random() * 900000);
    
    console.log(`验证码已发送到 ${email}: ${code}`);

    res.json({
      message: '验证码已发送',
      // 在实际应用中不应返回验证码
      code: code.toString()
    });
  } catch (error) {
    res.status(500).json({ error: '发送验证码失败', message: error.message });
  }
});

// 获取当前用户信息
router.get('/me', (req, res) => {
  try {
    // 从请求头获取token
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: '未授权' });
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // 查找用户
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    res.status(401).json({ error: '无效的token', message: error.message });
  }
});

module.exports = router;

