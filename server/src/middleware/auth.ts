import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../index.js'

export interface AuthRequest extends Request {
  userId?: string
  userRole?: string
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: '未提供认证令牌' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
    req.userId = decoded.userId
    req.userRole = decoded.role
    next()
  } catch {
    return res.status(401).json({ success: false, error: '认证令牌无效或已过期' })
  }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return next()
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
    req.userId = decoded.userId
    req.userRole = decoded.role
  } catch {
    // Ignore invalid token
  }
  next()
}
