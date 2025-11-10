````markdown
# 🎓 Agent智能体教学管理平台

一个现代化的全栈教学管理系统，基于React + Node.js构建，支持Vercel一键部署。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/agent-edu-platform)

## ✨ 特性

- 🎯 **全栈应用** - React前端 + Node.js后端
- � **用户认证** - JWT身份验证系统
- 📚 **课程管理** - 完整的课程生命周期管理
- 📝 **作业系统** - 在线提交和批改
- 🧪 **Quiz测验** - 多题型在线测试
- 💬 **讨论区** - 课程互动交流
- 📊 **数据分析** - 可视化报表和统计
- 🤖 **AI生成** - 智能课程内容生成
- 🚀 **一键部署** - Vercel无服务器部署

## �️ 技术栈

**前端:**
- React 18 + Vite
- Tailwind CSS 4.0
- shadcn/ui + Radix UI
- Recharts + Lucide Icons

**后端:**
- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT认证 + bcryptjs
- Multer文件上传

**部署:**
- Vercel (前端 + 后端)
- Vercel Postgres
- GitHub集成CI/CD

## 🚀 快速开始

### 方法一：Vercel一键部署 (推荐)

1. 点击上方 "Deploy with Vercel" 按钮
2. 连接GitHub并导入仓库
3. 添加Vercel Postgres数据库
4. 设置环境变量后部署
5. 运行数据库迁移

详细步骤请参考 [部署指南](./DEPLOYMENT.md)

### 方法二：本地开发

```bash
# 克隆项目
git clone https://github.com/yourusername/agent-edu-platform.git
cd agent-edu-platform

# 安装依赖
pnpm run install:all

# 配置环境变量
cp .env.example .env
# 编辑 .env 设置数据库连接

# 初始化数据库
pnpm run db:migrate
pnpm run db:generate

# 启动开发环境
pnpm run dev:full
```

访问 http://localhost:5173 查看应用

## 📁 项目结构

```
├── src/                    # 前端源码
│   ├── components/         # React组件
│   ├── hooks/             # 自定义Hooks
│   └── lib/               # 工具函数
├── server/                # 后端源码  
│   ├── routes/            # API路由
│   ├── middleware/        # 中间件
│   └── prisma/           # 数据库配置
├── api/                   # Vercel函数
├── vercel.json           # 部署配置
└── .env.example          # 环境变量模板
```

## � 开发脚本

```bash
# 开发
pnpm run dev              # 前端开发服务器
pnpm run dev:full         # 前后端同时启动
pnpm run server:dev       # 仅后端开发

# 构建
pnpm run build            # 构建前端
pnpm run build:full       # 完整构建

# 数据库
pnpm run db:migrate       # 运行迁移
pnpm run db:generate      # 生成客户端
pnpm run db:studio        # 数据库可视化工具
```

## 📊 功能模块

| 模块 | 功能 | 状态 |
|------|------|------|
| 🔐 用户认证 | 注册、登录、角色管理 | ✅ |
| 📊 仪表板 | 数据统计、可视化图表 | ✅ |
| 📚 课程管理 | CRUD操作、学生管理 | ✅ |
| 📝 作业系统 | 发布、提交、批改 | ✅ |
| 🧪 Quiz测验 | 多题型、自动评分 | ✅ |
| 💬 讨论区 | 主题讨论、回复互动 | ✅ |
| 📖 资源管理 | 文件上传、在线预览 | ✅ |
| 🗳️ 投票问卷 | 创建投票、统计结果 | ✅ |
| 📈 数据分析 | 多维度统计分析 | ✅ |
| 🤖 AI生成器 | 智能课程生成 | ✅ |
| 🤖 AI助手 | 智能对话聊天 | ✅ |

## 🌐 在线演示

- **前端界面**: https://your-app.vercel.app
- **API接口**: https://your-app.vercel.app/api
- **健康检查**: https://your-app.vercel.app/health

## 📚 文档

- [📖 项目说明](./项目说明.md) - 详细功能介绍
- [🚀 部署指南](./DEPLOYMENT.md) - 完整部署教程
- [🧪 API测试](./API_TESTING.md) - 接口测试指南
- [⚙️ GitHub设置](./GITHUB_SETUP.md) - 项目配置说明

## 🔒 环境变量

```env
# 数据库
DATABASE_URL="postgresql://..."

# JWT认证
JWT_SECRET="your-secret-key"

# 服务器
NODE_ENV="production"
PORT=3001

# 可选配置
# 豆包AI配置
DOUBAO_API_KEY="your-doubao-api-key"
DOUBAO_BASE_URL="https://ark.cn-beijing.volces.com/api/v3"
DOUBAO_MODEL="doubao-1-5-lite-32k-250115"
```

完整配置请参考 [.env.example](./.env.example)

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🆘 获取帮助

- 📖 查看 [部署指南](./DEPLOYMENT.md)
- � 报告 [Issues](https://github.com/yourusername/agent-edu-platform/issues)
- 💬 参与 [Discussions](https://github.com/yourusername/agent-edu-platform/discussions)
- 📧 联系我们: support@yourapp.com

---

⭐ 如果这个项目对你有帮助，请给个星标支持一下！

````

