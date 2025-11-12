const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.DOUBAO_API_KEY || "804d1fe1-4b03-4483-9220-ccdfbffbeffd",
  baseURL: process.env.DOUBAO_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3',
  timeout: 50000, // 50 seconds timeout to stay within Vercel's 60s limit
  maxRetries: 0, // Disable retries to prevent additional delays
});

/**
 * ========== 豆包API使用说明 ==========
 * 
 * 本API通过两个提示词参数调用豆包AI模型：
 * 1. systemPrompt（系统提示词）：定义AI的角色和行为规范
 * 2. userPrompt（用户提示词）：具体的任务需求和输入内容
 * 
 * ===== 返回格式要求 =====
 * 
 * AI应该返回标准的JSON格式数据，有两种返回方式：
 * 
 * 方式1：纯JSON字符串（推荐）
 * {"questions": [{"id": "q1", "type": "SINGLE_CHOICE", "question": "题目内容", ...}]}
 * 
 * 方式2：Markdown代码块包裹的JSON
 * ```json
 * {"questions": [{"id": "q1", "type": "SINGLE_CHOICE", "question": "题目内容", ...}]}
 * ```
 * 
 * 后端会自动提取```json标记中的内容并解析。
 * 
 * ===== 示例1：生成Quiz题目 =====
 * 
 * systemPrompt示例：
 * "你是一位经验丰富的教育测评专家和题库设计师。请严格按照要求生成高质量的测验题目，
 *  并以JSON格式返回。确保返回的是有效的JSON数据，包含questions数组和metadata对象。"
 * 
 * userPrompt示例：
 * "你是一位经验丰富的教育测评专家，请为"机器学习"主题设计5道高质量的测验题目。
 *  
 *  ## 目标设定
 *  - 🎯 目标受众: 大学生
 *  - 📊 难度级别: 中等
 *  - 📚 涉及知识点: 监督学习、神经网络
 *  - 📝 题型分布: 单选题、多选题
 *  
 *  ## 输出格式
 *  请严格按照以下JSON格式返回：
 *  ```json
 *  {
 *    "questions": [
 *      {
 *        "id": "q1",
 *        "type": "SINGLE_CHOICE",
 *        "question": "题目内容",
 *        "options": ["选项A", "选项B", "选项C", "选项D"],
 *        "correctAnswer": "A",
 *        "explanation": "详细的答案解析",
 *        "difficulty": "中等",
 *        "knowledgePoints": ["知识点1", "知识点2"],
 *        "cognitiveLevel": "理解",
 *        "estimatedTime": 2,
 *        "score": 10
 *      }
 *    ]
 *  }
 *  ```
 * "
 * 
 * 期望返回：
 * ```json
 * {
 *   "questions": [
 *     {
 *       "id": "q1",
 *       "type": "SINGLE_CHOICE",
 *       "question": "在机器学习中，监督学习的核心特点是什么？",
 *       "options": [
 *         "使用有标签的训练数据",
 *         "无需任何训练数据",
 *         "只能用于图像识别",
 *         "不需要验证集"
 *       ],
 *       "correctAnswer": "A",
 *       "explanation": "监督学习的核心特点是使用有标签的训练数据进行模型训练...",
 *       "difficulty": "中等",
 *       "knowledgePoints": ["监督学习", "训练数据"],
 *       "cognitiveLevel": "理解",
 *       "estimatedTime": 2,
 *       "score": 10
 *     }
 *   ]
 * }
 * ```
 * 
 * ===== 示例2：生成课程大纲 =====
 * 
 * systemPrompt示例：
 * "你是一位经验丰富的教育专家和课程设计师。请根据用户提供的信息生成完整的课程大纲，
 *  并以JSON格式返回。确保返回的是有效的JSON数据。"
 * 
 * userPrompt示例：
 * "请根据以下信息生成一个完整的课程大纲:
 *  课程主题: Python编程
 *  知识点大纲: 基础语法、数据结构、面向对象
 *  课程周数: 12周
 *  难度级别: 初级
 *  
 *  请以JSON格式返回结果。"
 * 
 * 期望返回（需包含courseTitle, weeks, level, outline等字段）：
 * ```json
 * {
 *   "courseTitle": "Python编程基础",
 *   "weeks": 12,
 *   "level": "初级",
 *   "outline": [
 *     {
 *       "week": 1,
 *       "title": "第1周: Python环境搭建与基础语法",
 *       "content": "学习Python环境配置和基本语法规则",
 *       "keyPoints": ["安装配置", "变量类型", "运算符"]
 *     }
 *   ],
 *   "learningObjectives": [
 *     "掌握Python基本语法",
 *     "理解面向对象编程"
 *   ],
 *   "resources": [
 *     {
 *       "name": "Python官方文档",
 *       "type": "doc",
 *       "url": "https://docs.python.org"
 *     }
 *   ]
 * }
 * ```
 * 
 * ===== 后端解析逻辑 =====
 * 
 * 1. 接收AI返回的字符串响应
 * 2. 检测是否包含```json标记：
 *    - 如果有：使用正则提取标记内的JSON内容
 *    - 如果没有：直接尝试解析整个字符串
 * 3. 使用JSON.parse()解析为JavaScript对象
 * 4. 验证必需字段是否存在（如questions数组）
 * 5. 如果解析失败，抛出错误或回退到本地生成模式
 * 
 * 解析代码示例：
 * ```javascript
 * const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
 * const jsonContent = jsonMatch ? jsonMatch[1] : aiResponse;
 * const parsedResponse = JSON.parse(jsonContent);
 * ```
 * 
 * ========== 使用建议 ==========
 * 
 * 1. systemPrompt应该清晰定义AI的角色和返回格式要求
 * 2. userPrompt应该包含详细的任务描述和格式示例
 * 3. 在prompt中明确说明"以JSON格式返回"
 * 4. 提供完整的JSON结构示例，让AI理解期望的格式
 * 5. 确保返回的JSON结构与前端或后续处理逻辑匹配
 * 
 * ======================================
 */

