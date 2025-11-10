# AI助手使用说明

## 功能概述

项目现已集成豆包AI助手功能，支持智能对话交互。学生和教师可以通过AI助手获得学习和教学方面的帮助。

## 访问方式

### 1. 前端界面访问

在主应用中，点击左侧导航菜单中的"AI Assistant"（AI助手）即可进入聊天界面。

**访问路径**: `/course/ai-chat`

### 2. API接口调用

**接口地址**: `POST /api/ai/chat`

**请求格式**:
```json
{
  "system": "你是一个友善的教学助手",
  "user": "用户的问题"
}
```

**响应格式**:
```json
{
  "ok": true,
  "data": {
    "response": "AI的回复内容"
  }
}
```

## 配置说明

### 环境变量

在`.env`文件中配置以下参数：

```env
# 豆包AI配置
DOUBAO_API_KEY="your-api-key-here"
DOUBAO_BASE_URL="https://ark.cn-beijing.volces.com/api/v3"
DOUBAO_MODEL="doubao-1-5-lite-32k-250115"
```

### API密钥获取

1. 访问火山引擎控制台
2. 开通豆包大模型服务
3. 创建API密钥
4. 配置到环境变量中

## 使用示例

### 前端使用

```javascript
// 发送消息到AI助手
const sendMessage = async (systemPrompt, userMessage) => {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      system: systemPrompt,
      user: userMessage
    })
  });
  
  const data = await response.json();
  return data.data.response;
};
```

### 后端API测试

```bash
# 使用curl测试
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "system": "你是一个友善的教学助手",
    "user": "请介绍一下机器学习的基本概念"
  }'
```

## 应用场景

### 1. 学习辅导

- **答疑解惑**: 学生可以向AI助手提问学习中遇到的问题
- **知识点解释**: 获得概念和原理的详细解释
- **学习建议**: 获取个性化的学习方法建议

### 2. 教学支持

- **教案设计**: 教师可以请AI助手协助设计教学内容
- **题目生成**: 自动生成练习题和测验题目
- **教学策略**: 获得教学方法和策略建议

### 3. 内容创作

- **课程大纲**: 生成课程结构和大纲
- **资料整理**: 协助整理和总结学习资料
- **报告撰写**: 辅助撰写学习报告和总结

## 界面特性

### 1. 聊天界面

- **消息气泡**: 清晰区分用户消息和AI回复
- **实时滚动**: 自动滚动到最新消息
- **加载提示**: 显示AI思考状态

### 2. 角色设定

- **自定义角色**: 可以自定义AI助手的角色和行为
- **系统提示词**: 支持设置详细的系统指令
- **多场景适配**: 适应不同的使用场景

### 3. 交互体验

- **快捷发送**: 支持回车键快速发送
- **消息历史**: 保留聊天历史记录
- **清空功能**: 一键清空聊天记录

## 技术实现

### 1. 后端架构

```
用户请求 → Express路由 → doubao_api.js → 豆包AI API → 返回结果
```

### 2. 前端组件

- **AIChat.jsx**: 主聊天组件
- **消息管理**: 状态管理和UI渲染
- **API调用**: 前后端通信

### 3. 错误处理

- **网络错误**: 自动重试和错误提示
- **API限制**: 速率限制和异常处理
- **用户体验**: 友好的错误信息

## 注意事项

1. **API密钥安全**: 请妥善保管API密钥，不要提交到版本控制
2. **使用限制**: 注意API调用频率和费用限制
3. **内容过滤**: AI回复内容可能需要进一步过滤
4. **隐私保护**: 避免发送敏感个人信息

## 故障排除

### 常见问题

**1. API调用失败**
- 检查API密钥是否正确
- 确认网络连接正常
- 查看服务器日志

**2. 响应缓慢**
- 检查网络延迟
- 确认API服务状态
- 调整超时设置

**3. 前端无法访问**
- 确认路由配置正确
- 检查组件导入路径
- 验证API代理设置

### 调试方法

```bash
# 检查API健康状态
curl http://localhost:3001/health

# 测试AI接口
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"system": "测试", "user": "你好"}'

# 查看服务器日志
npm run server:dev
```

## 更新日志

- **v2.1.0**: 集成豆包AI助手功能
- **特性**: 智能对话、角色定制、实时响应
- **API**: 新增 `/api/ai/chat` 接口
- **UI**: 新增AI助手聊天界面

---

更多技术细节请参考项目文档和源代码。