const axios = require('axios');
const getDoubaoResponse = require('./doubao_api');

/**
 * Dify Agent API集成服务
 * 用于调用Dify平台的AI Agent生成课程内容
 */
class AgentService {
  constructor() {
    this.apiKey = process.env.DIFY_API_KEY;
    this.apiUrl = process.env.DIFY_API_URL || 'https://api.dify.ai/v1';
  }

  /**
   * 生成课程大纲
   * @param {Object} params - 课程参数
   * @param {string} params.topic - 课程主题
   * @param {string} params.outline - 知识点大纲
   * @param {number} params.weeks - 课程周数
   * @param {string} params.level - 难度级别
   * @returns {Promise<Object>} 生成的课程内容
   */
  async generateCourseContent(params) {
    console.log('\n=== AgentService.generateCourseContent 调用 ===');
    console.log('时间:', new Date().toISOString());
    console.log('输入参数:', JSON.stringify(params, null, 2));
    
    try {
      const { topic, outline, weeks, level } = params;

      // 构建prompt
      const prompt = `
请根据以下信息生成一个完整的课程大纲:

课程主题: ${topic}
知识点大纲: ${outline}
课程周数: ${weeks}周
难度级别: ${level}

请生成:
1. 每周的详细教学内容
2. 学习目标
3. 重点难点
4. 推荐资源

请以JSON格式返回结果。
      `.trim();

      console.log('生成的prompt长度:', prompt.length);
      console.log('prompt预览:', prompt.substring(0, 300) + '...');

      // 调用豆包API生成课程内容
      console.log('开始调用豆包API生成课程内容...');
      
      const systemPrompt = `你是一位经验丰富的教育专家和课程设计师。

【重要】你必须严格按照以下要求返回数据：

0. 全部回答只使用英文，不使用任何中文
1. 只返回纯JSON格式数据，不要有任何其他文字说明
2. JSON必须包含以下字段：
   - courseTitle: 课程标题（字符串）
   - weeks: 课程周数（数字）
   - level: 难度级别（字符串）
   - outline: 课程大纲（数组）
   - learningObjectives: 学习目标（字符串数组）
   - resources: 推荐资源（对象数组）
   - quizTopics: 测验题目主题（字符串数组，3-5个）
   - assignments: 作业任务描述（字符串数组，3-5个）

3. 返回格式示例：
{
  "courseTitle": "课程名称",
  "weeks": 12,
  "level": "初级",
  "outline": [
    {
      "week": 1,
      "title": "第1周标题",
      "content": "本周内容描述",
      "keyPoints": ["要点1", "要点2"]
    }
  ],
  "learningObjectives": ["目标1", "目标2"],
  "resources": [
    {
      "name": "资源名称",
      "type": "doc",
      "url": "https://example.com"
    }
  ],
  "quizTopics": [
    "基础概念测验",
    "核心原理理解",
    "实践应用能力"
  ],
  "assignments": [
    "完成基础练习，巩固核心概念",
    "设计小型项目，应用所学知识",
    "分析实际案例，撰写分析报告"
  ]
}

请直接返回上述格式的JSON数据，不要包含\`\`\`json标记或其他说明文字。`;
      
      try {
        const aiResponse = await getDoubaoResponse(systemPrompt, prompt);
        console.log('豆包API响应成功，开始解析返回内容...');
        console.log('AI返回内容长度:', aiResponse.length);
        console.log('AI返回内容预览:', aiResponse.substring(0, 500) + '...');
        
        // 尝试解析JSON响应
        let parsedResponse;
        try {
          // 提取JSON内容（如果响应中包含```json标记）
          const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
          const jsonContent = jsonMatch ? jsonMatch[1] : aiResponse;
          
          parsedResponse = JSON.parse(jsonContent);
          console.log('JSON解析成功');
          
          const result = {
            success: true,
            data: {
              courseTitle: parsedResponse.courseTitle || topic,
              weeks: parsedResponse.weeks || parseInt(weeks),
              level: parsedResponse.level || level,
              outline: parsedResponse.outline || this.generateMockOutline(topic, weeks),
              learningObjectives: parsedResponse.learningObjectives || this.generateLearningObjectives(topic),
              resources: parsedResponse.resources || this.generateResources(topic),
              quizTopics: parsedResponse.quizTopics || this.generateQuizTopics(topic),
              assignments: parsedResponse.assignments || this.generateAssignments(topic)
            }
          };

          console.log('课程内容生成成功（通过豆包API）');
          console.log('生成的课程标题:', result.data.courseTitle);
          console.log('课程周数:', result.data.weeks);
          console.log('课程级别:', result.data.level);
          console.log('学习目标数量:', result.data.learningObjectives.length);
          console.log('推荐资源数量:', result.data.resources.length);
          console.log('=== AgentService.generateCourseContent 调用结束 ===\n');

          return result;
          
        } catch (parseError) {
          console.error('JSON解析失败:', parseError.message);
          console.log('AI原始返回内容:', aiResponse);
          throw new Error('AI返回内容解析失败，可能不是有效的JSON格式');
        }
        
      } catch (aiError) {
        console.error('豆包API调用失败:', aiError.message);
        console.log('回退到本地生成模式...');
        
        // 如果AI调用失败，回退到模拟生成
        const mockResponse = {
          success: true,
          data: {
            courseTitle: topic,
            weeks: parseInt(weeks),
            level: level,
            outline: this.generateMockOutline(topic, weeks),
            learningObjectives: this.generateLearningObjectives(topic),
            resources: this.generateResources(topic),
            quizTopics: this.generateQuizTopics(topic),
            assignments: this.generateAssignments(topic)
          },
          fallback: true, // 标记这是回退模式生成的
          message: '使用本地生成模式，因为AI服务暂时不可用'
        };

        console.log('课程内容生成成功（回退模式）');
        console.log('生成的课程标题:', mockResponse.data.courseTitle);
        console.log('课程周数:', mockResponse.data.weeks);
        console.log('课程级别:', mockResponse.data.level);
        console.log('学习目标数量:', mockResponse.data.learningObjectives.length);
        console.log('推荐资源数量:', mockResponse.data.resources.length);
        console.log('=== AgentService.generateCourseContent 调用结束 ===\n');

        return mockResponse;
      }
    } catch (error) {
      console.error('=== AgentService.generateCourseContent 调用失败 ===');
      console.error('错误信息:', error.message);
      console.error('错误堆栈:', error.stack);
      console.error('=== AgentService.generateCourseContent 调用失败结束 ===\n');
      throw new Error('课程内容生成失败');
    }
  }

