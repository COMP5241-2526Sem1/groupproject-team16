#!/bin/bash

# Agent Teaching Platform - 快速部署脚本
# 用于在Vercel上部署全栈应用

set -e

echo "🎓 Agent智能体教学管理平台 - 快速部署"
echo "==========================================="

# 检查必要工具
if ! command -v git &> /dev/null; then
    echo "❌ Git未安装，请先安装Git"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，请先安装Node.js 18+"
    exit 1
fi

# 检查是否在正确的目录
if [ ! -f "vercel.json" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

echo "✅ 环境检查通过"

# 安装依赖
echo "📦 安装项目依赖..."
if command -v pnpm &> /dev/null; then
    pnpm install
    echo "📦 安装后端依赖..."
    cd server && npm install && cd ..
else
    npm install
    echo "� 安装后端依赖..."
    npm run server:install
fi

# 检查环境变量配置
echo "🔧 检查环境变量配置..."
if [ ! -f ".env" ]; then
    echo "⚠️  .env文件不存在，复制.env.example为模板"
    cp .env.example .env
    echo "📝 请编辑.env文件设置您的配置，然后重新运行此脚本"
    echo "   必需配置: DATABASE_URL, JWT_SECRET"
    exit 1
fi

# 构建测试
echo "🏗️  测试构建..."
npm run build

echo "✅ 构建成功！"

# 本地服务器测试
echo "🧪 启动本地服务器进行测试..."
npm run server:start &
SERVER_PID=$!
sleep 3

# 健康检查
HEALTH_CHECK=$(curl -s http://localhost:3001/health || echo "failed")
if echo "$HEALTH_CHECK" | grep -q "ok"; then
    echo "✅ 后端API测试通过"
    kill $SERVER_PID 2>/dev/null || true
else
    echo "❌ 后端API测试失败"
    kill $SERVER_PID 2>/dev/null || true
fi

# Vercel部署指引
echo ""
echo "🚀 Vercel部署步骤："
echo "1. 确保代码已推送到GitHub"
echo "2. 访问 https://vercel.com 并登录"
echo "3. 点击 'New Project' 导入此仓库"
echo "4. Vercel将自动检测vercel.json配置"
echo "5. 在项目设置中添加环境变量："
echo "   - DATABASE_URL (Vercel Postgres数据库URL)"
echo "   - JWT_SECRET (随机字符串，至少32字符)"
echo "   - NODE_ENV=production"
echo "6. 部署完成后，运行数据库迁移："
echo "   npm run db:migrate"
echo ""
echo "📚 详细部署指南请查看: ./DEPLOYMENT.md"
echo ""
echo "🎉 准备就绪！现在可以部署到Vercel了。"
