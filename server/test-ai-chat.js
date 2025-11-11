/**
 * 测试 AI Chat API
 * 
 * 使用方法：
 * 1. 确保后端服务已启动（在server目录运行: node index.js）
 * 2. 运行此测试: node test-ai-chat.js
 */

const fetch = require('node-fetch');

const API_URL = 'http://localhost:3001/api/ai/chat';

async function testAIChat() {
  console.log('=== 测试 AI Chat API ===\n');

  try {
    const testMessage = {
      system: 'You are a helpful university course assistant.',
      user: 'Hello! Can you help me understand what linear algebra is?'
    };

    console.log('发送请求...');
    console.log('System:', testMessage.system);
    console.log('User:', testMessage.user);
    console.log('');

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testMessage)
    });

    const data = await response.json();

    console.log('响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(data, null, 2));
    console.log('');

    if (data.ok) {
      console.log('✅ 测试成功！');
      console.log('AI 回复:', data.data.response);
    } else {
      console.log('❌ 测试失败！');
      console.log('错误信息:', data.message);
    }

  } catch (error) {
    console.error('❌ 测试出错:', error.message);
    console.error('请确保后端服务正在运行（http://localhost:3001）');
  }

  console.log('\n=== 测试结束 ===');
}

// 运行测试
testAIChat();