  /**
   * 生成Quiz题目
   * @param {Object} params - Quiz参数
   * @param {string} params.topic - 主题
   * @param {number} params.count - 题目数量
   * @param {string} params.difficulty - 难度
   * @param {string} params.audience - 目标受众
   * @param {string} params.subjects - 涉及知识点
   * @param {Array} params.questionTypes - 题型列表
   * @returns {Promise<Array>} 生成的题目列表
   */
  async generateQuizQuestions(params) {
    console.log('\n=== AgentService.generateQuizQuestions 调用 ===');
    console.log('时间:', new Date().toISOString());
    console.log('输入参数:', JSON.stringify(params, null, 2));
    
    try {
      const { topic, count, difficulty, audience, subjects, questionTypes } = params;

      // 构建极其详细和专业的生成prompt
      const prompt = `
你是一位经验丰富的教育测评专家和题库设计师，请为"${topic}"主题设计${count}道高质量的测验题目。

## 目标设定
- 🎯 目标受众: ${audience || '大学生'}
- 📊 难度级别: ${difficulty || '中等'}
- 📚 涉及知识点: ${subjects || '相关核心知识'}
- 📝 题型分布: ${questionTypes?.join('、') || '多种题型混合'}

## 详细要求

### 1. 题目质量标准
- **科学性**: 确保题目内容准确无误，符合学科最新发展
- **区分度**: 能够有效区分不同水平的学习者
- **适用性**: 符合目标受众的认知水平和知识背景
- **实用性**: 贴近实际应用场景，具有教育价值

### 2. 各题型具体要求

#### 单选题 (SINGLE_CHOICE)
- 题干明确，避免歧义表达
- 4个选项长度相近，形式统一
- 正确答案唯一且明确
- 干扰项具有一定迷惑性但不过分干扰
- 避免"以上都对"、"以上都错"等表述

#### 多选题 (MULTIPLE_CHOICE)  
- 明确标注"多选题"或"(多选)"
- 正确答案2-3个为宜
- 选项间相互独立，组合合理
- 避免选项之间的包含关系

#### 判断题 (TRUE_FALSE)
- 陈述清晰，避免模糊表达
- 避免绝对化词汇（总是、从不、一定等）
- 确保判断依据明确

#### 简答题 (ESSAY)
- 问题具体，指向明确
- 预设答案要点3-5个
- 设定合理的答题字数范围

### 3. 难度分级标准

#### 简单级别
- 基础概念识别和理解
- 直接知识点回忆
- 简单应用和判断

#### 中等级别  
- 概念间关系理解
- 知识点综合运用
- 简单分析和推理

#### 困难级别
- 复杂问题分析
- 跨知识点综合应用
- 创新思维和批判性思考

### 4. 内容设计指导

#### 知识覆盖
- 核心概念: 30%
- 原理方法: 25% 
- 实际应用: 25%
- 前沿发展: 20%

#### 认知层次分布
- 记忆理解: 40%
- 应用分析: 40%
- 综合评价: 20%

### 5. 答案解析要求
- 解释正确答案的依据和原理
- 分析错误选项的问题所在
- 提供相关知识点的扩展说明
- 字数控制在50-150字

## 输出格式

请严格按照以下JSON格式返回，确保数据结构完整且类型正确:

\`\`\`json
{
  "questions": [
    {
      "id": "q1",
      "type": "SINGLE_CHOICE|MULTIPLE_CHOICE|TRUE_FALSE|ESSAY",
      "question": "题目内容（清晰、准确、无歧义）",
      "options": ["选项A（简洁明了）", "选项B（形式统一）", "选项C（长度相近）", "选项D（逻辑清晰）"],
      "correctAnswer": "A" 或 ["A", "C"] 或 true/false 或 "参考答案要点",
      "explanation": "详细的答案解析，包含原理说明和知识点扩展",
      "difficulty": "Simple|Medium|Difficult",
      "knowledgePoints": ["知识点1", "知识点2"],
      "cognitiveLevel": "Remembering|Understanding|Applying|Analyzing|Synthesizing|Evaluating",
      "estimatedTime": "预计答题时间（分钟）",
      "score": "建议分值"
    }
  ],
  "metadata": {
    "generatedAt": "生成时间",
    "totalQuestions": ${count},
    "difficultyDistribution": "难度分布统计",
    "typeDistribution": "题型分布统计",
    "averageTime": "预计总答题时间",
    "totalScore": "总分值"
  }
}
\`\`\`

## 特别注意事项
1. 确保所有题目都与"${topic}"主题高度相关
2. 避免出现偏题、超纲或过于基础的内容  
3. 选项设计要考虑常见错误和误区
4. 解析要有教育价值，不仅说明答案还要启发思考
5. 题目表述要简洁明了，避免冗长复杂的句式
6. 数值、公式、术语等要准确无误
7. 考虑不同学习背景学生的理解能力

请开始生成高质量的测验题目。
      `.trim();

      console.log('生成的prompt长度:', prompt.length);
      console.log('prompt预览:', prompt.substring(0, 500) + '...');

      // 调用豆包API生成题目
      console.log('开始调用豆包API生成题目...');
      
      const systemPrompt = `你是一位经验丰富的教育测评专家和题库设计师。

【重要】你必须严格按照以下要求返回数据：

0. 全部回答只使用英文，不使用任何中文
1. 只返回纯JSON格式数据，不要有任何其他文字说明
2. JSON必须包含顶层的questions数组
3. 每个题目对象必须包含以下字段：
   - id: 题目ID（字符串，如"q1"）
   - type: 题型（字符串，必须是：SINGLE_CHOICE、MULTIPLE_CHOICE、TRUE_FALSE、ESSAY之一）
   - question: 题目内容（字符串）
   - options: 选项数组（数组，单选/多选需要4个选项）
   - correctAnswer: 正确答案（单选用字符串如"A"，多选用数组如["A","C"]，判断用布尔值true/false）
   - explanation: 答案解析（字符串）
   - difficulty: 难度（字符串）
   - knowledgePoints: 知识点（字符串数组）
   - cognitiveLevel: 认知层次（字符串）
   - estimatedTime: 预计答题时间（数字，分钟）
   - score: 分值（数字）

4. 返回格式示例：
{
  "questions": [
    {
      "id": "q1",
      "type": "SINGLE_CHOICE",
      "question": "题目内容？",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "correctAnswer": "A",
      "explanation": "这是答案解析",
      "difficulty": "中等",
      "knowledgePoints": ["知识点1", "知识点2"],
      "cognitiveLevel": "理解",
      "estimatedTime": 2,
      "score": 10
    }
  ]
}

请直接返回上述格式的JSON数据，不要包含\`\`\`json标记或其他说明文字。`;
      
      try {
        const aiResponse = await getDoubaoResponse(systemPrompt, prompt);
        console.log('豆包API响应成功，开始解析返回内容...');
        console.log('AI返回内容长度:', aiResponse.length);
        console.log('AI返回内容预览:', aiResponse.substring(0, 500) + '...');
        
        // 尝试解析JSON响应
        let parsedResponse;
        try {
          // 提取JSON内容（如果响应中包含```json标记）
          const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
          const jsonContent = jsonMatch ? jsonMatch[1] : aiResponse;
          
          parsedResponse = JSON.parse(jsonContent);
          console.log('JSON解析成功');
          console.log('解析后的题目数量:', parsedResponse.questions?.length || 0);
          
          if (parsedResponse.questions && Array.isArray(parsedResponse.questions)) {
            const result = {
              success: true,
              data: parsedResponse.questions
            };
            
            console.log('Quiz题目生成成功（通过豆包API）');
            console.log('实际生成题目数量:', parsedResponse.questions.length);
            console.log('目标题目数量:', count);
            console.log('题目预览:');
            parsedResponse.questions.slice(0, 2).forEach((q, index) => {
              console.log(`  题目${index + 1}: ${q.question?.substring(0, 50)}...`);
              console.log(`  题型: ${q.type}, 难度: ${q.difficulty}, 分值: ${q.score}`);
            });
            
            return result;
          } else {
            throw new Error('AI返回的JSON格式不正确，缺少questions数组');
          }
        } catch (parseError) {
          console.error('JSON解析失败:', parseError.message);
          console.log('AI原始返回内容:', aiResponse);
          throw new Error('AI返回内容解析失败，可能不是有效的JSON格式');
        }
        
      } catch (aiError) {
        console.error('豆包API调用失败:', aiError.message);
        console.log('回退到本地生成模式...');
        
        // 如果AI调用失败，回退到本地智能化生成
        const questions = this.generateIntelligentQuestions(params);
        
        console.log('Quiz题目生成成功（回退模式）');
        console.log('实际生成题目数量:', questions.length);
        console.log('目标题目数量:', count);
        console.log('题目预览:');
        questions.slice(0, 2).forEach((q, index) => {
          console.log(`  题目${index + 1}: ${q.question.substring(0, 50)}...`);
          console.log(`  题型: ${q.type}, 难度: ${q.difficulty}, 分值: ${q.score}`);
        });

        const result = {
          success: true,
          data: questions,
          fallback: true, // 标记这是回退模式生成的
          message: '使用本地生成模式，因为AI服务暂时不可用'
        };
        
        return result;
      }
      
      console.log('返回结果预览:', {
        success: result.success,
        dataLength: result.data?.length || 0,
        firstQuestion: result.data?.[0]?.question?.substring(0, 50) + '...' || 'N/A',
        fallback: result.fallback || false
      });
      console.log('=== AgentService.generateQuizQuestions 调用结束 ===\n');

      return result;
    } catch (error) {
      console.error('=== AgentService.generateQuizQuestions 调用失败 ===');
      console.error('错误信息:', error.message);
      console.error('错误堆栈:', error.stack);
      console.error('=== AgentService.generateQuizQuestions 调用失败结束 ===\n');
      throw new Error('Quiz题目生成失败');
    }
  }

