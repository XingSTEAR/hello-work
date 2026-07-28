import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Send, ArrowLeft, User, Briefcase, ChevronRight, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import { useChat } from '@/context/ChatContext'
import api from '@/lib/api'
import { cn, formatTime } from '@/lib/utils'
import type { ChatSession } from '@/types'

export default function Messages() {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const { sessionId: paramId } = useParams<{ sessionId: string }>()

  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { socket, isConnected } = useChat()

  // 加载聊天会话列表
  const loadSessions = useCallback(async () => {
    setLoadingSessions(true)
    try {
      const res = await api.get('/chat/sessions')
      if (res.data.success) {
        setSessions(res.data.data || [])
      }
    } catch (err) {
      console.error('加载聊天列表失败:', err)
    } finally {
      setLoadingSessions(false)
    }
  }, [])

  // 加载特定会话的消息
  const loadMessages = useCallback(async (sessionId: string) => {
    setLoadingMessages(true)
    try {
      const res = await api.get(`/chat/sessions/${sessionId}/messages`)
      if (res.data.success) {
        setMessages(res.data.data || [])
      }
    } catch (err) {
      console.error('加载消息失败:', err)
    } finally {
      setLoadingMessages(false)
    }
  }, [])

  // 初始加载
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login')
      return
    }
    if (isAuthenticated) {
      loadSessions()
    }
  }, [isAuthenticated, authLoading, navigate, loadSessions])

  // 监听 WebSocket 新消息
  useEffect(() => {
    if (!socket || !activeSession) return

    const handleNewMessage = (msg: any) => {
      if (msg.sessionId === activeSession.id) {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev
          return [...prev, msg]
        })
      }
      // 刷新会话列表以更新最后消息时间
      loadSessions()
    }

    socket.on('new_message', handleNewMessage)
    return () => {
      socket.off('new_message', handleNewMessage)
    }
  }, [socket, activeSession, loadSessions])

  // 如果有 URL 参数，自动选择会话
  useEffect(() => {
    if (paramId && sessions.length > 0) {
      const target = sessions.find(s => s.id === paramId)
      if (target) {
        selectSession(target)
      }
    }
  }, [paramId, sessions])

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 选择会话
  const selectSession = async (session: ChatSession) => {
    setActiveSession(session)
    await loadMessages(session.id)
  }

  // 发送消息
  const handleSend = () => {
    if (!inputValue.trim() || !activeSession || !socket) return

    const receiverId = activeSession.userId === user?.id
      ? activeSession.employerId
      : activeSession.userId

    const tempId = 'temp_' + Date.now()
    const tempMsg = {
      id: tempId,
      sessionId: activeSession.id,
      senderId: user?.id || '',
      receiverId,
      content: inputValue.trim(),
      createdAt: new Date().toISOString(),
      sender: { id: user?.id || '', name: user?.name || '', avatar: user?.avatar || '' },
      isLocal: true,
    }

    setMessages(prev => [...prev, tempMsg])
    setInputValue('')

    socket.emit('send_message', {
      sessionId: activeSession.id,
      receiverId,
      content: inputValue.trim(),
    })

    // 更新会话列表排序
    setTimeout(() => loadSessions(), 500)
  }

  // 获取对话对方信息
  const getChatPartner = (session: ChatSession) => {
    if (!user) return { name: '未知用户', avatar: '' }
    if (session.userId === user.id) {
      return { name: session.employer?.name || '未知雇主', avatar: session.employer?.avatar || '' }
    }
    return { name: session.user?.name || '未知用户', avatar: session.user?.avatar || '' }
  }

  const partner = activeSession ? getChatPartner(activeSession) : null

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex bg-gray-50">
      {/* 左侧：会话列表 */}
      <div className={cn(
        'w-full sm:w-80 lg:w-96 border-r border-gray-200 bg-white flex flex-col',
        activeSession ? 'hidden sm:flex' : 'flex'
      )}>
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">消息</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {isConnected ? '🟢 已连接实时消息' : '🔴 正在连接...'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingSessions ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">暂无聊天消息</h3>
              <p className="text-xs text-gray-400">
                浏览岗位并点击「联系雇主」或「联系劳动者」开始对话
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => navigate('/find-jobs')}
              >
                去看看岗位
              </Button>
            </div>
          ) : (
            sessions.map((session) => {
              const p = getChatPartner(session)
              const lastMsg = session.messages?.[session.messages.length - 1]
              const isActive = activeSession?.id === session.id

              return (
                <div
                  key={session.id}
                  onClick={() => selectSession(session)}
                  className={cn(
                    'px-5 py-3.5 cursor-pointer transition-colors border-b border-gray-50',
                    isActive ? 'bg-primary-50 border-l-2 border-l-primary-500' : 'hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0">
                      {p.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 truncate">{p.name}</span>
                        <span className="text-[11px] text-gray-400 shrink-0 ml-2">
                          {lastMsg ? formatTime(lastMsg.createdAt) : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Briefcase className="w-3 h-3 text-gray-300" />
                        <span className="text-xs text-gray-400 truncate">
                          {session.job?.title || '未知岗位'}
                        </span>
                      </div>
                      {lastMsg && (
                        <p className="text-xs text-gray-400 mt-1 truncate">
                          {lastMsg.senderId === user?.id ? '我: ' : ''}{lastMsg.content}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* 右侧：聊天窗口 */}
      <div className={cn(
        'flex-1 flex flex-col',
        !activeSession ? 'hidden sm:flex sm:items-center sm:justify-center' : 'flex'
      )}>
        {!activeSession ? (
          <div className="hidden sm:flex flex-col items-center justify-center text-center px-8">
            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-5">
              <MessageCircle className="w-10 h-10 text-primary-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">HELLO WORK 消息中心</h3>
            <p className="text-sm text-gray-400 max-w-xs">
              选择一个会话开始聊天，或去岗位页面联系雇主
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-5"
              onClick={() => navigate('/find-jobs')}
            >
              浏览岗位
            </Button>
          </div>
        ) : (
          <>
            {/* 聊天头部 */}
            <div className="px-5 py-3.5 bg-white border-b border-gray-100 flex items-center gap-3">
              <button
                onClick={() => setActiveSession(null)}
                className="sm:hidden p-1.5 -ml-1.5 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </button>
              <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {partner?.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900">{partner?.name}</div>
                <div className="text-xs text-gray-400 truncate">
                  {activeSession.job?.title}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/find-jobs`)}
                className="text-xs"
              >
                <Briefcase className="w-3.5 h-3.5 mr-1" />
                查看岗位
              </Button>
            </div>

            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50">
              {loadingMessages ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                  <p className="text-sm text-gray-400">暂无消息，发送第一条消息吧</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg, idx) => {
                    const isMine = msg.senderId === user?.id
                    const showAvatar = idx === 0 || messages[idx - 1]?.senderId !== msg.senderId
                    return (
                      <div
                        key={msg.id}
                        className={cn('flex gap-2', isMine ? 'justify-end' : 'justify-start')}
                      >
                        {!isMine && showAvatar && (
                          <div className="w-7 h-7 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 mt-1">
                            {msg.sender?.name?.charAt(0) || '?'}
                          </div>
                        )}
                        {!isMine && !showAvatar && <div className="w-7 shrink-0" />}
                        <div className="max-w-[75%]">
                          <div
                            className={cn(
                              'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
                              isMine
                                ? 'bg-primary-600 text-white rounded-br-md'
                                : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
                            )}
                          >
                            {msg.content}
                          </div>
                          <div className={cn(
                            'text-[10px] text-gray-400 mt-1',
                            isMine ? 'text-right' : 'text-left'
                          )}>
                            {formatTime(msg.createdAt)}
                          </div>
                        </div>
                        {isMine && (
                          <div className="w-7 h-7 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 mt-1">
                            {user?.name?.charAt(0) || '我'}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 输入框 */}
            <div className="px-4 py-3 bg-white border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="输入消息..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  className="flex-1"
                  disabled={!isConnected}
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || !isConnected}
                  size="icon"
                  className="shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              {!isConnected && (
                <p className="text-xs text-amber-500 mt-1.5">消息服务连接中，请稍候...</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
