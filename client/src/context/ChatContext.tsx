import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'
import api from '@/lib/api'
import type { ChatSession } from '@/types'

interface ChatContextType {
  socket: Socket | null
  isConnected: boolean
  activeSession: ChatSession | null
  unreadCount: number
  startChat: (jobId: string, employerId: string) => Promise<ChatSession | null>
  closeChat: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const socketRef = useRef<Socket | null>(null)

  // 建立 WebSocket 连接
  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setSocket(null)
        setIsConnected(false)
      }
      return
    }

    const token = localStorage.getItem('token')
    if (!token) return

    // 开发环境连本地后端，生产环境连同源（前后端在同一服务器）
    const socketUrl = import.meta.env.PROD ? window.location.origin : 'http://localhost:3001'
    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    })

    newSocket.on('connect', () => {
      console.log('WebSocket 已连接')
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('WebSocket 已断开')
      setIsConnected(false)
    })

    newSocket.on('connect_error', (err) => {
      console.error('WebSocket 连接错误:', err.message)
      setIsConnected(false)
    })

    newSocket.on('new_message', (msg: any) => {
      setUnreadCount(prev => prev + 1)
    })

    socketRef.current = newSocket
    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
      socketRef.current = null
      setSocket(null)
      setIsConnected(false)
    }
  }, [isAuthenticated, user])

  // 重置未读数
  useEffect(() => {
    if (activeSession) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }, [activeSession])

  // 开始聊天 - 创建或获取会话
  const startChat = useCallback(async (jobId: string, employerId: string): Promise<ChatSession | null> => {
    try {
      const res = await api.post('/chat/sessions', { jobId, employerId })
      if (res.data.success && res.data.data) {
        setActiveSession(res.data.data)
        return res.data.data
      }
      return null
    } catch (err) {
      console.error('创建聊天会话失败:', err)
      return null
    }
  }, [])

  const closeChat = useCallback(() => {
    setActiveSession(null)
  }, [])

  return (
    <ChatContext.Provider
      value={{
        socket,
        isConnected,
        activeSession,
        unreadCount,
        startChat,
        closeChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within ChatProvider')
  }
  return context
}