  /**
   * 重新生成单个Quiz题目
   * @param {Object} params - Quiz参数
   * @param {string} params.topic - 主题
   * @param {number} params.count - 题目数量（应为1）
   * @param {string} params.difficulty - 难度
   * @param {string} params.audience - 目标受众
   * @param {string} params.subjects - 涉及知识点
   * @param {Array} params.questionTypes - 题型列表
   * @param {Object} params.currentQuestion - 当前题目信息
   * @returns {Promise<Object>} 重新生成的题目
   */
  async regenerateQuizQuestion(params) {
    console.log('\n=== AgentService.regenerateQuizQuestion 调用 ===');
    console.log('时间:', new Date().toISOString());
    console.log('输入参数:', JSON.stringify(params, null, 2));
    
    try {
      const { topic, difficulty, audience, subjects, questionTypes, currentQuestion } = params;

      // 构建更加精确的重新生成prompt
      const currentInfo = currentQuestion ? `

当前题目信息：
- 题型：${currentQuestion.type}
- 题目：${currentQuestion.question}
- 选项：${JSON.stringify(currentQuestion.options || [])}
- 正确答案：${currentQuestion.correctAnswer}

请生成一道完全不同的${questionTypes[0]}题目，避免与当前题目重复。` : '';

      const prompt = `
你是一位经验丰富的教育测评专家，请为"${topic}"主题重新生成1道高质量的${questionTypes[0]}题目。

## 目标设定
- 🎯 目标受众: ${audience || '大学生'}
- 📊 难度级别: ${difficulty || '中等'}
- 📚 涉及知识点: ${subjects || '相关核心知识'}
- 📝 题型: ${questionTypes[0]}${currentInfo}

## 详细要求

### 题目质量标准
- **创新性**: 确保题目内容新颖，角度独特，避免常见题型
- **科学性**: 确保题目内容准确无误，符合学科最新发展
- **区分度**: 能够有效区分不同水平的学习者
- **适用性**: 符合目标受众的认知水平和知识背景
- **实用性**: 贴近实际应用场景，具有教育价值

### 创意要求
- 从不同角度切入主题
- 避免常见的模式化表述
- 融入最新的发展动态
- 结合实际应用场景
- 体现批判性思维

### 输出格式

0. 全部回答只使用英文，不使用任何中文
1.请严格按照以下JSON格式返回：

\`\`\`json
{
  "question": {
    "id": "regen_${Date.now()}",
    "type": "${questionTypes[0] === 'single' ? 'SINGLE_CHOICE' : questionTypes[0] === 'multiple' ? 'MULTIPLE_CHOICE' : questionTypes[0] === 'judge' ? 'TRUE_FALSE' : 'ESSAY'}",
    "question": "题目内容（创新且富有启发性）",
    "options": ["选项A", "选项B", "选项C", "选项D"],
    "correctAnswer": "A" 或 ["A", "C"] 或 true/false,
    "explanation": "详细的答案解析（150-200字）",
    "difficulty": "${difficulty}",
    "knowledgePoints": ["知识点1", "知识点2"],
    "cognitiveLevel": "记忆|理解|应用|分析|综合|评价",
    "estimatedTime": "预计答题时间（分钟）",
    "score": "建议分值",
    "tags": ["标签1", "标签2"],
    "novelty": "创新点描述"
  }
}
\`\`\`

请确保生成的题目具有独特性和创新性！
      `.trim();

      console.log('生成的prompt长度:', prompt.length);
      console.log('prompt预览:', prompt.substring(0, 500) + '...');

      // 调用豆包API重新生成题目
      console.log('开始调用豆包API重新生成题目...');
      
      const systemPrompt = `你是一位经验丰富的教育测评专家。

【重要】你必须严格按照以下要求返回数据：

0. 全部回答只使用英文，不使用任何中文
1. 只返回纯JSON格式数据，不要有任何其他文字说明
2. JSON必须包含顶层的question对象
3. 题目对象必须包含以下字段：
   - id: 题目ID（字符串）
   - type: 题型（字符串，必须是：SINGLE_CHOICE、MULTIPLE_CHOICE、TRUE_FALSE、ESSAY之一）
   - question: 题目内容（字符串）
   - options: 选项数组（数组）
   - correctAnswer: 正确答案（根据题型：字符串、数组或布尔值）
   - explanation: 答案解析（字符串）
   - difficulty: 难度（字符串）
   - knowledgePoints: 知识点（字符串数组）
   - cognitiveLevel: 认知层次（字符串）
   - estimatedTime: 预计答题时间（数字）
   - score: 分值（数字）
   - tags: 标签（字符串数组）
   - novelty: 创新点描述（字符串）

4. 返回格式示例：
{
  "question": {
    "id": "regen_123456",
    "type": "SINGLE_CHOICE",
    "question": "题目内容？",
    "options": ["选项A", "选项B", "选项C", "选项D"],
    "correctAnswer": "A",
    "explanation": "答案解析",
    "difficulty": "中等",
    "knowledgePoints": ["知识点1"],
    "cognitiveLevel": "理解",
    "estimatedTime": 2,
    "score": 10,
    "tags": ["标签1"],
    "novelty": "创新点说明"
  }
}

请直接返回上述格式的JSON数据，不要包含\`\`\`json标记或其他说明文字。`;
      
      try {
        const aiResponse = await getDoubaoResponse(systemPrompt, prompt);
        console.log('豆包API响应成功，开始解析返回内容...');
        console.log('AI返回内容长度:', aiResponse.length);
        console.log('AI返回内容预览:', aiResponse.substring(0, 500) + '...');
        
        // 尝试解析JSON响应
        let parsedResponse;
        try {
          // 提取JSON内容（如果响应中包含```json标记）
          const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
          const jsonContent = jsonMatch ? jsonMatch[1] : aiResponse;
          
          parsedResponse = JSON.parse(jsonContent);
          console.log('JSON解析成功');
          
          if (parsedResponse.question) {
            const question = parsedResponse.question;
            
            // 确保题目格式正确
            const formattedQuestion = {
              id: question.id || `regen_${Date.now()}`,
              type: this.mapQuestionType(question.type),
              question: question.question || `重新生成的${topic}题目`,
              options: Array.isArray(question.options) ? question.options : [],
              correctAnswer: question.correctAnswer,
              explanation: question.explanation || `这是关于"${topic}"的重新生成题目解析。`,
              difficulty: question.difficulty || difficulty,
              knowledgePoints: Array.isArray(question.knowledgePoints) ? question.knowledgePoints : [`${topic}相关知识点`],
              cognitiveLevel: question.cognitiveLevel || this.getCognitiveLevel(questionTypes[0], difficulty),
              estimatedTime: typeof question.estimatedTime === 'number' ? question.estimatedTime : this.getEstimatedTime(questionTypes[0], difficulty),
              score: typeof question.score === 'number' ? question.score : this.getQuestionScore(questionTypes[0], difficulty),
              tags: Array.isArray(question.tags) ? question.tags : [topic, '重新生成'],
              novelty: question.novelty || '全新角度的创新题目'
            };
            
            const result = {
              success: true,
              data: formattedQuestion
            };
            
            console.log('单个Quiz题目重新生成成功（通过豆包API）');
            console.log('题目ID:', formattedQuestion.id);
            console.log('题目类型:', formattedQuestion.type);
            console.log('题目内容:', formattedQuestion.question.substring(0, 50) + '...');
            console.log('创新点:', formattedQuestion.novelty);
            console.log('=== AgentService.regenerateQuizQuestion 调用结束 ===\n');
            
            return result;
          } else {
            throw new Error('AI返回的JSON格式不正确，缺少question对象');
          }
        } catch (parseError) {
          console.error('JSON解析失败:', parseError.message);
          console.log('AI原始返回内容:', aiResponse);
          throw new Error('AI返回内容解析失败，可能不是有效的JSON格式');
        }
        
      } catch (aiError) {
        console.error('豆包API调用失败:', aiError.message);
        console.log('回退到本地生成模式...');
        
        // 如果AI调用失败，回退到本地智能化生成
        const question = this.generateSingleIntelligentQuestion({
          ...params,
          isRegeneration: true,
          currentQuestion
        });
        
        console.log('单个Quiz题目重新生成成功（回退模式）');
        console.log('题目ID:', question.id);
        console.log('题目类型:', question.type);
        console.log('题目内容:', question.question.substring(0, 50) + '...');

        const result = {
          success: true,
          data: question,
          fallback: true,
          message: '使用本地生成模式，因为AI服务暂时不可用'
        };
        
        return result;
      }
      
    } catch (error) {
      console.error('=== AgentService.regenerateQuizQuestion 调用失败 ===');
      console.error('错误信息:', error.message);
      console.error('错误堆栈:', error.stack);
      console.error('=== AgentService.regenerateQuizQuestion 调用失败结束 ===\n');
      throw new Error('单个Quiz题目重新生成失败');
    }
  }

