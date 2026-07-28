import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X, Briefcase, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { useChat } from '@/context/ChatContext'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { path: '/', label: '平台首页' },
  { path: '/find-jobs', label: '找零工' },
  { path: '/post-job', label: '招零工' },
  { path: '/messages', label: '消息' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { isAuthenticated, user, logout } = useAuth()
  const { unreadCount } = useChat()

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">
              HELLO<span className="text-primary-600">WORK</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path))
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                {item.label}
                {item.path === '/messages' && unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
                    location.pathname === '/profile'
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {user?.name?.charAt(0) || '我'}
                  </div>
                  <span className="text-sm font-medium">我的</span>
                </Link>
                <Button variant="ghost" size="sm" onClick={logout}>
                  退出
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">登录</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">注册</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  location.pathname === item.path
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <span>{item.label}</span>
                {item.path === '/messages' && unreadCount > 0 && (
                  <span className="min-w-[20px] h-[20px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1.5">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  <MessageCircle className="w-4 h-4" /> 我的
                </Link>
                <button
                  onClick={() => { logout(); setMenuOpen(false) }}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-400 hover:bg-gray-50 rounded-lg"
                >
                  退出登录
                </button>
              </>
            ) : (
              <div className="flex gap-2 px-4 pt-2">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">登录</Button>
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1">
                  <Button size="sm" className="w-full">注册</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
