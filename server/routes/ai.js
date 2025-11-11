const express = require('express');
const router = express.Router();
const getDoubaoResponse = require('../utils/doubao_api');

/**
 * POST /api/ai/chat
 * AI聊天接口
 * 接收系统角色和用户消息，返回AI回复
 */
router.post('/chat', async (req, res) => {
  try {
    const { system, user } = req.body;

    // 验证输入
    if (!user || typeof user !== 'string' || user.trim().length === 0) {
      return res.status(400).json({
        ok: false,
        message: '用户消息不能为空'
      });
    }

    // 系统角色默认值
    const systemPrompt = system || 'You are a helpful AI assistant for university courses.';

    // 调用豆包API获取回复
    const aiResponse = await getDoubaoResponse(systemPrompt, user);

    // 返回成功结果
    res.json({
      ok: true,
      data: {
        response: aiResponse
      }
    });

  } catch (error) {
    console.error('AI聊天接口错误:', error);
    res.status(500).json({
      ok: false,
      message: error.message || '服务器内部错误'
    });
  }
});

module.exports = router;