  /**
   * 生成单个智能化题目（用于回退模式或重新生成）
   * @param {Object} params - 参数
   * @returns {Object} 单个题目
   */
  generateSingleIntelligentQuestion(params) {
    const { topic, difficulty, audience, subjects, questionTypes, isRegeneration, currentQuestion } = params;
    const questionType = questionTypes[0];
    const timestamp = Date.now();
    
    // 如果是重新生成，增加更多变化
    const variationSuffix = isRegeneration ? `_v${Math.floor(Math.random() * 1000)}` : '';
    
    const questionId = `q_${timestamp}${variationSuffix}`;
    const knowledgeAreas = this.extractKnowledgeAreas(topic, subjects);
    
    let question;
    
    if (questionType === 'single') {
      question = {
        id: questionId,
        type: 'SINGLE_CHOICE',
        question: this.generateVariedSingleChoiceQuestion(topic, difficulty, audience, knowledgeAreas, isRegeneration, currentQuestion),
        options: this.generateVariedOptions(topic, 'single', difficulty, knowledgeAreas, isRegeneration),
        correctAnswer: 'A',
        explanation: this.generateDetailedExplanation(topic, 'single', difficulty, knowledgeAreas),
        difficulty,
        knowledgePoints: this.getRelevantKnowledgePoints(topic, 'single', Math.floor(Math.random() * 5)),
        cognitiveLevel: this.getCognitiveLevel('single', difficulty),
        estimatedTime: this.getEstimatedTime('single', difficulty),
        score: this.getQuestionScore('single', difficulty),
        tags: [topic, isRegeneration ? '重新生成' : '智能生成', difficulty],
        novelty: isRegeneration ? '采用全新角度和表述方式' : '智能化生成的创新题目'
      };
    } else if (questionType === 'multiple') {
      question = {
        id: questionId,
        type: 'MULTIPLE_CHOICE',
        question: this.generateVariedMultipleChoiceQuestion(topic, difficulty, audience, knowledgeAreas, isRegeneration, currentQuestion),
        options: this.generateVariedOptions(topic, 'multiple', difficulty, knowledgeAreas, isRegeneration),
        correctAnswer: ['A', 'C'],
        explanation: this.generateDetailedExplanation(topic, 'multiple', difficulty, knowledgeAreas),
        difficulty,
        knowledgePoints: this.getRelevantKnowledgePoints(topic, 'multiple', Math.floor(Math.random() * 5)),
        cognitiveLevel: this.getCognitiveLevel('multiple', difficulty),
        estimatedTime: this.getEstimatedTime('multiple', difficulty),
        score: this.getQuestionScore('multiple', difficulty),
        tags: [topic, isRegeneration ? '重新生成' : '智能生成', difficulty],
        novelty: isRegeneration ? '采用全新角度和表述方式' : '智能化生成的创新题目'
      };
    } else if (questionType === 'judge') {
      question = {
        id: questionId,
        type: 'TRUE_FALSE',
        question: this.generateVariedTrueFalseQuestion(topic, difficulty, audience, knowledgeAreas, isRegeneration, currentQuestion),
        options: ['正确', '错误'],
        correctAnswer: Math.random() > 0.5,
        explanation: this.generateDetailedExplanation(topic, 'judge', difficulty, knowledgeAreas),
        difficulty,
        knowledgePoints: this.getRelevantKnowledgePoints(topic, 'judge', Math.floor(Math.random() * 5)),
        cognitiveLevel: this.getCognitiveLevel('judge', difficulty),
        estimatedTime: this.getEstimatedTime('judge', difficulty),
        score: this.getQuestionScore('judge', difficulty),
        tags: [topic, isRegeneration ? '重新生成' : '智能生成', difficulty],
        novelty: isRegeneration ? '采用全新角度和表述方式' : '智能化生成的创新题目'
      };
    } else {
      // essay类型
      question = {
        id: questionId,
        type: 'ESSAY',
        question: this.generateVariedEssayQuestion(topic, difficulty, audience, knowledgeAreas, isRegeneration, currentQuestion),
        options: [],
        correctAnswer: this.generateEssayAnswer(topic, difficulty, knowledgeAreas),
        explanation: this.generateDetailedExplanation(topic, 'essay', difficulty, knowledgeAreas),
        difficulty,
        knowledgePoints: this.getRelevantKnowledgePoints(topic, 'essay', Math.floor(Math.random() * 5)),
        cognitiveLevel: this.getCognitiveLevel('essay', difficulty),
        estimatedTime: this.getEstimatedTime('essay', difficulty),
        score: this.getQuestionScore('essay', difficulty),
        tags: [topic, isRegeneration ? '重新生成' : '智能生成', difficulty],
        novelty: isRegeneration ? '采用全新角度和表述方式' : '智能化生成的创新题目'
      };
    }
    
    return question;
  }

  /**
   * 生成变化的单选题题目
   */
  generateVariedSingleChoiceQuestion(topic, difficulty, audience, knowledgeAreas, isRegeneration, currentQuestion) {
    const perspectives = ['理论角度', '实践角度', '历史角度', '发展趋势', '比较分析', '应用场景', '技术实现', '社会影响'];
    const perspective = perspectives[Math.floor(Math.random() * perspectives.length)];
    
    const templates = {
      '简单': [
        `从${perspective}来看，${topic}的核心要素是什么？`,
        `在${topic}领域中，哪个概念最为基础和重要？`,
        `${topic}的主要价值体现在哪个方面？`,
        `对于${audience}而言，学习${topic}的首要目标是？`,
        `${topic}与传统方法的最大区别在于？`,
        `在${topic}的基础理论中，最重要的原则是？`
      ],
      '中等': [
        `在${topic}的实际应用中，${perspective}最需要考虑的因素是？`,
        `${topic}的发展过程中，${perspective}的重要转折点是？`,
        `评估${topic}效果时，${perspective}的关键指标是？`,
        `${topic}在不同环境下的适应性主要取决于？`,
        `实施${topic}项目时，从${perspective}最应该重视的是？`,
        `${topic}的创新发展主要体现在${perspective}的哪个方面？`
      ],
      '困难': [
        `在复杂的${topic}系统中，从${perspective}如何平衡多重约束？`,
        `${topic}的跨领域融合中，${perspective}面临的核心挑战是？`,
        `未来${topic}的突破方向，从${perspective}最可能出现在？`,
        `${topic}的智能化转型中，${perspective}的关键技术路径是？`,
        `${topic}产业生态的可持续发展依赖于${perspective}的哪个要素？`,
        `${topic}的国际竞争优势主要来源于${perspective}的？`
      ]
    };
    
    const difficultyTemplates = templates[difficulty] || templates['中等'];
    let selectedTemplate = difficultyTemplates[Math.floor(Math.random() * difficultyTemplates.length)];
    
    // 如果是重新生成且有当前题目，尽量避免相似表述
    if (isRegeneration && currentQuestion) {
      const currentWords = currentQuestion.question.split(/[\s，。？！]+/);
      let attempts = 0;
      while (attempts < 3) {
        const testTemplate = difficultyTemplates[Math.floor(Math.random() * difficultyTemplates.length)];
        const hasCommonWords = currentWords.some(word => word.length > 2 && testTemplate.includes(word));
        if (!hasCommonWords) {
          selectedTemplate = testTemplate;
          break;
        }
        attempts++;
      }
    }
    
    return selectedTemplate;
  }

  /**
   * 生成变化的多选题题目
   */
  generateVariedMultipleChoiceQuestion(topic, difficulty, audience, knowledgeAreas, isRegeneration, currentQuestion) {
    const aspects = ['技术层面', '管理层面', '用户层面', '市场层面', '创新层面'];
    const aspect = aspects[Math.floor(Math.random() * aspects.length)];
    
    const templates = {
      '简单': [
        `${topic}在${aspect}的基本要求包括哪些？（多选）`,
        `学习${topic}需要具备的${aspect}基础有？（多选）`,
        `${topic}的${aspect}特征主要体现在？（多选）`,
        `${topic}入门阶段在${aspect}需要关注的要点包括？（多选）`
      ],
      '中等': [
        `${topic}的成功实施在${aspect}需要满足哪些条件？（多选）`,
        `${topic}项目在${aspect}的评估维度包括？（多选）`,
        `优化${topic}效果在${aspect}可采用的策略有？（多选）`,
        `${topic}的可持续发展在${aspect}依赖于哪些因素？（多选）`,
        `${topic}与相关技术集成时在${aspect}需要考虑？（多选）`
      ],
      '困难': [
        `${topic}的前沿发展在${aspect}体现的趋势包括？（多选）`,
        `${topic}的生态建设在${aspect}面临的挑战有？（多选）`,
        `${topic}的国际化推进在${aspect}需要突破的关键点？（多选）`,
        `${topic}的智能化升级在${aspect}的核心技术包括？（多选）`,
        `${topic}的产业融合在${aspect}创造的新价值体现在？（多选）`
      ]
    };
    
    const difficultyTemplates = templates[difficulty] || templates['中等'];
    return difficultyTemplates[Math.floor(Math.random() * difficultyTemplates.length)];
  }

  /**
   * 生成变化的判断题题目
   */
  generateVariedTrueFalseQuestion(topic, difficulty, audience, knowledgeAreas, isRegeneration, currentQuestion) {
    const viewpoints = ['必然性', '充分性', '必要性', '可行性', '有效性', '适用性'];
    const viewpoint = viewpoints[Math.floor(Math.random() * viewpoints.length)];
    
    const templates = {
      '简单': [
        `${topic}的学习${viewpoint}要求具备深厚的数学基础。`,
        `${topic}在所有行业都具有同等的应用${viewpoint}。`,
        `掌握${topic}理论知识${viewpoint}能够解决实践问题。`,
        `${topic}的发展${viewpoint}依赖于技术的不断进步。`,
        `${topic}教育的${viewpoint}需要理论与实践并重。`
      ],
      '中等': [
        `${topic}技术的成熟度${viewpoint}决定了其商业应用的成功。`,
        `${topic}项目的${viewpoint}主要取决于团队的技术实力。`,
        `${topic}标准化的实现${viewpoint}消除所有应用差异。`,
        `${topic}的创新突破${viewpoint}来源于跨学科的融合。`,
        `${topic}的可持续发展${viewpoint}需要政策支持和市场引导。`
      ],
      '困难': [
        `${topic}的未来演进${viewpoint}遵循当前的技术发展轨迹。`,
        `${topic}的社会价值${viewpoint}超越其经济效益。`,
        `${topic}的全球化推广${viewpoint}忽略文化差异因素。`,
        `${topic}的伦理规范${viewpoint}能够完全通过技术手段保障。`,
        `${topic}产业的生态完善${viewpoint}由市场自发形成。`
      ]
    };
    
    const difficultyTemplates = templates[difficulty] || templates['中等'];
    return difficultyTemplates[Math.floor(Math.random() * difficultyTemplates.length)];
  }

