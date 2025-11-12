#!/bin/bash

echo "🚀 开始部署 Agent教学管理后台系统..."

# 1. 安装依赖
echo "📦 安装依赖..."
pnpm install

# 2. 构建前端
echo "🔨 构建前端应用..."
pnpm run build

# 3. 检查构建结果
if [ -d "dist" ]; then
  echo "✅ 前端构建成功"
else
  echo "❌ 前端构建失败"
  exit 1
fi

# 4. 启动后端服务器
echo "🖥️  启动后端服务器..."
cd server
node index.js &
SERVER_PID=$!
echo "后端服务器PID: $SERVER_PID"

# 5. 等待服务器启动
sleep 3

# 6. 健康检查
echo "🏥 进行健康检查..."
HEALTH_CHECK=$(curl -s http://localhost:3001/health)
if echo "$HEALTH_CHECK" | grep -q "ok"; then
  echo "✅ 后端服务器运行正常"
else
  echo "❌ 后端服务器启动失败"
  kill $SERVER_PID
  exit 1
fi

echo ""
echo "🎉 部署完成!"
echo ""
echo "📍 访问地址:"
echo "   前端: 请使用静态服务器托管 dist/ 目录"
echo "   后端API: http://localhost:3001"
echo ""
echo "📝 后续步骤:"
echo "   1. 配置数据库连接 (server/.env)"
echo "   2. 运行数据库迁移 (cd server && npx prisma migrate deploy)"
echo "   3. 配置生产环境变量"
echo "   4. 部署到云平台"
echo ""
