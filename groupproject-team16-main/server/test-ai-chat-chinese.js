/**
 * 测试 AI Chat API - 中文测试
 * 
 * 使用方法：
 * 1. 确保后端服务已启动
 * 2. 运行此测试: node test-ai-chat-chinese.js
 */

const http = require('http');

const testData = JSON.stringify({
  system: 'You are a professional, efficient university course AI assistant: supporting teachers with lesson prep, teaching optimization and multi-level questions, and helping students with preview, knowledge sorting and exam review in concise language.',
  user: '测试'
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/ai/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testData)
  }
};

console.log('=== 测试 AI Chat API (中文) ===\n');
console.log('发送请求到: http://localhost:3001/api/ai/chat');
console.log('请求数据:');
console.log(JSON.parse(testData));
console.log('\n等待响应...\n');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('响应状态码:', res.statusCode);
    console.log('响应头:', res.headers);
    console.log('\n响应数据:');
    
    try {
      const jsonData = JSON.parse(data);
      console.log(JSON.stringify(jsonData, null, 2));
      
      if (jsonData.ok) {
        console.log('\n✅ 测试成功！');
        console.log('\nAI 回复内容:');
        console.log('─────────────────────────────────────');
        console.log(jsonData.data.response);
        console.log('─────────────────────────────────────');
      } else {
        console.log('\n❌ API返回错误:', jsonData.message);
      }
    } catch (e) {
      console.log('原始响应:', data);
      console.log('\n❌ 解析JSON失败:', e.message);
    }
    
    console.log('\n=== 测试结束 ===');
  });
});

req.on('error', (error) => {
  console.error('❌ 请求失败:', error.message);
  console.error('请确保后端服务正在运行（http://localhost:3001）');
  console.log('\n=== 测试结束 ===');
});

req.write(testData);
req.end();
