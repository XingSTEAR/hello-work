import { Router, Response } from 'express'
import { prisma } from '../index.js'
import { authenticate, AuthRequest } from '../middleware/auth.js'

const router = Router()

// GET /api/chat/sessions - Get my chat sessions
router.get('/sessions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const sessions = await prisma.chatSession.findMany({
      where: {
        OR: [
          { userId: req.userId },
          { employerId: req.userId },
        ],
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
        employer: {
          select: { id: true, name: true, avatar: true },
        },
        job: {
          select: { id: true, title: true },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 50,
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return res.json({ success: true, data: sessions })
  } catch (error) {
    console.error('Get sessions error:', error)
    return res.status(500).json({ success: false, error: '获取聊天列表失败' })
  }
})

// POST /api/chat/sessions - Create or get chat session
router.post('/sessions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { jobId, employerId } = req.body

    // Check if session already exists
    let session = await prisma.chatSession.findFirst({
      where: {
        jobId,
        userId: req.userId,
        employerId,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        employer: { select: { id: true, name: true, avatar: true } },
        job: { select: { id: true, title: true } },
        messages: { orderBy: { createdAt: 'asc' }, take: 50 },
      },
    })

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          jobId,
          userId: req.userId!,
          employerId,
        },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          employer: { select: { id: true, name: true, avatar: true } },
          job: { select: { id: true, title: true } },
          messages: { orderBy: { createdAt: 'asc' }, take: 50 },
        },
      })
    }

    return res.json({ success: true, data: session })
  } catch (error) {
    console.error('Create session error:', error)
    return res.status(500).json({ success: false, error: '创建聊天失败' })
  }
})

// GET /api/chat/sessions/:id/messages - Get messages for a session
router.get('/sessions/:id/messages', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const messages = await prisma.message.findMany({
      where: { sessionId: req.params.id },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    return res.json({ success: true, data: messages })
  } catch (error) {
    console.error('Get messages error:', error)
    return res.status(500).json({ success: false, error: '获取消息失败' })
  }
})

export default router
