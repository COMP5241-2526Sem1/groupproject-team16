# API 路由完整映射和验证

## 路由转发配置验证

### Vercel 配置 (vercel.json)

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api"
    }
  ]
}
```

**说明**: 
- 所有 `/api/*` 请求都会被转发到 `/api/index.js` (Vercel 无服务器函数)
- `:path*` 会匹配所有子路径，包括多层级路径
- 函数内部使用 Express Router 处理具体的路由

### Express 路由挂载 (api/index.js)

```javascript
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/discussion', discussionRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);
```

---

## 完整路由清单

### ✅ 1. 认证路由 (`/api/auth`)

| 方法 | 路径 | 完整 URL | 功能 | 认证 |
|------|------|----------|------|------|
| POST | `/register` | `/api/auth/register` | 用户注册 | ❌ |
| POST | `/login` | `/api/auth/login` | 用户登录 | ❌ |
| POST | `/send-code` | `/api/auth/send-code` | 发送验证码 | ❌ |
| GET | `/me` | `/api/auth/me` | 获取当前用户信息 | ✅ |

**Vercel 转发**: `/api/auth/*` → `/api` → Express Router → `authRoutes`

---

### ✅ 2. 课程路由 (`/api/courses`)

| 方法 | 路径 | 完整 URL | 功能 | 认证 |
|------|------|----------|------|------|
| GET | `/` | `/api/courses` | 获取所有课程 | ❌ |
| GET | `/mine` | `/api/courses/mine` | 获取我的课程 | ✅ |
| GET | `/:id/overview` | `/api/courses/:id/overview` | 课程概览 | ✅ |
| GET | `/:id` | `/api/courses/:id` | 获取课程详情 | ❌ |
| POST | `/` | `/api/courses` | 创建课程 | ✅ |
| PUT | `/:id` | `/api/courses/:id` | 更新课程 | ✅ |
| DELETE | `/:id` | `/api/courses/:id` | 删除课程 | ✅ |
| POST | `/:id/enroll` | `/api/courses/:id/enroll` | 注册课程 | ✅ |

**Vercel 转发**: `/api/courses/*` → `/api` → Express Router → `courseRoutes`

---

### ✅ 3. 作业路由 (`/api/homework`)

| 方法 | 路径 | 完整 URL | 功能 | 认证 |
|------|------|----------|------|------|
| GET | `/` | `/api/homework` | 获取作业列表 | ❌ |
| GET | `/:id` | `/api/homework/:id` | 获取作业详情 | ❌ |
| POST | `/` | `/api/homework` | 创建作业 | ✅ |
| PUT | `/:id` | `/api/homework/:id` | 更新作业 | ✅ |
| DELETE | `/:id` | `/api/homework/:id` | 删除作业 | ✅ |
| GET | `/:id/submissions` | `/api/homework/:id/submissions` | 获取提交列表 | ❌ |
| POST | `/:id/submit` | `/api/homework/:id/submit` | 提交作业 | ✅ |
| POST | `/:id/grade` | `/api/homework/:id/grade` | 批改作业 | ✅ |

**Vercel 转发**: `/api/homework/*` → `/api` → Express Router → `homeworkRoutes`

---

### ✅ 4. 测验路由 (`/api/quiz`)

| 方法 | 路径 | 完整 URL | 功能 | 认证 |
|------|------|----------|------|------|
| GET | `/` | `/api/quiz` | 获取测验列表 | ❌ |
| GET | `/:id` | `/api/quiz/:id` | 获取测验详情 | ❌ |
| POST | `/` | `/api/quiz` | 创建测验 | ✅ |
| POST | `/save-ai-generated` | `/api/quiz/save-ai-generated` | 保存 AI 生成的测验 | ✅ |
| PUT | `/:id` | `/api/quiz/:id` | 更新测验 | ✅ |
| DELETE | `/:id` | `/api/quiz/:id` | 删除测验 | ✅ |
| POST | `/:id/submit` | `/api/quiz/:id/submit` | 提交测验答案 | ✅ |

**Vercel 转发**: `/api/quiz/*` → `/api` → Express Router → `quizRoutes`

---

### ✅ 5. 讨论路由 (`/api/discussion`)

| 方法 | 路径 | 完整 URL | 功能 | 认证 |
|------|------|----------|------|------|
| GET | `/` | `/api/discussion` | 获取讨论列表 | ❌ |
| GET | `/:id` | `/api/discussion/:id` | 获取讨论详情 | ❌ |
| POST | `/` | `/api/discussion` | 创建讨论 | ✅ |
| PUT | `/:id` | `/api/discussion/:id` | 更新讨论 | ✅ |
| DELETE | `/:id` | `/api/discussion/:id` | 删除讨论 | ✅ |
| POST | `/:id/like` | `/api/discussion/:id/like` | 点赞讨论 | ❌ |
| POST | `/:id/unlike` | `/api/discussion/:id/unlike` | 取消点赞 | ❌ |
| POST | `/:id/pin` | `/api/discussion/:id/pin` | 置顶讨论 | ✅ |
| POST | `/:id/reply` | `/api/discussion/:id/reply` | 回复讨论 | ✅ |
| POST | `/:id/reply/:replyId/like` | `/api/discussion/:id/reply/:replyId/like` | 点赞回复 | ❌ |

**Vercel 转发**: `/api/discussion/*` → `/api` → Express Router → `discussionRoutes`

---

### ✅ 6. 资源路由 (`/api/resources`)

| 方法 | 路径 | 完整 URL | 功能 | 认证 |
|------|------|----------|------|------|
| GET | `/` | `/api/resources` | 获取资源列表 | ❌ |
| GET | `/:id` | `/api/resources/:id` | 获取资源详情 | ❌ |
| POST | `/` | `/api/resources` | 创建资源 | ✅ |
| PUT | `/:id` | `/api/resources/:id` | 更新资源 | ✅ |
| DELETE | `/:id` | `/api/resources/:id` | 删除资源 | ✅ |
| POST | `/:id/download` | `/api/resources/:id/download` | 下载资源 | ❌ |
| GET | `/stats/overview` | `/api/resources/stats/overview` | 资源统计 | ❌ |

**Vercel 转发**: `/api/resources/*` → `/api` → Express Router → `resourceRoutes`

---

### ✅ 7. 投票路由 (`/api/vote`)

| 方法 | 路径 | 完整 URL | 功能 | 认证 |
|------|------|----------|------|------|
| GET | `/` | `/api/vote` | 获取投票列表 | ❌ |
| GET | `/:id` | `/api/vote/:id` | 获取投票详情 | ❌ |
| POST | `/` | `/api/vote` | 创建投票 | ✅ |
| PUT | `/:id` | `/api/vote/:id` | 更新投票 | ✅ |
| DELETE | `/:id` | `/api/vote/:id` | 删除投票 | ✅ |
| POST | `/:id/vote` | `/api/vote/:id/vote` | 投票 | ✅ |
| GET | `/:id/stats` | `/api/vote/:id/stats` | 投票统计 | ❌ |
| POST | `/:id/end` | `/api/vote/:id/end` | 结束投票 | ✅ |

**Vercel 转发**: `/api/vote/*` → `/api` → Express Router → `voteRoutes`

---

### ✅ 8. 分析路由 (`/api/analytics`)

| 方法 | 路径 | 完整 URL | 功能 | 认证 |
|------|------|----------|------|------|
| GET | `/dashboard` | `/api/analytics/dashboard` | 仪表板数据 | ❌ |
| GET | `/grades/distribution` | `/api/analytics/grades/distribution` | 成绩分布 | ❌ |
| GET | `/homework/trend` | `/api/analytics/homework/trend` | 作业趋势 | ❌ |
| GET | `/activity/student` | `/api/analytics/activity/student` | 学生活动 | ❌ |
| GET | `/course/completion` | `/api/analytics/course/completion` | 课程完成度 | ❌ |
| GET | `/quiz/trend` | `/api/analytics/quiz/trend` | 测验趋势 | ❌ |
| GET | `/students/top` | `/api/analytics/students/top` | 顶尖学生 | ❌ |
| GET | `/metrics` | `/api/analytics/metrics` | 指标数据 | ❌ |
| GET | `/comprehensive` | `/api/analytics/comprehensive` | 综合分析 | ❌ |

**Vercel 转发**: `/api/analytics/*` → `/api` → Express Router → `analyticsRoutes`

---

### ✅ 9. Agent 路由 (`/api/agent`)

| 方法 | 路径 | 完整 URL | 功能 | 认证 |
|------|------|----------|------|------|
| POST | `/generate-course` | `/api/agent/generate-course` | 生成课程 | ❌ |
| POST | `/generate-quiz` | `/api/agent/generate-quiz` | 生成测验 | ❌ |
| POST | `/generate-homework` | `/api/agent/generate-homework` | 生成作业 | ❌ |
| POST | `/recommend-resources` | `/api/agent/recommend-resources` | 推荐资源 | ❌ |
| POST | `/regenerate-quiz-question` | `/api/agent/regenerate-quiz-question` | 重新生成测验题 | ❌ |
| GET | `/example-courses` | `/api/agent/example-courses` | 示例课程 | ❌ |
| POST | `/save-course` | `/api/agent/save-course` | 保存课程 | ❌ |

**Vercel 转发**: `/api/agent/*` → `/api` → Express Router → `agentRoutes`

---

### ✅ 10. 上传路由 (`/api/upload`)

| 方法 | 路径 | 完整 URL | 功能 | 认证 |
|------|------|----------|------|------|
| POST | `/single` | `/api/upload/single` | 单文件上传 | ❌ |
| POST | `/multiple` | `/api/upload/multiple` | 多文件上传 | ❌ |
| POST | `/homework` | `/api/upload/homework` | 作业文件上传 | ❌ |
| POST | `/resource` | `/api/upload/resource` | 资源文件上传 | ❌ |

**Vercel 转发**: `/api/upload/*` → `/api` → Express Router → `uploadRoutes`

⚠️ **注意**: Vercel 无服务器函数不支持持久化本地文件存储。建议集成外部存储服务。

---

### ✅ 11. AI 聊天路由 (`/api/ai`)

| 方法 | 路径 | 完整 URL | 功能 | 认证 |
|------|------|----------|------|------|
| POST | `/chat` | `/api/ai/chat` | AI 聊天 | ❌ |

**Vercel 转发**: `/api/ai/*` → `/api` → Express Router → `aiRoutes`

---

### ✅ 12. 系统路由

| 方法 | 路径 | 完整 URL | 功能 | 认证 |
|------|------|----------|------|------|
| GET | `/api/health` | `/api/health` | 健康检查 | ❌ |
| GET | `/api` | `/api` | API 信息 | ❌ |

**Vercel 转发**: `/api` → `/api/index.js`

---

## 路由转发流程图

```
用户请求
    ↓
https://your-app.vercel.app/api/courses/123
    ↓
Vercel Edge Network
    ↓
vercel.json rewrites 规则匹配
    ↓
/api/:path* → /api/index.js (无服务器函数)
    ↓
Express App 初始化
    ↓
设置数据库 URL (硬编码)
    ↓
加载所有路由模块
    ↓
app.use('/api/courses', courseRoutes)
    ↓
courseRoutes.get('/:id', handler)
    ↓
处理请求，访问数据库
    ↓
返回 JSON 响应
    ↓
Vercel 返回给客户端
```

---

## 验证结果

### ✅ 配置完整性

1. **Vercel 路由转发**: ✅ 正确配置
   - 使用 `rewrites` 规则
   - 支持所有子路径 (`:path*`)
   - 正确指向无服务器函数

2. **Express 路由挂载**: ✅ 所有路由已注册
   - 11 个路由模块全部挂载
   - 路径前缀正确 (`/api/*`)
   - 中间件正确应用

3. **路由文件完整性**: ✅ 所有路由文件存在
   - ✅ auth.js (4 个端点)
   - ✅ courses.js (8 个端点)
   - ✅ homework.js (8 个端点)
   - ✅ quiz.js (7 个端点)
   - ✅ discussion.js (10 个端点)
   - ✅ resources.js (7 个端点)
   - ✅ vote.js (8 个端点)
   - ✅ analytics.js (9 个端点)
   - ✅ agent.js (7 个端点)
   - ✅ upload.js (4 个端点)
   - ✅ ai.js (1 个端点)

4. **总计**: **73 个 API 端点** + 2 个系统端点

---

## 潜在问题和建议

### ⚠️ 1. 文件上传限制

**问题**: Vercel 无服务器函数有以下限制：
- 请求体大小限制: 4.5MB (Hobby), 4.5MB (Pro)
- 无持久化文件系统
- 临时文件在函数执行后会被清除

**当前受影响的路由**:
- `/api/upload/single`
- `/api/upload/multiple`
- `/api/upload/homework`
- `/api/upload/resource`

**建议**: 
1. 集成外部存储服务:
   - AWS S3
   - Cloudflare R2
   - Vercel Blob Storage
   - Cloudinary (图片/视频)
2. 或者在 `middleware/upload.js` 中配置为直接上传到外部存储

### ⚠️ 2. 静态文件访问

**当前配置**:
```javascript
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
```

**问题**: Vercel 无服务器函数无法提供静态文件服务

**建议**:
1. 将上传文件存储到外部服务
2. 返回外部存储的 URL
3. 或使用 Vercel 的 `public/` 目录提供静态资产（仅适用于构建时的静态文件）

### ✅ 3. 数据库连接池

**当前配置**: ✅ 使用 Neon 的 Pooler 连接
```
@ep-red-wave-adt4e4cj-pooler.c-2.us-east-1.aws.neon.tech
```

这是正确的做法，因为无服务器函数需要连接池来管理数据库连接。

### ✅ 4. CORS 配置

**当前配置**: ✅ 在 `vercel.json` 中正确配置
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
}
```

### ⚠️ 5. 认证中间件

**当前状态**: ✅ 使用 JWT 认证

**建议**: 确保在 Vercel 环境变量中设置 `JWT_SECRET`

---

## 部署前最终检查

- [x] 所有路由正确挂载到 Express app
- [x] `vercel.json` 配置正确的 rewrites 规则
- [x] API 路径前缀一致 (`/api`)
- [x] 数据库 URL 已硬编码
- [x] CORS 头部正确配置
- [x] 函数内存和超时设置合理
- [ ] ⚠️ 考虑文件上传的外部存储方案
- [ ] ⚠️ 在 Vercel 设置 JWT_SECRET 环境变量
- [ ] ⚠️ 在 Vercel 设置 AI API 密钥（如需使用）

---

## 测试建议

部署后，建议按以下顺序测试：

1. **健康检查**
   ```bash
   curl https://your-app.vercel.app/api/health
   ```

2. **认证流程**
   ```bash
   # 注册
   curl -X POST https://your-app.vercel.app/api/auth/register -d '{...}'
   
   # 登录
   curl -X POST https://your-app.vercel.app/api/auth/login -d '{...}'
   ```

3. **数据获取**
   ```bash
   curl https://your-app.vercel.app/api/courses
   ```

4. **需认证的端点**
   ```bash
   curl -H "Authorization: Bearer <token>" https://your-app.vercel.app/api/courses/mine
   ```

---

**状态**: ✅ 路由转发配置完整且正确
**总路由数**: 75 个端点
**最后更新**: 2025-11-12
