# 数据库设置说明

## 1. 配置数据库连接

在 `server/.env` 文件中配置 PostgreSQL 数据库连接：

```env
DATABASE_URL="postgresql://username:password@localhost:5432/agent_edu?schema=public"
```

## 2. 运行数据库迁移

```bash
cd server
npx prisma migrate dev
```

或者如果已经有数据库，只生成 Prisma Client：

```bash
npx prisma generate
```

## 3. 填充初始数据

运行 seed 脚本来填充 mock 数据：

```bash
cd server
npm run seed
```

或者直接运行：

```bash
node prisma/seed.js
```

## 4. 验证数据

seed 脚本会创建以下数据：

- **用户**: 2个教师，4个学生
- **课程**: 2门课程
- **作业**: 2个作业，2个提交记录
- **测验**: 1个测验，3道题目
- **讨论**: 3个主帖子，2个回复
- **资源**: 5个资源文件
- **投票**: 3个投票，4个投票结果

## 5. 查看数据

可以使用 Prisma Studio 查看数据库内容：

```bash
npx prisma studio
```

## 注意事项

- 运行 seed 脚本会**清空**现有数据并重新填充
- 确保数据库连接配置正确
- 确保已运行数据库迁移创建表结构


