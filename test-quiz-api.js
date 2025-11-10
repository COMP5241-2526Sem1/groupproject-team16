// 测试Quiz API生成功能
const testQuizAPI = async () => {
  try {
    console.log('🧪 开始测试Quiz API...')
    
    const response = await fetch('http://localhost:3001/api/agent/generate-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: '机器学习基础',
        count: 3,
        difficulty: '中等',
        audience: '大学生',
        subjects: '监督学习,无监督学习',
        questionTypes: ['single', 'judge']
      })
    })

    console.log('📡 API响应状态:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API响应错误:', errorText)
      return
    }

    const result = await response.json()
    console.log('📦 API返回数据结构:')
    console.log('success:', result.success)
    console.log('data length:', result.data?.length)
    
    if (result.data && result.data.length > 0) {
      console.log('\n🎯 生成的题目:')
      result.data.forEach((question, index) => {
        console.log(`\n题目 ${index + 1}:`)
        console.log('ID:', question.id)
        console.log('Type:', question.type)
        console.log('Question:', question.question.slice(0, 50) + '...')
        console.log('Options length:', question.options?.length || 0)
        console.log('Correct Answer:', question.correctAnswer)
        console.log('Difficulty:', question.difficulty)
        console.log('Score:', question.score)
      })
      
      console.log('\n✅ API测试成功!')
    } else {
      console.log('❌ 没有生成题目数据')
    }

  } catch (error) {
    console.error('❌ 测试出错:', error.message)
  }
}

// 在浏览器控制台中调用此函数进行测试
if (typeof window !== 'undefined') {
  window.testQuizAPI = testQuizAPI
  console.log('💡 在浏览器控制台中执行 testQuizAPI() 来测试API')
} else {
  testQuizAPI()
}