import React, { useState } from 'react'

// 模拟QuizModule中的数据格式转换逻辑
const TestQuizDataFormat = () => {
  const [testResult, setTestResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // 映射API返回的题型到组件内部格式
  const mapQuestionType = (apiType) => {
    const typeMap = {
      'SINGLE_CHOICE': 'single',
      'MULTIPLE_CHOICE': 'multiple', 
      'TRUE_FALSE': 'judge',
      'ESSAY': 'essay',
      'single': 'single',
      'multiple': 'multiple',
      'judge': 'judge',
      'essay': 'essay'
    }
    return typeMap[apiType] || 'single'
  }

  const formatQuestions = (apiData, topic = '测试主题') => {
    return apiData.map((q, index) => {
      // 转换正确答案格式
      let correctAnswer = q.correctAnswer
      
      if (q.type === 'SINGLE_CHOICE') {
        if (typeof correctAnswer === 'string') {
          const letterToIndex = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5 }
          correctAnswer = letterToIndex[correctAnswer.toUpperCase()] || 0
        }
      } else if (q.type === 'MULTIPLE_CHOICE') {
        if (typeof correctAnswer === 'string') {
          correctAnswer = correctAnswer.split(',').map(letter => {
            const letterToIndex = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5 }
            return letterToIndex[letter.trim().toUpperCase()] || 0
          })
        } else if (!Array.isArray(correctAnswer)) {
          correctAnswer = [0]
        }
      } else if (q.type === 'TRUE_FALSE') {
        if (typeof correctAnswer === 'string') {
          correctAnswer = correctAnswer.toLowerCase() === 'true' || correctAnswer === '正确'
        }
      }

      return {
        id: q.id || `q_${Date.now()}_${index}`,
        type: mapQuestionType(q.type),
        question: q.question || `题目 ${index + 1}`,
        options: Array.isArray(q.options) ? q.options : [],
        correctAnswer: correctAnswer,
        explanation: q.explanation || `这是关于"${topic}"的题目解析。`,
        score: typeof q.score === 'number' ? q.score : 10,
        difficulty: q.difficulty || '中等',
        knowledgePoints: Array.isArray(q.knowledgePoints) ? q.knowledgePoints : [`${topic}相关知识点`],
        cognitiveLevel: q.cognitiveLevel || '理解',
        estimatedTime: typeof q.estimatedTime === 'number' ? q.estimatedTime : 2
      }
    })
  }

  const testApiCall = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/agent/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: 'JavaScript基础',
          count: 2,
          difficulty: '中等',
          audience: '大学生',
          questionTypes: ['single', 'judge']
        })
      })

      if (!response.ok) {
        throw new Error(`API调用失败: ${response.status}`)
      }

      const result = await response.json()
      console.log('🔍 API原始返回:', result)

      if (result.success && Array.isArray(result.data)) {
        const formattedQuestions = formatQuestions(result.data, 'JavaScript基础')
        console.log('✅ 格式化后的数据:', formattedQuestions)
        
        setTestResult({
          success: true,
          original: result.data,
          formatted: formattedQuestions,
          message: `成功生成并格式化 ${formattedQuestions.length} 道题目`
        })
      } else {
        throw new Error('API返回数据格式不正确')
      }

    } catch (error) {
      console.error('❌ 测试失败:', error)
      setTestResult({
        success: false,
        error: error.message,
        message: '测试失败: ' + error.message
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h2>Quiz数据格式转换测试</h2>
      
      <button 
        onClick={testApiCall}
        disabled={isLoading}
        style={{
          padding: '10px 20px',
          backgroundColor: isLoading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {isLoading ? '测试中...' : '测试API调用和数据转换'}
      </button>

      {testResult && (
        <div style={{
          padding: '15px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: testResult.success ? '#d4edda' : '#f8d7da',
          borderColor: testResult.success ? '#c3e6cb' : '#f5c6cb'
        }}>
          <h3>{testResult.success ? '✅ 测试成功' : '❌ 测试失败'}</h3>
          <p>{testResult.message}</p>

          {testResult.success && (
            <>
              <details style={{ marginTop: '10px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>原始API数据</summary>
                <pre style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: '10px', 
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '12px'
                }}>
                  {JSON.stringify(testResult.original, null, 2)}
                </pre>
              </details>

              <details style={{ marginTop: '10px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>格式化后数据</summary>
                <pre style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: '10px', 
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '12px'
                }}>
                  {JSON.stringify(testResult.formatted, null, 2)}
                </pre>
              </details>

              <div style={{ marginTop: '15px' }}>
                <h4>题目预览:</h4>
                {testResult.formatted.map((question, index) => (
                  <div key={question.id} style={{
                    border: '1px solid #ddd',
                    padding: '10px',
                    margin: '10px 0',
                    borderRadius: '4px',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <h5>题目 {index + 1} ({question.type === 'single' ? '单选题' : question.type === 'judge' ? '判断题' : question.type}) - {question.score}分</h5>
                    <p><strong>问题:</strong> {question.question}</p>
                    
                    {question.type === 'single' && question.options && (
                      <div>
                        <strong>选项:</strong>
                        <ul>
                          {question.options.map((option, optIndex) => (
                            <li key={optIndex} style={{
                              color: question.correctAnswer === optIndex ? '#28a745' : '#000',
                              fontWeight: question.correctAnswer === optIndex ? 'bold' : 'normal'
                            }}>
                              {String.fromCharCode(65 + optIndex)}. {option}
                              {question.correctAnswer === optIndex && ' ✓'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {question.type === 'judge' && (
                      <p><strong>正确答案:</strong> <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                        {question.correctAnswer ? '正确' : '错误'}
                      </span></p>
                    )}
                    
                    <p><strong>解析:</strong> {question.explanation}</p>
                    <p><strong>难度:</strong> {question.difficulty} | <strong>预计时间:</strong> {question.estimatedTime}分钟</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {testResult.error && (
            <div style={{ marginTop: '10px' }}>
              <strong>错误详情:</strong> {testResult.error}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TestQuizDataFormat