  /**
   * 生成变化的简答题题目
   */
  generateVariedEssayQuestion(topic, difficulty, audience, knowledgeAreas, isRegeneration, currentQuestion) {
    const approaches = ['理论分析', '案例研究', '比较研究', '发展预测', '创新设计', '批判评估'];
    const approach = approaches[Math.floor(Math.random() * approaches.length)];
    
    const templates = {
      '简单': [
        `运用${approach}的方法，阐述${topic}的基本内涵和主要特征。（约200字）`,
        `从${approach}的视角，说明${topic}在现代社会中的重要意义。（约180字）`,
        `采用${approach}的思路，概括${topic}的核心原理和基本规律。（约220字）`,
        `基于${approach}的框架，介绍${topic}的典型应用和实施要点。（约250字）`
      ],
      '中等': [
        `运用${approach}的方法，分析${topic}在实际应用中的优势与不足。（约300字）`,
        `从${approach}的角度，探讨${topic}与相关技术的协同发展机制。（约350字）`,
        `采用${approach}的思路，评估${topic}对行业发展的影响和意义。（约280字）`,
        `基于${approach}的视角，论述${topic}的创新发展路径和策略。（约320字）`
      ],
      '困难': [
        `运用${approach}的方法，构建${topic}的未来发展模型和演进路径。（约500字）`,
        `从${approach}的维度，设计${topic}的跨领域融合应用方案。（约450字）`,
        `采用${approach}的框架，评估${topic}对社会经济的深层影响。（约400字）`,
        `基于${approach}的理论，提出${topic}可持续发展的创新机制。（约480字）`
      ]
    };
    
    const difficultyTemplates = templates[difficulty] || templates['中等'];
    return difficultyTemplates[Math.floor(Math.random() * difficultyTemplates.length)];
  }

  /**
   * 生成变化的选项
   */
  generateVariedOptions(topic, type, difficulty, knowledgeAreas, isRegeneration) {
    const timestamp = Date.now() % 1000;
    
    if (type === 'single') {
      const optionCategories = ['方法论', '技术路线', '应用模式', '评估标准', '发展趋势'];
      const category = optionCategories[Math.floor(Math.random() * optionCategories.length)];
      
      const optionSets = {
        '简单': [
          [`渐进式${category}`, `革命式${category}`, `混合式${category}`, `自适应${category}`],
          [`传统${category}体系`, `现代${category}框架`, `未来${category}模式`, `创新${category}路径`],
          [`理论导向${category}`, `实践驱动${category}`, `需求牵引${category}`, `技术推动${category}`]
        ],
        '中等': [
          [`多维协同${category}`, `层次递进${category}`, `闭环反馈${category}`, `开放融合${category}`],
          [`数据驱动${category}`, `模型优化${category}`, `算法迭代${category}`, `系统集成${category}`],
          [`智能化${category}`, `自动化${category}`, `个性化${category}`, `标准化${category}`]
        ],
        '困难': [
          [`认知增强${category}`, `自主演进${category}`, `生态协同${category}`, `价值创造${category}`],
          [`复杂适应${category}`, `涌现优化${category}`, `递归改进${category}`, `动态平衡${category}`],
          [`多目标优化${category}`, `约束满足${category}`, `风险规避${category}`, `效益最大化${category}`]
        ]
      };
      
      const options = optionSets[difficulty] || optionSets['中等'];
      const selectedOptions = options[Math.floor(Math.random() * options.length)];
      return selectedOptions.map(option => `${option}_${timestamp}`);
    }
    
    if (type === 'multiple') {
      const dimensionTypes = ['功能维度', '性能维度', '质量维度', '成本维度', '风险维度'];
      const dimension = dimensionTypes[Math.floor(Math.random() * dimensionTypes.length)];
      
      const optionSets = {
        '简单': [
          [`基础${dimension}保障`, `核心${dimension}提升`, `扩展${dimension}优化`, `综合${dimension}平衡`],
          [`${dimension}的完整性`, `${dimension}的一致性`, `${dimension}的可靠性`, `${dimension}的可扩展性`]
        ],
        '中等': [
          [`${dimension}的智能化程度`, `${dimension}的自动化水平`, `${dimension}的个性化能力`, `${dimension}的标准化程度`],
          [`${dimension}的创新性突破`, `${dimension}的实用性验证`, `${dimension}的经济性评估`, `${dimension}的可持续性保障`]
        ],
        '困难': [
          [`${dimension}的前瞻性布局`, `${dimension}的系统性设计`, `${dimension}的适应性机制`, `${dimension}的演进性能力`],
          [`${dimension}的协同优化`, `${dimension}的动态调整`, `${dimension}的智能决策`, `${dimension}的价值最大化`]
        ]
      };
      
      const options = optionSets[difficulty] || optionSets['中等'];
      const selectedOptions = options[Math.floor(Math.random() * options.length)];
      return selectedOptions.map(option => `${option}_${timestamp}`);
    }
    
    return [];
  }

  /**
   * 生成智能化的模拟题目
   * @param {Object} params - 参数
   * @returns {Array} 题目列表
   */
  generateIntelligentQuestions(params) {
    const { topic, count, difficulty, audience, subjects, questionTypes } = params;
    const questions = [];
    
    // 定义题型分布
    const typeDistribution = this.calculateTypeDistribution(questionTypes, count);
    
    let questionId = 1;
    const knowledgeAreas = this.extractKnowledgeAreas(topic, subjects);

    // 生成单选题
    for (let i = 0; i < typeDistribution.single; i++) {
      const difficultyLevel = this.getDifficultyForQuestion(difficulty, i, typeDistribution.single);
      questions.push({
        id: `q${questionId++}`,
        type: 'SINGLE_CHOICE',
        question: this.generateSingleChoiceQuestion(topic, difficultyLevel, audience, i + 1, knowledgeAreas),
        options: this.generateOptions(topic, 'single', i, difficultyLevel, knowledgeAreas),
        correctAnswer: 'A',
        explanation: this.generateDetailedExplanation(topic, 'single', difficultyLevel, knowledgeAreas),
        difficulty: difficultyLevel,
        knowledgePoints: this.getRelevantKnowledgePoints(topic, 'single', i),
        cognitiveLevel: this.getCognitiveLevel('single', difficultyLevel),
        estimatedTime: this.getEstimatedTime('single', difficultyLevel),
        score: this.getQuestionScore('single', difficultyLevel)
      });
    }

    // 生成多选题
    for (let i = 0; i < typeDistribution.multiple; i++) {
      const difficultyLevel = this.getDifficultyForQuestion(difficulty, i, typeDistribution.multiple);
      questions.push({
        id: `q${questionId++}`,
        type: 'MULTIPLE_CHOICE',
        question: this.generateMultipleChoiceQuestion(topic, difficultyLevel, audience, i + 1, knowledgeAreas),
        options: this.generateOptions(topic, 'multiple', i, difficultyLevel, knowledgeAreas),
        correctAnswer: ['A', 'C'],
        explanation: this.generateDetailedExplanation(topic, 'multiple', difficultyLevel, knowledgeAreas),
        difficulty: difficultyLevel,
        knowledgePoints: this.getRelevantKnowledgePoints(topic, 'multiple', i),
        cognitiveLevel: this.getCognitiveLevel('multiple', difficultyLevel),
        estimatedTime: this.getEstimatedTime('multiple', difficultyLevel),
        score: this.getQuestionScore('multiple', difficultyLevel)
      });
    }

    // 生成判断题
    for (let i = 0; i < typeDistribution.judge; i++) {
      const difficultyLevel = this.getDifficultyForQuestion(difficulty, i, typeDistribution.judge);
      questions.push({
        id: `q${questionId++}`,
        type: 'TRUE_FALSE',
        question: this.generateTrueFalseQuestion(topic, difficultyLevel, audience, i + 1, knowledgeAreas),
        options: ['正确', '错误'],
        correctAnswer: Math.random() > 0.5 ? true : false,
        explanation: this.generateDetailedExplanation(topic, 'judge', difficultyLevel, knowledgeAreas),
        difficulty: difficultyLevel,
        knowledgePoints: this.getRelevantKnowledgePoints(topic, 'judge', i),
        cognitiveLevel: this.getCognitiveLevel('judge', difficultyLevel),
        estimatedTime: this.getEstimatedTime('judge', difficultyLevel),
        score: this.getQuestionScore('judge', difficultyLevel)
      });
    }

    // 生成简答题
    for (let i = 0; i < typeDistribution.essay; i++) {
      const difficultyLevel = this.getDifficultyForQuestion(difficulty, i, typeDistribution.essay);
      questions.push({
        id: `q${questionId++}`,
        type: 'ESSAY',
        question: this.generateEssayQuestion(topic, difficultyLevel, audience, i + 1, knowledgeAreas),
        options: [],
        correctAnswer: this.generateEssayAnswer(topic, difficultyLevel, knowledgeAreas),
        explanation: this.generateDetailedExplanation(topic, 'essay', difficultyLevel, knowledgeAreas),
        difficulty: difficultyLevel,
        knowledgePoints: this.getRelevantKnowledgePoints(topic, 'essay', i),
        cognitiveLevel: this.getCognitiveLevel('essay', difficultyLevel),
        estimatedTime: this.getEstimatedTime('essay', difficultyLevel),
        score: this.getQuestionScore('essay', difficultyLevel)
      });
    }

    const finalQuestions = questions.slice(0, count);
    
    // 添加元数据
    const metadata = {
      generatedAt: new Date().toISOString(),
      totalQuestions: finalQuestions.length,
      difficultyDistribution: this.calculateDifficultyDistribution(finalQuestions),
      typeDistribution: this.calculateTypeDistributionStats(finalQuestions),
      averageTime: this.calculateAverageTime(finalQuestions),
      totalScore: this.calculateTotalScore(finalQuestions)
    };

    return finalQuestions;
  }

