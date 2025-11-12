# Vercel 部署配置检查清单

## ✅ 已完成的配置

### 1. 依赖版本统一
- ✅ 统一 Prisma 版本为 5.9.0
  - 根 `package.json`: `@prisma/client@5.9.0`, `prisma@5.9.0`
  - `server/package.json`: `@prisma/client@5.9.0`, `prisma@5.9.0`
  - `api/package.json`: `@prisma/client@5.9.0`

### 2. API 目录配置
- ✅ 创建 `api/package.json`
  - 类型设置为 `"type": "commonjs"`
  - 包含所有必需的服务器依赖
  - Node.js 版本要求: `>=18.x`

### 3. 模块系统配置
- ✅ 根目录: ESM (`"type": "module"`) - 用于 Vite/React
- ✅ server 目录: CommonJS (`"type": "commonjs"`)
- ✅ api 目录: CommonJS (`"type": "commonjs"`)

### 4. Vercel 配置文件
- ✅ `vercel.json` 包含:
  - 函数配置 (内存: 1024MB, 超时: 10秒)
  - API 路由重写规则
  - CORS 头部设置

### 5. 数据库配置
- ✅ 硬编码数据库 URL 在:
  - `api/index.js` (第 6 行)
  - `server/utils/prisma.js` (第 8 行)

### 6. 构建脚本
- ✅ `package.json` 包含:
  - `build`: `vite build && cd server && npx prisma generate`
  - `vercel-build`: `vite build && cd server && npx prisma generate`

### 7. 依赖完整性
- ✅ 根 `package.json` 包含所有必需依赖:
  - express: ^5.1.0
  - @prisma/client: ^5.9.0
  - openai: ^4.28.0
  - cors: ^2.8.5
  - bcryptjs: ^3.0.2
  - jsonwebtoken: ^9.0.2
  - multer: ^2.0.2
  - axios: ^1.12.2
  - dotenv: ^17.2.3

## 📋 部署前检查项

### 必检项目

#### 1. 文件结构
```
/workspaces/groupproject-team16/
├── api/
│   ├── index.js          ✅ Vercel 无服务器函数入口
│   └── package.json      ✅ API 依赖配置
├── server/
│   ├── routes/           ✅ 所有路由文件
│   ├── utils/
│   │   └── prisma.js     ✅ 数据库配置
│   ├── middleware/       ✅ 中间件
│   └── package.json      ✅ Server 配置
├── src/                  ✅ React 前端
├── package.json          ✅ 根配置
├── vercel.json           ✅ Vercel 配置
└── .vercelignore         ✅ 忽略文件配置
```

#### 2. 环境变量检查
- ✅ DATABASE_URL: 硬编码在代码中
- ⚠️ JWT_SECRET: 需要在 Vercel 环境变量中设置
- ⚠️ DOUBAO_API_KEY: 如果使用 AI 功能，需要设置
- ⚠️ OPENAI_API_KEY: 如果使用 OpenAI，需要设置

#### 3. 数据库连接
- ✅ 数据库 URL 已硬编码
- ⚠️ 确认 Neon 数据库在线且可访问
- ⚠️ 确认数据库 schema 已同步 (运行 `prisma migrate deploy`)

