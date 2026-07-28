import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Briefcase, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/ui/toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast('error', '请填写邮箱和密码')
      return
    }
    setLoading(true)
    const success = await login(email, password)
    setLoading(false)
    if (success) {
      toast('success', '登录成功！')
      navigate('/')
    } else {
      toast('error', '邮箱或密码错误')
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-bold text-gray-900">HELLO WORK</span>
              <span className="text-[11px] text-primary-600 font-medium block -mt-0.5">零工枢纽</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">欢迎回来</h1>
          <p className="text-sm text-gray-500 mt-1">登录你的HELLO WORK账号</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <Mail className="w-3.5 h-3.5" /> 邮箱
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱地址"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <Lock className="w-3.5 h-3.5" /> 密码
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </Button>

          <div className="text-center text-sm text-gray-500 pt-2">
            还没有账号？{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:underline">
              免费注册
            </Link>
          </div>

          {/* Demo accounts */}
          <div className="border-t pt-4 mt-2">
            <p className="text-xs text-gray-400 text-center mb-3">演示账号（点击快速填充）</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setEmail('worker@test.com'); setPassword('123456') }}
                className="text-xs text-left p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-gray-700">劳动者账号</div>
                <div className="text-gray-400">worker@test.com</div>
              </button>
              <button
                type="button"
                onClick={() => { setEmail('employer@test.com'); setPassword('123456') }}
                className="text-xs text-left p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-gray-700">企业账号</div>
                <div className="text-gray-400">employer@test.com</div>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
