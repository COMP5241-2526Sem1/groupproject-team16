
# 启动前端
nvm use 18
## Install dependencies
pnpm install

## Start development server
pnpm run dev

# 启动后端
# nvm install 18
nvm use 18
# npx prisma generate --schema=server/prisma/schema.prisma
node ./server/index.js
npm start
