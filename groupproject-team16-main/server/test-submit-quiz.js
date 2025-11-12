/**
 * 测试提交测验答案
 */

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const API_BASE_URL = 'http://localhost:3001/api';

async function testSubmitQuiz() {
  try {
    console.log('🚀 开始测试提交测验答案...\n');

    // 1. 登录获取token
    console.log('1️⃣ 登录...');
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
    console.log(`✅ 登录成功\n`);

    // 2. 获取测验列表
    console.log('2️⃣ 获取测验列表...');
    const quizzesResponse = await fetch(`${API_BASE_URL}/quiz`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const quizzesResult = await quizzesResponse.json();
    
    if (!quizzesResult.success || !quizzesResult.data || quizzesResult.data.length === 0) {
      console.error('❌ 没有找到测验');
      return;
    }
    
    const quiz = quizzesResult.data[0];
    console.log(`✅ 找到测验: ${quiz.title} (ID: ${quiz.id})`);
    console.log(`   题目数量: ${quiz.questions.length}\n`);

    // 3. 获取测验详情（不包含答案）
    console.log('3️⃣ 获取测验详情...');
    const quizDetailResponse = await fetch(`${API_BASE_URL}/quiz/${quiz.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const quizDetail = await quizDetailResponse.json();
    console.log('✅ 获取测验详情成功\n');

    // 4. 准备答案（故意答对一些，答错一些）
    console.log('4️⃣ 准备答案...');
    const answers = {};
    
    quizDetail.data.questions.forEach((question, index) => {
      console.log(`题目 ${index + 1}: ${question.question.substring(0, 50)}...`);
      console.log(`  类型: ${question.type}`);
      
      if (question.type === 'singlechoice' || question.type === 'single') {
        // 单选题：提交索引0
        answers[question.id] = 0;
        console.log(`  提交答案: 0 (选项A)`);
      } else if (question.type === 'multiplechoice' || question.type === 'multiple') {
        // 多选题：提交 [0, 1]
        answers[question.id] = [0, 1];
        console.log(`  提交答案: [0, 1] (选项A和B)`);
      } else if (question.type === 'truefalse' || question.type === 'judge') {
        // 判断题：提交 true
        answers[question.id] = true;
        console.log(`  提交答案: true`);
      } else if (question.type === 'essay') {
        // 简答题：提交文本
        answers[question.id] = 'This is my answer to the essay question.';
        console.log(`  提交答案: (文本答案)`);
      }
    });
    
    console.log('\n');

    // 5. 提交答案
    console.log('5️⃣ 提交测验答案...');
    const submitResponse = await fetch(`${API_BASE_URL}/quiz/${quiz.id}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ answers })
    });

    console.log('响应状态:', submitResponse.status);
    
    const submitResult = await submitResponse.json();
    console.log('响应数据:', JSON.stringify(submitResult, null, 2));

    if (submitResult.success) {
      console.log('\n✅ 测验提交成功!');
      console.log(`   得分: ${submitResult.data.score} / ${submitResult.data.totalScore}`);
      console.log(`   是否通过: ${submitResult.data.passed ? '✅ 通过' : '❌ 未通过'}`);
      console.log('\n答题详情:');
      
      Object.entries(submitResult.data.results).forEach(([questionId, result], index) => {
        console.log(`   题目 ${index + 1}: ${result.isCorrect ? '✅ 正确' : '❌ 错误'}`);
        console.log(`      用户答案: ${JSON.stringify(result.userAnswer)}`);
        console.log(`      正确答案: ${JSON.stringify(result.correctAnswer)}`);
      });
    } else {
      console.error('\n❌ 提交失败:', submitResult.message || submitResult.error);
    }

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('错误详情:', error);
  }
}

testSubmitQuiz();
