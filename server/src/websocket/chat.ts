import { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { prisma, JWT_SECRET } from '../index.js'

interface AuthenticatedSocket extends Socket {
  userId?: string
}

export function setupWebSocket(io: Server) {
  // Auth middleware for WebSocket
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token
      if (!token) {
        return next(new Error('未提供认证令牌'))
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
      socket.userId = decoded.userId
      next()
    } catch (err) {
      next(new Error('认证失败'))
    }
  })

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.userId}`)

    // Join user's personal room for private messaging
    if (socket.userId) {
      socket.join(`user:${socket.userId}`)
    }

    // Handle new message
    socket.on('send_message', async (data: { sessionId: string; receiverId: string; content: string }) => {
      try {
        if (!socket.userId) return

        // Save message to database
        const message = await prisma.message.create({
          data: {
            sessionId: data.sessionId,
            senderId: socket.userId,
            receiverId: data.receiverId,
            content: data.content,
          },
          include: {
            sender: { select: { id: true, name: true, avatar: true } },
          },
        })

        // Update session timestamp
        await prisma.chatSession.update({
          where: { id: data.sessionId },
          data: { updatedAt: new Date() },
        })

        // Send to both users in the session
        io.to(`user:${data.receiverId}`).emit('new_message', message)
        io.to(`user:${socket.userId}`).emit('new_message', message)
      } catch (error) {
        console.error('Send message error:', error)
        socket.emit('error', { message: '消息发送失败' })
      }
    })

    // Handle typing indicator
    socket.on('typing', (data: { sessionId: string; receiverId: string }) => {
      if (socket.userId) {
        io.to(`user:${data.receiverId}`).emit('user_typing', {
          sessionId: data.sessionId,
          userId: socket.userId,
        })
      }
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`)
    })
  })

  console.log('WebSocket server initialized')
}
