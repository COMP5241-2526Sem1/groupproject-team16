/**
 * 测试保存AI生成的测验到数据库
 */

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const API_BASE_URL = 'http://localhost:3001/api';

// 测试数据：模拟AI生成的题目
const testQuestions = [
  {
    id: 'test_q1',
    type: 'single',
    question: 'Which of the following best describes the purpose of React\'s virtual DOM?',
    options: [
      'To directly manipulate the browser\'s DOM for faster updates',
      'To create a lightweight in-memory representation of the DOM for efficient updates',
      'To replace the browser\'s DOM entirely',
      'To provide a simpler API for developers to work with the DOM'
    ],
    correctAnswer: 1, // 索引1对应选项B
    explanation: 'React\'s virtual DOM creates an in-memory representation...',
    score: 10,
    difficulty: 'Medium',
    cognitiveLevel: 'Understanding',
    estimatedTime: 2,
    knowledgePoints: ['React', 'Virtual DOM']
  },
  {
    id: 'test_q2',
    type: 'multiple',
    question: 'Which of the following are core principles of responsive web design? (Select all that apply)',
    options: [
      'Fluid layouts that adapt to different screen sizes',
      'Fixed pixel dimensions for all elements',
      'Flexible images that scale with the viewport',
      'Media queries to apply different styles based on device characteristics',
      'Server-side rendering for all devices'
    ],
    correctAnswer: [0, 2, 3], // A, C, D
    explanation: 'Responsive web design uses fluid layouts, flexible images, and media queries...',
    score: 15,
    difficulty: 'Medium',
    cognitiveLevel: 'Understanding',
    estimatedTime: 3,
    knowledgePoints: ['Responsive Design', 'CSS']
  },
  {
    id: 'test_q3',
    type: 'judge',
    question: 'In JavaScript, the \'this\' keyword always refers to the object where the function is defined.',
    correctAnswer: false,
    explanation: 'The \'this\' keyword in JavaScript refers to the object that is executing the current function...',
    score: 10,
    difficulty: 'Medium',
    cognitiveLevel: 'Understanding',
    estimatedTime: 1,
    knowledgePoints: ['JavaScript', 'this keyword']
  },
  {
    id: 'test_q4',
    type: 'essay',
    question: 'Explain the concept of \'separation of concerns\' in web frontend development and describe how it benefits application development.',
    correctAnswer: '', // 简答题没有correctAnswer
    explanation: 'Separation of concerns is fundamental to scalable frontend development. By dividing code into distinct responsibilities, developers can make changes to one part without affecting others.',
    score: 20,
    difficulty: 'Hard',
    cognitiveLevel: 'Analyzing',
    estimatedTime: 5,
    knowledgePoints: ['Software Architecture', 'Best Practices']
  }
];

async function testSaveQuiz() {
  try {
    console.log('🚀 开始测试保存AI生成的测验...\n');

    // 0. 登录获取token
    console.log('0️⃣ 登录获取token...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'teacher1@example.com',
        password: 'password123'
      })
    });

    const loginResult = await loginResponse.json();
    
    console.log('登录响应:', loginResult);
    
    if (!loginResult.token) {
      console.error('❌ 登录失败，尝试使用其他账户...');
      // 尝试学生账户
      const studentLoginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'student1@example.com',
          password: 'password123'
        })
      });
      
      const studentLoginResult = await studentLoginResponse.json();
      if (!studentLoginResult.token) {
        console.error('❌ 无法获取有效的认证token');
        return;
      }
      var token = studentLoginResult.token;
    } else {
      var token = loginResult.token;
    }
    
    console.log(`✅ 登录成功，获得token\n`);

    // 1. 获取课程列表
    console.log('1️⃣ 获取课程列表...');
    const coursesResponse = await fetch(`${API_BASE_URL}/courses`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const coursesResult = await coursesResponse.json();
    
    if (!coursesResult.success || !coursesResult.data || coursesResult.data.length === 0) {
      console.error('❌ 没有找到可用的课程');
      return;
    }
    
    const courseId = coursesResult.data[0].id;
    console.log(`✅ 找到课程: ${coursesResult.data[0].name} (ID: ${courseId})\n`);

    // 2. 保存测验
    console.log('2️⃣ 保存测验到数据库...');
    const saveData = {
      title: 'Web Frontend Fundamentals Quiz',
      courseId: courseId,
      questions: testQuestions
    };

    console.log('请求数据:', JSON.stringify(saveData, null, 2));

    const saveResponse = await fetch(`${API_BASE_URL}/quiz/save-ai-generated`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(saveData)
    });

    const saveResult = await saveResponse.json();
    
    console.log('\n响应状态:', saveResponse.status);
    console.log('响应数据:', JSON.stringify(saveResult, null, 2));

    if (saveResult.success) {
      console.log('\n✅ 测验保存成功!');
      console.log(`   - 测验ID: ${saveResult.data.id}`);
      console.log(`   - 课程ID: ${saveResult.data.courseId}`);
      console.log(`   - 标题: ${saveResult.data.title}`);
      console.log(`   - 总时长: ${saveResult.data.duration} 分钟`);
      console.log(`   - 题目数量: ${saveResult.data.totalQuestions}`);
      
      // 3. 验证：获取刚创建的测验
      console.log('\n3️⃣ 验证：获取刚创建的测验...');
      const verifyResponse = await fetch(`${API_BASE_URL}/quiz/${saveResult.data.id}?includeAnswers=true`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const verifyResult = await verifyResponse.json();
      
      if (verifyResult.success) {
        console.log('✅ 验证成功，测验已正确保存到数据库');
        console.log(`   - 题目数量: ${verifyResult.data.questions.length}`);
        console.log('   - 题目类型分布:');
        
        const typeCount = {};
        verifyResult.data.questions.forEach(q => {
          typeCount[q.type] = (typeCount[q.type] || 0) + 1;
        });
        
        Object.entries(typeCount).forEach(([type, count]) => {
          console.log(`     * ${type}: ${count} 道`);
        });
      }
    } else {
      console.error('\n❌ 保存失败:', saveResult.message || saveResult.error);
    }

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('错误详情:', error);
  }
}

// 运行测试
testSaveQuiz();
