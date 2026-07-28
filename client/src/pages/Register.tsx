import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Briefcase, Mail, Lock, User, Phone, UserCheck, Building2, Eye, EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/ui/toast'

export default function Register() {
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '', name: '', phone: '', role: 'WORKER' as 'WORKER' | 'EMPLOYER'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password || !form.name || !form.phone) {
      toast('error', '请填写所有必填字段')
      return
    }
    if (form.password !== form.confirmPassword) {
      toast('error', '两次密码输入不一致')
      return
    }
    if (form.password.length < 6) {
      toast('error', '密码至少需要6个字符')
      return
    }
    setLoading(true)
    const success = await register({
      email: form.email,
      password: form.password,
      name: form.name,
      phone: form.phone,
      role: form.role,
    })
    setLoading(false)
    if (success) {
      toast('success', '注册成功！')
      navigate('/')
    } else {
      toast('error', '注册失败，请检查信息或更换邮箱')
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
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
          <h1 className="text-2xl font-bold text-gray-900">创建你的账号</h1>
          <p className="text-sm text-gray-500 mt-1">免费注册，开启零工之旅</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {/* Role Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">选择账号类型</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'WORKER' })}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  form.role === 'WORKER'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <UserCheck className={`w-5 h-5 mb-2 ${form.role === 'WORKER' ? 'text-primary-600' : 'text-gray-400'}`} />
                <div className="text-sm font-medium text-gray-900">劳动者</div>
                <div className="text-[11px] text-gray-400 mt-0.5">找零工、接单赚钱</div>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'EMPLOYER' })}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  form.role === 'EMPLOYER'
                    ? 'border-accent-500 bg-accent-50'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <Building2 className={`w-5 h-5 mb-2 ${form.role === 'EMPLOYER' ? 'text-accent-600' : 'text-gray-400'}`} />
                <div className="text-sm font-medium text-gray-900">企业雇主</div>
                <div className="text-[11px] text-gray-400 mt-0.5">发布岗位、招揽人才</div>
              </button>
            </div>
          </div>

          {/* Name & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <User className="w-3.5 h-3.5" /> {form.role === 'EMPLOYER' ? '企业名称' : '姓名'} *
              </label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={form.role === 'EMPLOYER' ? '企业名称' : '你的姓名'}
                required
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <Phone className="w-3.5 h-3.5" /> 手机号 *
              </label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="手机号码"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <Mail className="w-3.5 h-3.5" /> 邮箱 *
            </label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="请输入邮箱地址"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <Lock className="w-3.5 h-3.5" /> 密码 *
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="至少6个字符"
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

          {/* Confirm Password */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <Lock className="w-3.5 h-3.5" /> 确认密码 *
            </label>
            <Input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="请再次输入密码"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '注册中...' : '免费注册'}
          </Button>

          <p className="text-xs text-gray-400 text-center">
            注册即表示同意{' '}
            <a href="#" className="text-primary-600 hover:underline">用户协议</a>
            {' '}和{' '}
            <a href="#" className="text-primary-600 hover:underline">隐私政策</a>
          </p>

          <div className="text-center text-sm text-gray-500 pt-2">
            已有账号？{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">
              立即登录
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
