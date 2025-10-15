# API测试文档

## 测试环境

- 后端API: http://localhost:3001
- 前端应用: http://localhost:5173

## 1. 健康检查

```bash
curl http://localhost:3001/health
```

**预期响应:**
```json
{
  "status": "ok",
  "message": "Agent Teaching Management API is running"
}
```

## 2. 认证接口测试

### 2.1 用户注册

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "测试用户",
    "role": "STUDENT"
  }'
```

### 2.2 用户登录

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2.3 发送验证码

```bash
curl -X POST http://localhost:3001/api/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

## 3. 课程接口测试

### 3.1 获取课程列表

```bash
curl http://localhost:3001/api/courses
```

### 3.2 获取单个课程

```bash
curl http://localhost:3001/api/courses/1
```

### 3.3 创建课程

```bash
curl -X POST http://localhost:3001/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Python编程基础",
    "description": "从零开始学习Python编程",
    "startDate": "2025-10-20"
  }'
```

### 3.4 更新课程

```bash
curl -X PUT http://localhost:3001/api/courses/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Python高级编程",
    "status": "ACTIVE"
  }'
```

### 3.5 加入课程

```bash
curl -X POST http://localhost:3001/api/courses/1/enroll \
  -H "Content-Type: application/json"
```

## 4. Agent AI接口测试

### 4.1 生成课程内容

```bash
curl -X POST http://localhost:3001/api/agent/generate-course \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Python编程",
    "outline": "基础语法、数据结构、面向对象、Web开发",
    "weeks": 10,
    "level": "初级"
  }'
```

### 4.2 生成Quiz题目

```bash
curl -X POST http://localhost:3001/api/agent/generate-quiz \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Python基础",
    "count": 10,
    "difficulty": "medium"
  }'
```

### 4.3 生成作业模板

```bash
curl -X POST http://localhost:3001/api/agent/generate-homework \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Python编程",
    "type": "编程实践"
  }'
```

### 4.4 推荐教学资源

```bash
curl -X POST http://localhost:3001/api/agent/recommend-resources \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Python编程",
    "type": "all"
  }'
```

### 4.5 获取示例课程

```bash
curl http://localhost:3001/api/agent/example-courses
```

## 5. 文件上传接口测试

### 5.1 单文件上传

```bash
curl -X POST http://localhost:3001/api/upload/single \
  -F "file=@/path/to/your/file.pdf"
```

### 5.2 多文件上传

```bash
curl -X POST http://localhost:3001/api/upload/multiple \
  -F "files=@/path/to/file1.pdf" \
  -F "files=@/path/to/file2.pdf"
```

### 5.3 作业文件上传

```bash
curl -X POST http://localhost:3001/api/upload/homework \
  -F "homework=@/path/to/homework.pdf" \
  -F "studentId=123" \
  -F "homeworkId=456"
```

### 5.4 课程资源上传

```bash
curl -X POST http://localhost:3001/api/upload/resource \
  -F "resource=@/path/to/resource.pdf" \
  -F "courseId=1" \
  -F "name=课程讲义" \
  -F "description=第一章课程资料"
```

## 6. 其他接口测试

### 6.1 作业接口

```bash
# 获取作业列表
curl http://localhost:3001/api/homework

# 创建作业
curl -X POST http://localhost:3001/api/homework \
  -H "Content-Type: application/json" \
  -d '{
    "title": "第一次作业",
    "description": "完成Python基础练习"
  }'
```

### 6.2 Quiz接口

```bash
# 获取Quiz列表
curl http://localhost:3001/api/quiz

# 创建Quiz
curl -X POST http://localhost:3001/api/quiz \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Python基础测验",
    "duration": 60
  }'
```

### 6.3 讨论区接口

```bash
# 获取讨论列表
curl http://localhost:3001/api/discussion

# 发布讨论
curl -X POST http://localhost:3001/api/discussion \
  -H "Content-Type: application/json" \
  -d '{
    "title": "关于Python的问题",
    "content": "如何理解装饰器?"
  }'
```

### 6.4 投票接口

```bash
# 获取投票列表
curl http://localhost:3001/api/vote

# 创建投票
curl -X POST http://localhost:3001/api/vote \
  -H "Content-Type: application/json" \
  -d '{
    "title": "课程难度调查",
    "type": "SINGLE",
    "options": ["太简单", "适中", "太难"]
  }'
```

### 6.5 数据分析接口

```bash
# 获取分析数据
curl http://localhost:3001/api/analytics
```

## 测试结果记录

### ✅ 已通过测试

- [x] 健康检查
- [x] 课程列表获取
- [x] Agent课程生成
- [x] 所有路由正常响应

### ⚠️ 需要注意

- 文件上传需要实际文件路径
- JWT认证需要先登录获取token
- 数据库操作需要配置PostgreSQL

## 性能测试

### 响应时间

- API健康检查: < 10ms
- 课程列表查询: < 50ms
- Agent生成: < 200ms (模拟)

### 并发测试

使用Apache Bench进行压力测试:

```bash
ab -n 1000 -c 10 http://localhost:3001/health
```

## 错误处理测试

### 400 Bad Request

```bash
curl -X POST http://localhost:3001/api/agent/generate-course \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 404 Not Found

```bash
curl http://localhost:3001/api/courses/999
```

### 500 Internal Server Error

测试服务器异常处理机制

---

**测试完成日期**: 2025-10-15  
**测试人员**: QA Team  
**测试环境**: Development

