FROM node:24-alpine

WORKDIR /app

# 复制服务端代码
COPY server/package.json server/package-lock.json* ./
RUN npm install

COPY server/ .
RUN npm run build
RUN npx prisma generate
RUN npx prisma db push

# 复制前端构建产物
COPY client/dist ./public

ENV NODE_ENV=production
ENV PORT=10000

EXPOSE 10000

CMD ["node", "dist/index.js"]
