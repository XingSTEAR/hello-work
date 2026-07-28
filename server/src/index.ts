import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { PrismaClient } from '@prisma/client'
import path from 'path'
import { fileURLToPath } from 'url'

import authRoutes from './routes/auth.js'
import jobRoutes from './routes/jobs.js'
import chatRoutes from './routes/chat.js'
import { setupWebSocket } from './websocket/chat.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isProduction = process.env.NODE_ENV === 'production'

const app = express()
const httpServer = createServer(app)

// 生产环境允许所有来源（便于分享），开发环境限制 localhost
const allowedOrigins = isProduction
  ? true  // 允许所有来源
  : ['http://localhost:5173', 'http://127.0.0.1:5173']

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
})

export const prisma = new PrismaClient()

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}))
app.use(express.json())

// JWT Secret
export const JWT_SECRET = process.env.JWT_SECRET || 'hello-work-secret-key-2024'

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/chat', chatRoutes)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Setup WebSocket
setupWebSocket(io)

// 生产环境：serve 前端构建产物
if (isProduction) {
  const publicPath = path.join(__dirname, '..', 'public')
  app.use(express.static(publicPath))
  // SPA fallback - 所有非 API 路由返回 index.html
  app.get('*', (_req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'))
  })
}

const PORT = process.env.PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`🚀 HELLO WORK Server running on port ${PORT}`)
})
