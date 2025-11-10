const axios = require('axios');

async function testAIAPI() {
  try {
    console.log('开始测试AI API...');
    
    const response = await axios.post('http://localhost:3001/api/ai/chat', {
      system: '你是一个有用的助手。',
      user: '你好，请简单回答'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('API响应状态:', response.status);
    console.log('API响应数据:', response.data);
    
  } catch (error) {
    console.error('API调用失败:');
    console.error('错误状态:', error.response?.status);
    console.error('错误信息:', error.response?.data || error.message);
    console.error('完整错误:', error);
  }
}

testAIAPI();