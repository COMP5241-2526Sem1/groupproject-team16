const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.DOUBAO_API_KEY || "804d1fe1-4b03-4483-9220-ccdfbffbeffd",
  baseURL: process.env.DOUBAO_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3',
});

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
  console.log('模型:', process.env.DOUBAO_MODEL || 'doubao-seed-1-6-flash-250828');
  console.log('系统提示词长度:', systemPrompt?.length || 0);
  console.log('用户输入长度:', userPrompt?.length || 0);
  console.log('系统提示词预览:', systemPrompt?.substring(0, 200) + (systemPrompt?.length > 200 ? '...' : ''));
  console.log('用户输入预览:', userPrompt?.substring(0, 200) + (userPrompt?.length > 200 ? '...' : ''));
  
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: process.env.DOUBAO_MODEL || 'doubao-seed-1-6-flash-250828',
      max_tokens: 2500,
     // temperature: 0.7
        extra_body: {
            "thinking": {
                "type": "disabled"  // 关闭深度思考能力
        }
  }
    });
    
    const response = completion.choices[0]?.message?.content || '抱歉，未能生成回复';
    
    // 打印返回结果
    console.log('API调用成功!');
    console.log('返回内容长度:', response.length);
    console.log('返回内容预览:', response.substring(0, 300) + (response.length > 300 ? '...' : ''));
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