#### 4. API 路由检查
所有路由都通过 `/api/*` 访问：
- ✅ /api/health - 健康检查
- ✅ /api/auth/* - 认证
- ✅ /api/courses/* - 课程
- ✅ /api/homework/* - 作业
- ✅ /api/quiz/* - 测验
- ✅ /api/discussion/* - 讨论
- ✅ /api/resources/* - 资源
- ✅ /api/vote/* - 投票
- ✅ /api/analytics/* - 分析
- ✅ /api/agent/* - Agent
- ✅ /api/ai/* - AI 聊天
- ✅ /api/upload/* - 上传

## 🔧 依赖版本对照表

| 依赖包 | 根 package.json | server/package.json | api/package.json | 状态 |
|--------|----------------|---------------------|------------------|------|
| @prisma/client | 5.9.0 | 5.9.0 | 5.9.0 | ✅ 一致 |
| prisma | 5.9.0 | 5.9.0 | - | ✅ 一致 |
| express | 5.1.0 | 4.18.2 | 4.18.2 | ⚠️ 不一致 |
| axios | 1.12.2 | 1.6.5 | 1.6.5 | ⚠️ 不一致 |
| bcryptjs | 3.0.2 | 2.4.3 | 2.4.3 | ⚠️ 不一致 |
| jsonwebtoken | 9.0.2 | 9.0.2 | 9.0.2 | ✅ 一致 |
| cors | 2.8.5 | 2.8.5 | 2.8.5 | ✅ 一致 |
| dotenv | 17.2.3 | 16.3.1 | 16.3.1 | ⚠️ 不一致 |
| multer | 2.0.2 | 1.4.5-lts.1 | 1.4.5-lts.1 | ⚠️ 不一致 |
| openai | 4.28.0 | 4.28.0 | 4.28.0 | ✅ 一致 |

### ⚠️ 版本不一致说明
虽然有些版本不一致，但这不会影响 Vercel 部署，因为：
1. API 函数使用 `api/package.json` 中的版本
2. 前端构建使用根 `package.json` 中的版本
3. 两者独立运行，不会冲突

## 🚀 部署步骤

### 方式一：Vercel CLI 部署

1. **安装依赖** (如果还未安装)
```bash
cd /workspaces/groupproject-team16
pnpm install
```

2. **生成 Prisma 客户端**
```bash
cd server
npx prisma generate
```

3. **本地测试**
```bash
vercel dev
```

4. **部署到预览环境**
```bash
vercel
```

5. **部署到生产环境**
```bash
vercel --prod
```

### 方式二：GitHub 集成 (推荐)

1. **推送代码到 GitHub**
```bash
git add .
git commit -m "Configure Vercel deployment"
git push origin main
```

2. **在 Vercel 网站导入项目**
   - 访问 https://vercel.com
   - 点击 "Import Project"
   - 选择 GitHub 仓库
   - Vercel 会自动检测配置

3. **配置环境变量** (在 Vercel 项目设置中)
   - `JWT_SECRET`: 您的 JWT 密钥
   - `DOUBAO_API_KEY`: (可选) AI API 密钥
   - `NODE_ENV`: `production`

4. **触发部署**
   - Vercel 会自动构建和部署
   - 每次推送到 main 分支都会自动重新部署

## 🔍 部署后验证

### 1. 健康检查
访问部署后的 URL:
```
https://your-domain.vercel.app/api/health
```

期望响应:
```json
{
  "status": "ok",
  "message": "Agent Teaching Management API is running",
  "database": "connected"
}
```

### 2. API 端点测试
```
https://your-domain.vercel.app/api
```

### 3. 前端访问
```
https://your-domain.vercel.app/
```

## ⚠️ 已知限制和注意事项

### Vercel 无服务器函数限制

1. **执行时间限制**
   - Hobby 计划: 10 秒
   - Pro 计划: 60 秒
   - 当前配置: 10 秒 (maxDuration)

2. **内存限制**
   - 当前配置: 1024MB
   - 可根据需要调整

3. **文件上传限制**
   - 请求体大小: 4.5MB (Hobby)
   - 建议: 大文件使用外部存储 (S3, Cloudinary)

4. **冷启动**
   - 函数不活动后会休眠
   - 首次请求可能较慢 (1-3秒)

5. **无状态**
   - 每次请求都是独立的
   - 不支持 WebSocket
   - 文件上传到本地文件系统在下次请求时会丢失

### 文件上传建议

如果需要持久化文件存储，建议集成：
- AWS S3
- Cloudflare R2
- Cloudinary
- UploadThing

## 🐛 故障排除

### 问题 1: 构建失败 - Prisma 错误
**解决方案:**
```bash
cd server
npx prisma generate
npx prisma migrate deploy
```

### 问题 2: API 请求失败 - 404
**检查:**
1. 路由路径是否以 `/api/` 开头
2. `vercel.json` 中的 rewrites 配置是否正确

### 问题 3: 数据库连接失败
**检查:**
1. 数据库 URL 是否正确
2. Neon 数据库是否在线
3. 网络连接是否正常

### 问题 4: 依赖安装失败
**解决方案:**
```bash
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### 问题 5: 模块加载错误
**检查:**
1. `api/package.json` 中 `"type": "commonjs"`
2. `server/package.json` 中 `"type": "commonjs"`
3. 根 `package.json` 中 `"type": "module"`

## 📊 监控和日志

### Vercel 仪表板
- **实时日志**: Functions 标签页
- **部署历史**: Deployments 标签页
- **性能监控**: Analytics 标签页
- **错误追踪**: 查看函数调用错误

### 日志查看
```bash
vercel logs [deployment-url]
```

## ✅ 最终检查清单

部署前请确认:

- [ ] 所有文件已提交到 Git
- [ ] `pnpm install` 成功运行
- [ ] `pnpm build` 成功构建
- [ ] 数据库迁移已执行
- [ ] 环境变量已在 Vercel 设置
- [ ] `.vercelignore` 配置正确
- [ ] `vercel.json` 配置无误
- [ ] API 路由测试通过
- [ ] 本地 `vercel dev` 测试成功

## 🎉 部署成功标志

当看到以下内容时，表示部署成功:

1. ✅ Vercel 构建日志显示 "Build Completed"
2. ✅ `/api/health` 返回 `{"database": "connected"}`
3. ✅ 前端页面正常加载
4. ✅ API 请求正常响应
5. ✅ 数据库操作正常

---

**最后更新**: 2025-11-12
**状态**: ✅ 配置完整，可以部署
