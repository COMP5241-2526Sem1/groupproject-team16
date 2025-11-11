/**
 * Agent API测试脚本
 * 用于测试Agent相关的API接口
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/agent';

// 测试生成课程内容
async function testGenerateCourse() {
  console.log('\n=== 测试1: 生成课程内容 ===');
  try {
    const response = await axios.post(`${BASE_URL}/generate-course`, {
      topic: '人工智能基础',
      outline: '1. 机器学习概述\n2. 神经网络基础\n3. 深度学习入门\n4. 实践项目',
      weeks: 8,
      level: '初级'
    });

    console.log('✓ 请求成功');
    console.log('课程标题:', response.data.data?.courseTitle);
    console.log('课程周数:', response.data.data?.weeks);
    console.log('是否使用回退模式:', response.data.fallback || false);
    console.log('学习目标数量:', response.data.data?.learningObjectives?.length || 0);
    
    return true;
  } catch (error) {
    console.error('✗ 请求失败:', error.response?.data || error.message);
    return false;
  }
}

// 测试生成Quiz题目
async function testGenerateQuiz() {
  console.log('\n=== 测试2: 生成Quiz题目 ===');
  try {
    const response = await axios.post(`${BASE_URL}/generate-quiz`, {
      topic: '机器学习基础',
      count: 3,
      difficulty: '中等',
      audience: '大学生',
      subjects: '监督学习,神经网络',
      questionTypes: ['single', 'multiple']
    });

    console.log('✓ 请求成功');
    console.log('生成题目数量:', response.data.data?.length || 0);
    console.log('是否使用回退模式:', response.data.fallback || false);
    
    if (response.data.data && response.data.data.length > 0) {
      const firstQuestion = response.data.data[0];
      console.log('第一题类型:', firstQuestion.type);
      console.log('第一题难度:', firstQuestion.difficulty);
      console.log('第一题题目:', firstQuestion.question.substring(0, 50) + '...');
    }
    
    return true;
  } catch (error) {
    console.error('✗ 请求失败:', error.response?.data || error.message);
    return false;
  }
}

// 测试生成作业模板
async function testGenerateHomework() {
  console.log('\n=== 测试3: 生成作业模板 ===');
  try {
    const response = await axios.post(`${BASE_URL}/generate-homework`, {
      topic: '深度学习项目实践',
      type: '编程'
    });

    console.log('✓ 请求成功');
    console.log('作业标题:', response.data.data?.title);
    console.log('是否使用回退模式:', response.data.fallback || false);
    console.log('作业要求数量:', response.data.data?.requirements?.length || 0);
    
    return true;
  } catch (error) {
    console.error('✗ 请求失败:', error.response?.data || error.message);
    return false;
  }
}

// 测试推荐教学资源
async function testRecommendResources() {
  console.log('\n=== 测试4: 推荐教学资源 ===');
  try {
    const response = await axios.post(`${BASE_URL}/recommend-resources`, {
      topic: 'Python编程',
      type: 'all'
    });

    console.log('✓ 请求成功');
    console.log('推荐资源数量:', response.data.data?.length || 0);
    console.log('是否使用回退模式:', response.data.fallback || false);
    
    if (response.data.data && response.data.data.length > 0) {
      const firstResource = response.data.data[0];
      console.log('第一个资源名称:', firstResource.name);
      console.log('第一个资源类型:', firstResource.type);
    }
    
    return true;
  } catch (error) {
    console.error('✗ 请求失败:', error.response?.data || error.message);
    return false;
  }
}

// 测试重新生成Quiz题目
async function testRegenerateQuizQuestion() {
  console.log('\n=== 测试5: 重新生成Quiz题目 ===');
  try {
    const response = await axios.post(`${BASE_URL}/regenerate-quiz-question`, {
      topic: '数据结构',
      difficulty: '中等',
      audience: '大学生',
      subjects: '数组,链表',
      questionType: 'single',
      currentQuestion: {
        type: 'SINGLE_CHOICE',
        question: '数组的时间复杂度是多少？',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
        correctAnswer: 'A'
      }
    });

    console.log('✓ 请求成功');
    console.log('题目类型:', response.data.data?.type);
    console.log('题目难度:', response.data.data?.difficulty);
    console.log('题目内容:', response.data.data?.question?.substring(0, 50) + '...');
    console.log('是否使用回退模式:', response.data.fallback || false);
    
    return true;
  } catch (error) {
    console.error('✗ 请求失败:', error.response?.data || error.message);
    return false;
  }
}

// 测试获取示例课程
async function testExampleCourses() {
  console.log('\n=== 测试6: 获取示例课程 ===');
  try {
    const response = await axios.get(`${BASE_URL}/example-courses`);

    console.log('✓ 请求成功');
    console.log('示例课程数量:', response.data.data?.length || 0);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('第一个示例:', response.data.data[0].name);
    }
    
    return true;
  } catch (error) {
    console.error('✗ 请求失败:', error.response?.data || error.message);
    return false;
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('========================================');
  console.log('Agent API 接口测试');
  console.log('========================================');
  console.log('确保后端服务已启动在 http://localhost:3001');
  console.log('');

  const results = {
    total: 6,
    passed: 0,
    failed: 0
  };

  // 执行所有测试
  const tests = [
    testExampleCourses,
    testGenerateCourse,
    testGenerateQuiz,
    testGenerateHomework,
    testRecommendResources,
    testRegenerateQuizQuestion
  ];

  for (const test of tests) {
    const result = await test();
    if (result) {
      results.passed++;
    } else {
      results.failed++;
    }
    
    // 等待1秒再执行下一个测试
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 输出测试结果
  console.log('\n========================================');
  console.log('测试结果汇总');
  console.log('========================================');
  console.log(`总测试数: ${results.total}`);
  console.log(`通过: ${results.passed}`);
  console.log(`失败: ${results.failed}`);
  console.log('========================================\n');

  process.exit(results.failed > 0 ? 1 : 0);
}

// 执行测试
runAllTests();