  /**
   * 计算题型分布
   */
  calculateTypeDistribution(questionTypes, totalCount) {
    const types = questionTypes || ['single'];
    const distribution = { single: 0, multiple: 0, judge: 0, essay: 0 };
    
    const perType = Math.floor(totalCount / types.length);
    const remainder = totalCount % types.length;
    
    types.forEach((type, index) => {
      distribution[type] = perType + (index < remainder ? 1 : 0);
    });
    
    return distribution;
  }

  /**
   * 生成单选题题目
   */
  generateSingleChoiceQuestion(topic, difficulty, audience, index, knowledgeAreas) {
    const templates = {
      '简单': [
        `${topic}的基本定义是什么？`,
        `以下哪个是${topic}的主要特征？`,
        `${topic}最常用于哪个领域？`,
        `${topic}的起源可以追溯到？`,
        `在${topic}中，最基础的概念是？`
      ],
      '中等': [
        `在${topic}的应用中，以下哪种方法最有效？`,
        `关于${topic}的原理，以下哪个描述最准确？`,
        `${topic}与相关技术的主要区别在于？`,
        `实施${topic}时，首要考虑的因素是？`,
        `${topic}的核心算法/理论基础是？`,
        `在${topic}的发展历程中，重要的里程碑事件是？`
      ],
      '困难': [
        `在复杂的${topic}系统中，如何优化性能？`,
        `${topic}在大规模应用时面临的主要挑战是？`,
        `${topic}的高级应用技巧包括哪些方面？`,
        `当${topic}遇到特殊场景时，最佳的解决策略是？`,
        `${topic}与其他前沿技术结合的创新点在于？`,
        `评估${topic}系统效果的关键指标和方法是？`
      ]
    };
    
    const difficultyTemplates = templates[difficulty] || templates['中等'];
    const baseQuestion = difficultyTemplates[index % difficultyTemplates.length];
    
    // 根据知识领域进行个性化调整
    if (knowledgeAreas.length > 0) {
      const relevantArea = knowledgeAreas[index % knowledgeAreas.length];
      return baseQuestion.replace(topic, `${topic}(特别是${relevantArea}方面)`);
    }
    
    return baseQuestion;
  }

  /**
   * 生成多选题题目
   */
  generateMultipleChoiceQuestion(topic, difficulty, audience, index, knowledgeAreas) {
    const templates = {
      '简单': [
        `${topic}的主要组成部分包括哪些？（多选）`,
        `学习${topic}需要掌握的基础知识有？（多选）`,
        `${topic}的基本特征包括？（多选）`
      ],
      '中等': [
        `${topic}的主要优势包括哪些？（多选）`,
        `在学习${topic}时，需要掌握以下哪些知识点？（多选）`,
        `${topic}的应用场景包括？（多选）`,
        `${topic}的核心要素有哪些？（多选）`,
        `实践${topic}时，常见的方法论包括？（多选）`
      ],
      '困难': [
        `${topic}的发展趋势体现在哪些方面？（多选）`,
        `${topic}在跨领域应用中的关键技术点包括？（多选）`,
        `优化${topic}系统性能的策略有哪些？（多选）`,
        `评估${topic}项目成功的维度包括？（多选）`
      ]
    };
    
    const difficultyTemplates = templates[difficulty] || templates['中等'];
    return difficultyTemplates[index % difficultyTemplates.length];
  }

  /**
   * 生成判断题题目
   */
  generateTrueFalseQuestion(topic, difficulty, audience, index, knowledgeAreas) {
    const templates = {
      '简单': [
        `${topic}是现代技术发展的重要组成部分。`,
        `${topic}的学习需要具备扎实的理论基础。`,
        `${topic}在实际应用中具有广泛的适用性。`,
        `${topic}的概念最初由学者在20世纪提出。`
      ],
      '中等': [
        `${topic}的实现过程中，理论知识比实践经验更重要。`,
        `${topic}技术的发展将完全改变传统的工作模式。`,
        `在${topic}领域，国际标准的制定滞后于技术发展。`,
        `${topic}的应用成本在近年来呈现显著下降趋势。`
      ],
      '困难': [
        `${topic}的未来发展将主要依赖于跨学科的融合创新。`,
        `现有的${topic}评估体系已经能够满足所有应用场景的需求。`,
        `${topic}在伦理和隐私保护方面的挑战可以通过技术手段完全解决。`,
        `${topic}产业的成熟度已经达到了可以大规模标准化应用的阶段。`
      ]
    };
    
    const difficultyTemplates = templates[difficulty] || templates['中等'];
    return difficultyTemplates[index % difficultyTemplates.length];
  }

  /**
   * 生成简答题题目
   */
  generateEssayQuestion(topic, difficulty, audience, index, knowledgeAreas) {
    const templates = {
      '简单': [
        `请简述${topic}的基本概念和主要特点。（约150字）`,
        `举例说明${topic}在日常生活中的应用。（约120字）`,
        `概括${topic}的发展历程及重要节点。（约200字）`
      ],
      '中等': [
        `分析${topic}在实际应用中的优势和局限性。（约250字）`,
        `比较${topic}与相关技术的异同点。（约200字）`,
        `谈谈学习${topic}对个人或职业发展的意义。（约180字）`,
        `解释${topic}的核心原理及其实现机制。（约300字）`
      ],
      '困难': [
        `谈谈你对${topic}未来发展趋势的看法和预测。（约400字）`,
        `分析${topic}在跨领域应用中面临的挑战及解决思路。（约350字）`,
        `设计一个基于${topic}的创新应用方案。（约500字）`,
        `评估${topic}对社会、经济、文化的深层影响。（约450字）`
      ]
    };
    
    const difficultyTemplates = templates[difficulty] || templates['中等'];
    return difficultyTemplates[index % difficultyTemplates.length];
  }

  /**
   * 生成选项
   */
  generateOptions(topic, type, index, difficulty, knowledgeAreas) {
    if (type === 'single') {
      const optionSets = {
        '简单': [
          [`${topic}的核心概念`, `${topic}的扩展应用`, `${topic}的基础理论`, `${topic}的实践方法`],
          [`定义和分类`, `历史和发展`, `应用和实践`, `评估和改进`],
          [`基础知识`, `核心原理`, `实际案例`, `未来趋势`]
        ],
        '中等': [
          [`系统性方法论`, `渐进式改进策略`, `革命性创新思维`, `综合性解决方案`],
          [`理论完整性`, `实践可行性`, `经济效益性`, `技术先进性`],
          [`数据驱动分析`, `模型化设计`, `算法优化`, `系统集成`]
        ],
        '困难': [
          [`多维度综合评估体系`, `动态适应性调整机制`, `跨领域协同优化策略`, `预测性维护框架`],
          [`认知负荷理论`, `系统复杂性管理`, `涌现性效应利用`, `递归式优化算法`],
          [`量化风险评估模型`, `多目标优化算法`, `自适应学习机制`, `鲁棒性设计原则`]
        ]
      };
      
      const options = optionSets[difficulty] || optionSets['中等'];
      return options[index % options.length];
    } 
    
    else if (type === 'multiple') {
      const optionSets = {
        '简单': [
          [`便于理解和学习`, `应用范围广泛`, `成本相对较低`, `技术门槛不高`],
          [`基础性强`, `实用性好`, `可扩展性强`, `易于维护`]
        ],
        '中等': [
          [`高效性和可靠性`, `经济性和可持续性`, `灵活性和扩展性`, `安全性和稳定性`],
          [`理论基础扎实`, `实践案例丰富`, `工具支持完善`, `社区生态活跃`]
        ],
        '困难': [
          [`多层次架构设计`, `智能化决策支持`, `自适应性能优化`, `前瞻性风险防控`],
          [`跨平台兼容性`, `大规模并发处理`, `实时性能监控`, `智能故障恢复`]
        ]
      };
      
      const options = optionSets[difficulty] || optionSets['中等'];
      return options[index % options.length];
    }
    
    return [];
  }

