import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma, JWT_SECRET } from '../index.js'

const router = Router()

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone, role } = req.body

    // Validate
    if (!email || !password || !name || !phone) {
      return res.status(400).json({ success: false, error: '请填写所有必填字段' })
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: '密码至少需要6个字符' })
    }

    // Check existing
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(400).json({ success: false, error: '该邮箱已被注册' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role: role || 'WORKER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        avatar: true,
        bio: true,
        balance: true,
        rating: true,
        level: true,
        points: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Generate token
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' })

    return res.json({
      success: true,
      data: { user, token },
    })
  } catch (error) {
    console.error('Register error:', error)
    return res.status(500).json({ success: false, error: '注册失败，请稍后重试' })
  }
})

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, error: '请提供邮箱和密码' })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ success: false, error: '邮箱或密码错误' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ success: false, error: '邮箱或密码错误' })
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' })

    const { password: _, ...userData } = user

    return res.json({
      success: true,
      data: { user: userData, token },
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ success: false, error: '登录失败，请稍后重试' })
  }
})

// GET /api/auth/me
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: '未登录' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true, email: true, name: true, phone: true, role: true,
        avatar: true, bio: true, balance: true, rating: true,
        level: true, points: true, isVerified: true,
        createdAt: true, updatedAt: true,
      },
    })

    if (!user) {
      return res.status(404).json({ success: false, error: '用户不存在' })
    }

    return res.json({ success: true, data: user })
  } catch {
    return res.status(401).json({ success: false, error: '认证失败' })
  }
})

export default router
