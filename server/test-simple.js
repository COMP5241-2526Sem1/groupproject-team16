/**
 * 简单测试 - 只测试example-courses端点
 */

const axios = require('axios');

async function test() {
  try {
    console.log('测试 /api/agent/example-courses...');
    const response = await axios.get('http://localhost:3001/api/agent/example-courses');
    console.log('✓ 成功!');
    console.log('示例课程数量:', response.data.data.length);
    console.log('课程列表:');
    response.data.data.forEach(course => {
      console.log(`  - ${course.name} (${course.weeks}周, ${course.level})`);
    });
  } catch (error) {
    console.error('✗ 失败:', error.message);
  }
}

test();
