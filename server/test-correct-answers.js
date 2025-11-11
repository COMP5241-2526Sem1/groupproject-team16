/**
 * 测试提交正确答案
 */

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const API_BASE_URL = 'http://localhost:3001/api';

async function testCorrectAnswers() {
  try {
    console.log('🚀 测试提交正确答案...\n');

    // 1. 登录
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student1@example.com',
        password: 'password123'
      })
    });

    const loginResult = await loginResponse.json();
    const token = loginResult.token;

    // 2. 获取测验（包含答案）
    const quizId = '08551965-be4a-4a75-9dfd-294ff5dab7c0';
    const quizResponse = await fetch(`${API_BASE_URL}/quiz/${quizId}?includeAnswers=true`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const quizResult = await quizResponse.json();
    const quiz = quizResult.data;

    console.log(`测验: ${quiz.title}\n`);

    // 3. 使用正确答案
    const answers = {};
    
    quiz.questions.forEach((question, index) => {
      console.log(`题目 ${index + 1}: ${question.question.substring(0, 60)}...`);
      console.log(`  类型: ${question.type}`);
      console.log(`  正确答案: ${JSON.stringify(question.correctAnswer)}`);
      
      answers[question.id] = question.correctAnswer;
    });

    console.log('\n提交正确答案...\n');

    // 4. 提交答案
    const submitResponse = await fetch(`${API_BASE_URL}/quiz/${quizId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ answers })
    });

    const submitResult = await submitResponse.json();

    if (submitResult.success) {
      console.log('✅ 测验提交成功!');
      console.log(`   得分: ${submitResult.data.score} / ${submitResult.data.totalScore}`);
      console.log(`   是否通过: ${submitResult.data.passed ? '✅ 通过' : '❌ 未通过'}`);
      console.log('\n答题详情:');
      
      let correctCount = 0;
      Object.entries(submitResult.data.results).forEach(([questionId, result], index) => {
        if (result.isCorrect) correctCount++;
        console.log(`   题目 ${index + 1}: ${result.isCorrect ? '✅ 正确' : '❌ 错误'}`);
      });
      
      console.log(`\n正确率: ${correctCount}/${quiz.questions.length} = ${Math.round(correctCount/quiz.questions.length*100)}%`);
    } else {
      console.error('❌ 提交失败:', submitResult.message || submitResult.error);
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testCorrectAnswers();
