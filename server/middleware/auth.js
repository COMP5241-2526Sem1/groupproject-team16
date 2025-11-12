const jwt = require('jsonwebtoken');

// 验证JWT token的中间件
const authenticateToken = (req, res, next) => {
  try {
    // 从请求头获取token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: '未授权',
        message: '请提供有效的访问令牌' 
      });
    }

    // 验证token
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
      if (err) {
        return res.status(403).json({ 
          error: '令牌无效',
          message: '访问令牌已过期或无效' 
        });
      }

      // 将用户信息附加到请求对象
      req.user = user;
      next();
    });
  } catch (error) {
    res.status(500).json({ 
      error: '认证失败',
      message: error.message 
    });
  }
};

// 验证用户角色的中间件
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: '未授权',
        message: '请先登录' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: '权限不足',
        message: `需要以下角色之一: ${roles.join(', ')}` 
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles
};