  /**
   * 生成详细解析
   */
  generateDetailedExplanation(topic, type, difficulty, knowledgeAreas) {
    const explanationTemplates = {
      'single': {
        '简单': `这是关于${topic}的基础概念题。正确答案基于${topic}的核心定义和基本特征。建议重点掌握${topic}的基本概念、主要特点和应用领域。`,
        '中等': `这道题考查${topic}的原理理解和应用能力。正确答案需要综合考虑${topic}的理论基础、实践方法和应用场景。解题关键在于理解概念间的内在联系。`,
        '困难': `这是${topic}的综合应用题，需要运用高阶思维进行分析。正确答案体现了${topic}在复杂环境下的应用策略，要求学习者具备系统性思维和创新能力。`
      },
      'multiple': {
        '简单': `这是${topic}的多选基础题。正确答案涵盖了${topic}的主要组成要素。解题时需要逐项分析每个选项与题目要求的匹配度，避免遗漏关键信息。`,
        '中等': `这道多选题考查${topic}的综合特征识别。正确答案需要从多个维度理解${topic}的特点和价值。建议采用排除法和归纳法相结合的解题策略。`,
        '困难': `这是${topic}的高阶综合题，考查多维度分析能力。正确答案体现了${topic}的复杂性和多面性，需要运用批判性思维进行深度分析和价值判断。`
      },
      'judge': {
        '简单': `这是${topic}的基础判断题。判断依据是${topic}的基本事实和普遍认知。正确理解题目陈述的逻辑关系和事实依据是解题的关键。`,
        '中等': `这道判断题涉及${topic}的深层理解。需要结合理论知识和实践经验进行综合判断。建议分析陈述的前提条件、逻辑链条和结论的合理性。`,
        '困难': `这是${topic}的复杂判断题，涉及多重因素和条件限制。正确答案需要考虑情境的复杂性、发展的动态性和认知的局限性。`
      },
      'essay': {
        '简单': `这是${topic}的基础概述题。答题要点应包括：基本定义、主要特征、典型应用。回答要条理清晰，逻辑严密，举例恰当。`,
        '中等': `这是${topic}的分析论述题。答题要点应包括：理论分析、实践验证、比较评价、个人见解。要求论证充分，分析深入，具有说服力。`,
        '困难': `这是${topic}的综合创新题。答题要点应包括：现状分析、问题识别、解决方案、预期效果、创新价值。要求思维开阔，分析深刻，具有前瞻性。`
      }
    };
    
    const templates = explanationTemplates[type] || explanationTemplates['single'];
    const template = templates[difficulty] || templates['中等'];
    
    // 根据知识领域进行个性化补充
    if (knowledgeAreas.length > 0) {
      const relevantArea = knowledgeAreas[0];
      return `${template} 特别需要关注${relevantArea}相关的理论知识和实践方法。`;
    }
    
    return template;
  }

  /**
   * 生成简答题答案
   */
  generateEssayAnswer(topic, difficulty, knowledgeAreas) {
    const answerTemplates = {
      '简单': `${topic}的基本概念包括：[核心定义]、[主要特征]、[应用范围]。主要特点体现在：[特点1]、[特点2]、[特点3]。实际应用案例：[案例描述]。`,
      '中等': `${topic}的优势：[优势分析]；局限性：[局限性分析]；解决策略：[改进方法]。综合评价：[客观评述]。发展建议：[具体建议]。`,
      '困难': `现状分析：[深度分析]；发展趋势：[趋势预测]；创新方向：[创新思路]；实施策略：[具体方案]；预期效果：[效果评估]。`
    };
    
    return answerTemplates[difficulty] || answerTemplates['中等'];
  }

  // ========== 新增辅助方法 ==========

  /**
   * 提取知识领域
   */
  extractKnowledgeAreas(topic, subjects) {
    if (!subjects) return [topic];
    
    const areas = subjects.split(/[,，、\s]+/).filter(area => area.trim().length > 0);
    return areas.length > 0 ? areas : [topic];
  }

  /**
   * 为题目分配难度
   */
  getDifficultyForQuestion(baseDifficulty, questionIndex, totalQuestions) {
    if (baseDifficulty === '混合') {
      const difficulties = ['简单', '中等', '困难'];
      if (totalQuestions <= 3) {
        return difficulties[questionIndex % 3];
      } else {
        // 按比例分配：40% 简单，40% 中等，20% 困难
        const ratio = questionIndex / totalQuestions;
        if (ratio < 0.4) return '简单';
        else if (ratio < 0.8) return '中等';
        else return '困难';
      }
    }
    return baseDifficulty;
  }

  /**
   * 获取相关知识点
   */
  getRelevantKnowledgePoints(topic, type, index) {
    const knowledgePoints = [
      `${topic}基础理论`,
      `${topic}核心原理`,
      `${topic}实践应用`,
      `${topic}发展趋势`,
      `${topic}评估方法`
    ];
    
    // 根据题型和索引返回相关知识点
    const startIndex = (index * 2) % knowledgePoints.length;
    return knowledgePoints.slice(startIndex, startIndex + 2);
  }

  /**
   * 获取认知层次
   */
  getCognitiveLevel(type, difficulty) {
    const levelMap = {
      'single': {
        '简单': '记忆',
        '中等': '理解',
        '困难': '应用'
      },
      'multiple': {
        '简单': '理解',
        '中等': '应用',
        '困难': '分析'
      },
      'judge': {
        '简单': '记忆',
        '中等': '理解',
        '困难': '评价'
      },
      'essay': {
        '简单': '理解',
        '中等': '分析',
        '困难': '综合'
      }
    };
    
    return levelMap[type]?.[difficulty] || '理解';
  }

  /**
   * 获取预计答题时间
   */
  getEstimatedTime(type, difficulty) {
    const timeMap = {
      'single': { '简单': 1, '中等': 2, '困难': 3 },
      'multiple': { '简单': 2, '中等': 3, '困难': 4 },
      'judge': { '简单': 1, '中等': 1.5, '困难': 2 },
      'essay': { '简单': 5, '中等': 8, '困难': 12 }
    };
    
    return timeMap[type]?.[difficulty] || 2;
  }

  /**
   * 获取题目分值
   */
  getQuestionScore(type, difficulty) {
    const scoreMap = {
      'single': { '简单': 5, '中等': 8, '困难': 12 },
      'multiple': { '简单': 8, '中等': 12, '困难': 18 },
      'judge': { '简单': 4, '中等': 6, '困难': 10 },
      'essay': { '简单': 15, '中等': 20, '困难': 30 }
    };
    
    return scoreMap[type]?.[difficulty] || 10;
  }

  /**
   * 计算难度分布
   */
  calculateDifficultyDistribution(questions) {
    const distribution = { '简单': 0, '中等': 0, '困难': 0 };
    questions.forEach(q => {
      distribution[q.difficulty] = (distribution[q.difficulty] || 0) + 1;
    });
    return distribution;
  }

  /**
   * 计算题型分布统计
   */
  calculateTypeDistributionStats(questions) {
    const distribution = {};
    questions.forEach(q => {
      const type = q.type.replace('_', '');
      distribution[type] = (distribution[type] || 0) + 1;
    });
    return distribution;
  }

  /**
   * 计算平均答题时间
   */
  calculateAverageTime(questions) {
    const totalTime = questions.reduce((sum, q) => sum + (q.estimatedTime || 2), 0);
    return `${totalTime}分钟`;
  }

  /**
   * 计算总分值
   */
  calculateTotalScore(questions) {
    return questions.reduce((sum, q) => sum + (q.score || 10), 0);
  }