/**
 * 调用豆包AI API获取回复
 * @param {string} systemPrompt - 系统提示词
 * @param {string} userPrompt - 用户输入
 * @returns {Promise<string>} AI生成的回复
 */
async function getDoubaoResponse(systemPrompt, userPrompt) {
  // 打印请求参数
  console.log('\n=== 豆包API调用 ===');
  console.log('时间:', new Date().toISOString());
  console.log('模型:','doubao-seed-1-6-lite-251015');
  console.log('系统提示词长度:', systemPrompt?.length || 0);
  console.log('用户输入长度:', userPrompt?.length || 0);
  console.log('系统提示词预览:', systemPrompt);
  console.log('用户输入预览:', userPrompt);
  
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model:'doubao-seed-1-6-lite-251015',
      //max_tokens: 2000,
      max_completion_tokens: 2000,
      temperature: 0.1,
    "thinking":{"type":"disabled"},
     "reasoning_effort": "minimal"  
    });
    
    const response = completion.choices[0]?.message?.content || '抱歉，未能生成回复';
    
    // 打印返回结果
    console.log('API调用成功!');
    console.log('返回内容长度:', response.length);
    console.log('返回内容预览:', response);
    console.log('Token使用情况:', completion.usage || '未提供');
    console.log('=== 豆包API调用结束 ===\n');
    
    return response;
  } catch (error) {
    console.error('=== 豆包API调用失败 ===');
    console.error('错误类型:', error.constructor.name);
    console.error('错误信息:', error.message);
    console.error('错误详情:', error);
    console.error('=== 豆包API调用失败结束 ===\n');
    throw new Error('AI服务调用失败: ' + (error.message || '未知错误'));
  }
}

module.exports = getDoubaoResponse;
