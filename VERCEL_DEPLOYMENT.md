# Vercel 部署指南

## 项目结构

本项目已配置为 Vercel 部署结构：

- `/api/index.js` - Vercel 无服务器函数，处理所有 API 请求
- `/server/` - Express 后端代码和路由
- `/src/` - React 前端代码
- `vercel.json` - Vercel 配置文件

## 数据库配置

数据库 URL 已硬编码在以下位置：

1. **api/index.js** - Vercel 无服务器函数中设置
2. **server/utils/prisma.js** - Prisma 客户端初始化时使用

硬编码的数据库 URL：
```
postgresql://neondb_owner:npg_d2jCWZPFSgQ3@ep-red-wave-adt4e4cj-pooler.c-2.us-east-1.aws.neon.tech/agentedu?sslmode=require
```

## Vercel 配置说明

### vercel.json 配置

```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

### 构建脚本

package.json 中已添加构建脚本：

```json
{
  "scripts": {
    "build": "vite build && cd server && npx prisma generate",
    "vercel-build": "vite build && cd server && npx prisma generate"
  }
}
```

## 部署步骤

### 方式一：通过 Vercel CLI

1. 安装 Vercel CLI：
```bash
npm install -g vercel
```

2. 登录 Vercel：
```bash
vercel login
```

3. 部署项目：
```bash
vercel
```

4. 生产环境部署：
```bash
vercel --prod
```

### 方式二：通过 GitHub 集成

1. 将代码推送到 GitHub
2. 在 Vercel 网站 (https://vercel.com) 导入项目
3. Vercel 会自动检测配置并部署

## API 端点

部署后，所有 API 端点将在以下路径可用：

- `/api/health` - 健康检查（包含数据库连接状态）
- `/api/auth/*` - 认证相关
- `/api/courses/*` - 课程管理
- `/api/homework/*` - 作业管理
- `/api/quiz/*` - 测验管理
- `/api/discussion/*` - 讨论模块
- `/api/resources/*` - 资源管理
- `/api/vote/*` - 投票功能
- `/api/analytics/*` - 数据分析
- `/api/agent/*` - Agent 功能
- `/api/ai/*` - AI 聊天功能
- `/api/upload/*` - 文件上传

## 注意事项

1. **数据库连接**：数据库 URL 已硬编码，无需在 Vercel 环境变量中配置

2. **文件上传限制**：
   - Vercel 无服务器函数有文件大小限制（默认 4.5MB）
   - 文件存储在 `/tmp` 目录，仅在函数执行期间存在
   - 不同的函数调用之间不共享文件系统
   - **重要**：上传的文件不会持久化，刷新或重新部署后会丢失
   - **建议**：对于生产环境，请使用云存储服务（AWS S3、Cloudinary、Vercel Blob 等）

3. **环境变量**：其他环境变量（如 JWT_SECRET、API 密钥等）需要在 Vercel 项目设置中配置

4. **冷启动**：无服务器函数在一段时间不活动后会"休眠"，首次请求可能需要较长时间

5. **Prisma 客户端**：构建脚本会在部署时生成 Prisma 客户端

## 本地测试

在部署前，可以本地测试 Vercel 环境：

```bash
# 安装 Vercel CLI
npm install -g vercel

# 本地开发模式
vercel dev
```

## 故障排除

### API 请求失败

1. 检查 `/api/health` 端点是否正常
2. 查看 Vercel 函数日志
3. 确认数据库连接是否正常

### 数据库连接问题

1. 确认数据库 URL 是否正确
2. 检查 Neon 数据库是否在线
3. 验证 SSL 连接设置

### 构建失败

1. 查看 Vercel 构建日志
2. 确认所有依赖已正确安装
3. 检查 Prisma schema 是否有效

## 监控和日志

- 访问 Vercel 仪表板查看部署状态
- 使用 Vercel 实时日志功能监控 API 请求
- 在 Functions 标签页查看无服务器函数执行情况
