#!/bin/sh
cd server
export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
export PRISMA_SKIP_POSTINSTALL_GENERATE=1
for i in 1 2 3; do
  echo "尝试生成 Prisma Client (第 $i 次)..."
  if npx prisma generate; then
    echo "Prisma Client 生成成功"
    exit 0
  fi
  if [ $i -lt 3 ]; then
    echo "生成失败，等待 5 秒后重试..."
    sleep 5
  fi
done
echo "Prisma Client 生成失败，已重试 3 次"
exit 1

