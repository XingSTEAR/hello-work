FROM node:20-alpine

WORKDIR /app

# 只部署后端
COPY server/package.json server/package-lock.json* ./
RUN npm install

COPY server/ .

# 生成 Prisma 客户端
RUN npx prisma generate

# 构建 TypeScript
RUN npm run build

ENV NODE_ENV=production
ENV PORT=10000

EXPOSE 10000

# 启动时初始化数据库并运行
CMD sh -c "npx prisma db push --skip-generate && npx tsx prisma/seed.ts && node dist/index.js"