  /**
   * 生成作业模板
   * @param {Object} params - 作业参数
   * @returns {Promise<Object>} 生成的作业模板
   */
  async generateHomeworkTemplate(params) {
    console.log('\n=== AgentService.generateHomeworkTemplate 调用 ===');
    console.log('时间:', new Date().toISOString());
    console.log('输入参数:', JSON.stringify(params, null, 2));
    
    try {
      const { topic, type } = params;

      // 构建prompt
      const prompt = `
请为"${topic}"主题生成一个${type}作业模板，包括以下内容：

1. 作业标题和描述
2. 详细的作业要求
3. 评分标准
4. 截止时间建议
5. 参考资源

请以JSON格式返回结果：
{
  "title": "作业标题",
  "description": "详细描述",
  "requirements": ["要求1", "要求2", "要求3"],
  "deadline": "建议截止时间",
  "grading": "评分标准",
  "resources": ["参考资源1", "参考资源2"]
}
      `.trim();

      // 调用豆包API生成作业模板
      console.log('开始调用豆包API生成作业模板...');
      
      const systemPrompt = `你是一位经验丰富的教育专家。

【重要】你必须严格按照以下要求返回数据：

0. 全部回答只使用英文，不使用任何中文
1. 只返回纯JSON格式数据，不要有任何其他文字说明
2. JSON必须包含以下字段：
   - title: 作业标题（字符串）
   - description: 作业描述（字符串）
   - requirements: 作业要求（字符串数组）
   - deadline: 建议截止时间（字符串）
   - grading: 评分标准（字符串）
   - resources: 参考资源（字符串数组）

3. 返回格式示例：
{
  "title": "作业标题",
  "description": "详细的作业描述",
  "requirements": ["要求1", "要求2", "要求3"],
  "deadline": "7天后",
  "grading": "评分标准说明",
  "resources": ["资源1", "资源2"]
}

请直接返回上述格式的JSON数据，不要包含\`\`\`json标记或其他说明文字。`;
      
      try {
        const aiResponse = await getDoubaoResponse(systemPrompt, prompt);
        console.log('豆包API响应成功，开始解析返回内容...');
        
        // 尝试解析JSON响应
        let parsedResponse;
        try {
          const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
          const jsonContent = jsonMatch ? jsonMatch[1] : aiResponse;
          
          parsedResponse = JSON.parse(jsonContent);
          
          const result = {
            success: true,
            data: {
              title: parsedResponse.title || `${topic} - ${type}作业`,
              description: parsedResponse.description || `请完成以下${type}相关的作业任务...`,
              requirements: parsedResponse.requirements || [
                '按时提交',
                '格式规范',
                '内容完整',
                '独立完成'
              ],
              deadline: parsedResponse.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              grading: parsedResponse.grading || '根据完成度、准确性、创新性评分',
              resources: parsedResponse.resources || []
            }
          };

          console.log('作业模板生成成功（通过豆包API）');
          console.log('作业标题:', result.data.title);
          console.log('作业类型:', type);
          console.log('作业要求数量:', result.data.requirements.length);
          console.log('截止日期:', result.data.deadline);
          console.log('=== AgentService.generateHomeworkTemplate 调用结束 ===\n');

          return result;
          
        } catch (parseError) {
          console.error('JSON解析失败:', parseError.message);
          throw new Error('AI返回内容解析失败');
        }
        
      } catch (aiError) {
        console.error('豆包API调用失败:', aiError.message);
        console.log('回退到本地生成模式...');
        
        // 回退到默认生成
        const result = {
          success: true,
          data: {
            title: `${topic} - ${type}作业`,
            description: `请完成以下${type}相关的作业任务...`,
            requirements: [
              '按时提交',
              '格式规范',
              '内容完整',
              '独立完成'
            ],
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          fallback: true,
          message: '使用本地生成模式，因为AI服务暂时不可用'
        };

        console.log('作业模板生成成功（回退模式）');
        console.log('作业标题:', result.data.title);
        console.log('作业类型:', type);
        console.log('作业要求数量:', result.data.requirements.length);
        console.log('截止日期:', result.data.deadline);
        console.log('=== AgentService.generateHomeworkTemplate 调用结束 ===\n');

        return result;
      }
    } catch (error) {
      console.error('=== AgentService.generateHomeworkTemplate 调用失败 ===');
      console.error('错误信息:', error.message);
      console.error('错误堆栈:', error.stack);
      console.error('=== AgentService.generateHomeworkTemplate 调用失败结束 ===\n');
      throw new Error('作业模板生成失败');
    }
  }

  /**
   * 推荐教学资源
   * @param {Object} params - 资源参数
   * @returns {Promise<Array>} 推荐的资源列表
   */
  async recommendResources(params) {
    console.log('\n=== AgentService.recommendResources 调用 ===');
    console.log('时间:', new Date().toISOString());
    console.log('输入参数:', JSON.stringify(params, null, 2));
    
    try {
      const { topic, type } = params;

      // 构建prompt
      const prompt = `
请为"${topic}"主题推荐相关的教学资源，类型：${type === 'all' ? '全部类型' : type}

请推荐以下类型的资源：
1. 文档类资源（PDF、Word等）
2. 视频教程
3. 在线课程
4. 实践项目
5. 参考书籍

请以JSON格式返回结果：
{
  "resources": [
    {
      "name": "资源名称",
      "type": "pdf|video|doc|course|book",
      "url": "资源链接或获取方式",
      "description": "资源描述",
      "difficulty": "初级|中级|高级",
      "language": "中文|英文"
    }
  ]
}
      `.trim();

      // 调用豆包API生成资源推荐
      console.log('开始调用豆包API生成资源推荐...');
      
      const systemPrompt = `你是一位经验丰富的教育资源专家。

【重要】你必须严格按照以下要求返回数据：

0. 全部回答只使用英文，不使用任何中文
1. 只返回纯JSON格式数据，不要有任何其他文字说明
2. JSON必须包含顶层的resources数组
3. 每个资源对象必须包含以下字段：
   - name: 资源名称（字符串）
   - type: 资源类型（字符串，必须是：pdf、video、doc、course、book之一）
   - url: 资源链接（字符串）
   - description: 资源描述（字符串）
   - difficulty: 难度（字符串）
   - language: 语言（字符串）

4. 返回格式示例：
{
  "resources": [
    {
      "name": "资源名称",
      "type": "pdf",
      "url": "https://example.com/resource.pdf",
      "description": "资源描述",
      "difficulty": "初级",
      "language": "中文"
    }
  ]
}

请直接返回上述格式的JSON数据，不要包含\`\`\`json标记或其他说明文字。`;
      
      try {
        const aiResponse = await getDoubaoResponse(systemPrompt, prompt);
        console.log('豆包API响应成功，开始解析返回内容...');
        
        // 尝试解析JSON响应
        let parsedResponse;
        try {
          const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
          const jsonContent = jsonMatch ? jsonMatch[1] : aiResponse;
          
          parsedResponse = JSON.parse(jsonContent);
          
          const resourcesData = parsedResponse.resources || this.generateResources(topic, type);
          const result = {
            success: true,
            data: resourcesData
          };

          console.log('教学资源推荐成功（通过豆包API）');
          console.log('推荐主题:', topic);
          console.log('资源类型:', type);
          console.log('推荐资源数量:', resourcesData.length);
          console.log('资源类型分布:');
          const typeDistribution = resourcesData.reduce((acc, resource) => {
            acc[resource.type] = (acc[resource.type] || 0) + 1;
            return acc;
          }, {});
          console.log('  ', typeDistribution);
          console.log('=== AgentService.recommendResources 调用结束 ===\n');

          return result;
          
        } catch (parseError) {
          console.error('JSON解析失败:', parseError.message);
          throw new Error('AI返回内容解析失败');
        }
        
      } catch (aiError) {
        console.error('豆包API调用失败:', aiError.message);
        console.log('回退到本地生成模式...');
        
        // 回退到默认生成
        const resourcesData = this.generateResources(topic, type);
        const result = {
          success: true,
          data: resourcesData,
          fallback: true,
          message: '使用本地生成模式，因为AI服务暂时不可用'
        };

        console.log('教学资源推荐成功（回退模式）');
        console.log('推荐主题:', topic);
        console.log('资源类型:', type);
        console.log('推荐资源数量:', resourcesData.length);
        console.log('资源类型分布:');
        const typeDistribution = resourcesData.reduce((acc, resource) => {
          acc[resource.type] = (acc[resource.type] || 0) + 1;
          return acc;
        }, {});
        console.log('  ', typeDistribution);
        console.log('=== AgentService.recommendResources 调用结束 ===\n');

        return result;
      }
    } catch (error) {
      console.error('=== AgentService.recommendResources 调用失败 ===');
      console.error('错误信息:', error.message);
      console.error('错误堆栈:', error.stack);
      console.error('=== AgentService.recommendResources 调用失败结束 ===\n');
      throw new Error('资源推荐失败');
    }
  }

  // ========== 辅助方法 ==========

  /**
   * 映射题型类型
   * @param {string} type - 题型
   * @returns {string} 映射后的题型
   */
  mapQuestionType(type) {
    const typeMap = {
      'SINGLE_CHOICE': 'SINGLE_CHOICE',
      'MULTIPLE_CHOICE': 'MULTIPLE_CHOICE',
      'TRUE_FALSE': 'TRUE_FALSE',
      'ESSAY': 'ESSAY',
      'single': 'SINGLE_CHOICE',
      'multiple': 'MULTIPLE_CHOICE',
      'judge': 'TRUE_FALSE',
      'essay': 'ESSAY',
      '单选': 'SINGLE_CHOICE',
      '多选': 'MULTIPLE_CHOICE',
      '判断': 'TRUE_FALSE',
      '简答': 'ESSAY'
    };
    
    return typeMap[type] || type;
  }

  generateMockOutline(topic, weeks) {
    const outline = [];
    for (let i = 1; i <= weeks; i++) {
      outline.push({
        week: i,
        title: `第${i}周: ${topic}基础知识${i}`,
        content: `本周学习${topic}的核心概念和基本原理`,
        keyPoints: ['知识点1', '知识点2', '知识点3']
      });
    }
    return outline;
  }

  generateLearningObjectives(topic) {
    return [
      `掌握${topic}的基本概念和原理`,
      `能够运用${topic}解决实际问题`,
      `理解${topic}的应用场景和最佳实践`,
      `具备${topic}项目开发能力`
    ];
  }

  generateResources(topic, type = 'all') {
    const resources = [
      {
        name: `${topic}入门教程`,
        type: 'pdf',
        url: 'https://example.com/tutorial.pdf',
        description: '适合初学者的入门教程'
      },
      {
        name: `${topic}实战视频`,
        type: 'video',
        url: 'https://example.com/video.mp4',
        description: '实战案例讲解视频'
      },
      {
        name: `${topic}参考手册`,
        type: 'doc',
        url: 'https://example.com/manual.doc',
        description: '详细的参考文档'
      }
    ];

    if (type !== 'all') {
      return resources.filter(r => r.type === type);
    }

    return resources;
  }

  generateQuizTopics(topic) {
    return [
      `${topic}基础概念测验`,
      `${topic}核心原理理解`,
      `${topic}实践应用能力`,
      `${topic}综合知识测试`,
      `${topic}案例分析题`
    ];
  }

  generateAssignments(topic) {
    return [
      `完成${topic}的基础练习题，巩固核心概念`,
      `设计一个${topic}相关的小型项目，应用所学知识`,
      `分析和研究${topic}的实际应用案例，撰写分析报告`,
      `完成${topic}的综合实践任务，提交项目代码和文档`
    ];
  }
}

module.exports = new AgentService();

