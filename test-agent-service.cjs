const agentService = require('./server/utils/agentService');

async function testGenerateQuizQuestions() {
  console.log('=== 测试 AgentService.generateQuizQuestions ===');
  
  const params = {
    topic: '机器学习基础',
    count: 3,
    difficulty: '中等',
    audience: '大学生',
    subjects: '监督学习,无监督学习,深度学习',
    questionTypes: ['single', 'multiple']
  };

  try {
    const result = await agentService.generateQuizQuestions(params);
    console.log('\n测试结果:');
    console.log('成功:', result.success);
    console.log('题目数量:', result.data?.length || 0);
    console.log('是否使用回退模式:', result.fallback || false);
    
    if (result.data && result.data.length > 0) {
      console.log('\n第一道题目示例:');
      const firstQuestion = result.data[0];
      console.log('题目:', firstQuestion.question);
      console.log('题型:', firstQuestion.type);
      console.log('选项:', firstQuestion.options);
      console.log('正确答案:', firstQuestion.correctAnswer);
      console.log('难度:', firstQuestion.difficulty);
    }
  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

async function testGenerateCourseContent() {
  console.log('\n=== 测试 AgentService.generateCourseContent ===');
  
  const params = {
    topic: '前端开发入门',
    outline: 'HTML基础,CSS样式,JavaScript编程,React框架',
    weeks: 8,
    level: '初级'
  };

  try {
    const result = await agentService.generateCourseContent(params);
    console.log('\n测试结果:');
    console.log('成功:', result.success);
    console.log('课程标题:', result.data?.courseTitle);
    console.log('周数:', result.data?.weeks);
    console.log('级别:', result.data?.level);
    console.log('是否使用回退模式:', result.fallback || false);
  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

async function runTests() {
  await testGenerateQuizQuestions();
  await testGenerateCourseContent();
  console.log('\n=== 测试完成 ===');
}

runTests();