const axios = require('axios');

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

      // 模拟API调用 (实际应调用Dify API)
      const mockResponse = {
        success: true,
        data: {
          courseTitle: topic,
          weeks: parseInt(weeks),
          level: level,
          outline: this.generateMockOutline(topic, weeks),
          learningObjectives: this.generateLearningObjectives(topic),
          resources: this.generateResources(topic)
        }
      };

      // 实际API调用代码 (需要配置DIFY_API_KEY)
      /*
      const response = await axios.post(
        `${this.apiUrl}/chat-messages`,
        {
          inputs: { topic, outline, weeks, level },
          query: prompt,
          response_mode: 'blocking',
          user: 'system'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
      */

      return mockResponse;
    } catch (error) {
      console.error('Agent API调用失败:', error.message);
      throw new Error('课程内容生成失败');
    }
  }

  /**
   * 生成Quiz题目
   * @param {Object} params - Quiz参数
   * @param {string} params.topic - 主题
   * @param {number} params.count - 题目数量
   * @param {string} params.difficulty - 难度
   * @returns {Promise<Array>} 生成的题目列表
   */
  async generateQuizQuestions(params) {
    try {
      const { topic, count, difficulty } = params;

      // 模拟生成Quiz题目
      const questions = [];
      for (let i = 0; i < count; i++) {
        questions.push({
          id: `q${i + 1}`,
          type: ['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE'][Math.floor(Math.random() * 3)],
          question: `关于${topic}的问题 ${i + 1}`,
          options: ['选项A', '选项B', '选项C', '选项D'],
          answer: 'A',
          difficulty: difficulty
        });
      }

      return {
        success: true,
        data: questions
      };
    } catch (error) {
      console.error('Quiz生成失败:', error.message);
      throw new Error('Quiz题目生成失败');
    }
  }

  /**
   * 生成作业模板
   * @param {Object} params - 作业参数
   * @returns {Promise<Object>} 生成的作业模板
   */
  async generateHomeworkTemplate(params) {
    try {
      const { topic, type } = params;

      return {
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
        }
      };
    } catch (error) {
      console.error('作业模板生成失败:', error.message);
      throw new Error('作业模板生成失败');
    }
  }

  /**
   * 推荐教学资源
   * @param {Object} params - 资源参数
   * @returns {Promise<Array>} 推荐的资源列表
   */
  async recommendResources(params) {
    try {
      const { topic, type } = params;

      return {
        success: true,
        data: this.generateResources(topic, type)
      };
    } catch (error) {
      console.error('资源推荐失败:', error.message);
      throw new Error('资源推荐失败');
    }
  }

  // ========== 辅助方法 ==========

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
}

module.exports = new AgentService();

