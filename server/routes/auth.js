const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPrisma } = require('../utils/prisma');
const resetStore=require('../utils/reset-store');

// 使用 Prisma 存储与查询用户
const prisma = getPrisma();

// 注册
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // 验证输入
    if (!email || !password || !name) {
      return res.status(400).json({ error: '请填写所有必填字段' });
    }

    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: '该邮箱已被注册' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role === 'ADMIN' || role === 'TEACHER' ? role : 'STUDENT'
      },
      select: { id: true, email: true, name: true, role: true }
    });

    // 生成JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: '注册成功',
      token,
      user: newUser
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] /auth/register error:`, error);
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
    const user = await prisma.user.findUnique({ where: { email } });
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
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] /auth/login error:`, error);
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

router.post('/forgot/request',async(req,res)=>{
  try{
    const { email }=req.body
    if(!email) return res.status(400).json({ error:'请输入邮箱地址' })
    const user=await prisma.user.findUnique({ where:{ email } })
    if(!user) return res.status(404).json({ error:'账号不存在' })
    const { code }=resetStore.create(email)
    console.log(`[ForgotPassword] email=${email} code=${code}`)
    res.json({ message:'验证码已发送，请查看部署日志' })
  }catch(error){
    res.status(500).json({ error:'发送验证码失败', message:error.message })
  }
})

router.post('/forgot/verify',async(req,res)=>{
  try{
    const { email,code }=req.body
    if(!email||!code) return res.status(400).json({ error:'请输入邮箱和验证码' })
    const token=resetStore.verify(email,code)
    if(!token) return res.status(400).json({ error:'验证码无效或已过期' })
    res.json({ message:'验证码正确', resetToken:token })
  }catch(error){
    res.status(500).json({ error:'验证失败', message:error.message })
  }
})

router.post('/forgot/reset',async(req,res)=>{
  try{
    const { email,password,resetToken }=req.body
    if(!email||!password||!resetToken) return res.status(400).json({ error:'请输入完整信息' })
    const ok=resetStore.consume(email,resetToken)
    if(!ok) return res.status(400).json({ error:'凭证无效或已过期' })
    const user=await prisma.user.findUnique({ where:{ email } })
    if(!user) return res.status(404).json({ error:'账号不存在' })
    const hashed=await bcrypt.hash(password,10)
    await prisma.user.update({ where:{ email },data:{ password:hashed } })
    res.json({ message:'密码已更新，请重新登录' })
  }catch(error){
    res.status(500).json({ error:'重置失败', message:error.message })
  }
})

// 获取当前用户信息
router.get('/me', async (req, res) => {
  try {
    // 从请求头获取token
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: '未授权' });
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // 查找用户
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (error) {
    res.status(401).json({ error: '无效的token', message: error.message });
  }
});

module.exports = router;

