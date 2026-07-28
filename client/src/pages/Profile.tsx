import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  User, Briefcase, Calendar, Star, TrendingUp, Shield, Award,
  MapPin, Phone, Mail, Clock, DollarSign, Edit, Settings, LogOut,
  FileText, CheckCircle, XCircle, Clock4, MessageCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'
import { useChat } from '@/context/ChatContext'
import { getLevelColor, getLevelName, formatDateTime } from '@/lib/utils'
import api from '@/lib/api'
import type { Job, JobApplication } from '@/types'

export default function Profile() {
  const { isAuthenticated, user, logout } = useAuth()
  const { startChat } = useChat()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'info' | 'applications' | 'jobs' | 'history'>('info')
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [myJobs, setMyJobs] = useState<Job[]>([])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    loadData()
  }, [isAuthenticated, user])

  async function loadData() {
    try {
      const [appsRes, jobsRes] = await Promise.all([
        api.get('/jobs/applications/my'),
        api.get('/jobs/my'),
      ])
      if (appsRes.data.success) setApplications(appsRes.data.data || [])
      if (jobsRes.data.success) setMyJobs(jobsRes.data.data || [])
    } catch {
      setApplications(getMockApplications())
    }
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500">请先登录</p>
          <Button className="mt-4" onClick={() => navigate('/login')}>前往登录</Button>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'info' as const, label: '个人资料', icon: User },
    ...(user.role === 'WORKER' ? [{ id: 'applications' as const, label: '我的报名', icon: FileText }] : []),
    ...(user.role === 'EMPLOYER' ? [{ id: 'jobs' as const, label: '我的发布', icon: Briefcase }] : []),
  ]

  const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    PENDING: { label: '待审核', color: 'text-yellow-600 bg-yellow-50', icon: <Clock4 className="w-3.5 h-3.5" /> },
    ACCEPTED: { label: '已通过', color: 'text-green-600 bg-green-50', icon: <CheckCircle className="w-3.5 h-3.5" /> },
    REJECTED: { label: '已拒绝', color: 'text-red-600 bg-red-50', icon: <XCircle className="w-3.5 h-3.5" /> },
    COMPLETED: { label: '已完成', color: 'text-blue-600 bg-blue-50', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {user.name?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <Badge variant={user.role === 'EMPLOYER' ? 'warning' : 'default'}>
                  {user.role === 'WORKER' ? '劳动者' : user.role === 'EMPLOYER' ? '企业雇主' : '管理员'}
                </Badge>
                {user.isVerified && (
                  <Badge variant="success">
                    <Shield className="w-3 h-3 mr-1" /> 已认证
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                {user.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> {user.phone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> {user.email}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  注册于 {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-1.5" /> 编辑资料
              </Button>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-1.5" /> 退出
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-1">
                <Star className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="text-xl font-bold text-gray-900">{user.rating.toFixed(1)}</div>
              <div className="text-xs text-gray-500">评分</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-1">
                <Award className={`w-4 h-4 ${user.level === 'DIAMOND' ? 'text-blue-500' : user.level === 'GOLD' ? 'text-yellow-500' : 'text-gray-400'}`} />
              </div>
              <div className={`text-lg font-bold px-2 py-0.5 rounded ${getLevelColor(user.level)}`}>
                {getLevelName(user.level)}
              </div>
              <div className="text-xs text-gray-500">等级</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="w-4 h-4 text-primary-500" />
              </div>
              <div className="text-xl font-bold text-gray-900">{user.points}</div>
              <div className="text-xs text-gray-500">积分</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-1">
                <DollarSign className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-xl font-bold text-gray-900">¥{user.balance.toFixed(2)}</div>
              <div className="text-xs text-gray-500">账户余额</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-100 bg-white sticky top-16 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-0 -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Personal Info */}
        {activeTab === 'info' && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">个人资料</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-400">姓名</div>
                  <div className="text-sm font-medium">{user.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-400">邮箱</div>
                  <div className="text-sm font-medium">{user.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-400">手机</div>
                  <div className="text-sm font-medium">{user.phone || '未填写'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Award className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-400">等级</div>
                  <span className={`badge ${getLevelColor(user.level)}`}>{getLevelName(user.level)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Applications (Worker) */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">我的岗位报名</h2>
            {applications.length === 0 ? (
              <div className="card p-12 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">还没有报名任何岗位</p>
                <Button onClick={() => navigate('/jobs')}>
                  <Briefcase className="w-4 h-4 mr-2" />
                  浏览岗位
                </Button>
              </div>
            ) : (
              applications.map((app) => {
                const sc = statusConfig[app.status]
                return (
                  <div key={app.id} className="card p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 mb-1">{app.job?.title || '未知岗位'}</h3>
                        <p className="text-sm text-gray-500 mb-2">{app.message || '已提交报名申请'}</p>
                        <span className="text-xs text-gray-400">报名时间：{formatDateTime(app.createdAt)}</span>
                      </div>
                      <span className={`badge ${sc.color} shrink-0`}>
                        {sc.icon}
                        <span className="ml-1">{sc.label}</span>
                      </span>
                    </div>
                    {app.job?.employerId && app.job?.employerId !== user?.id && (
                      <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            const session = await startChat(app.jobId, app.job!.employerId!)
                            navigate(session ? `/messages/${session.id}` : '/messages')
                          }}
                        >
                          <MessageCircle className="w-3.5 h-3.5 mr-1" />
                          联系雇主
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* My Posted Jobs (Employer) */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">我发布的岗位</h2>
              <Button size="sm" onClick={() => navigate('/post')}>
                发布新岗位
              </Button>
            </div>
            {myJobs.length === 0 ? (
              <div className="card p-12 text-center">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">还没有发布任何岗位</p>
                <Button onClick={() => navigate('/post')}>发布第一个岗位</Button>
              </div>
            ) : (
              myJobs.map((job) => (
                <div key={job.id} className="card p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 mb-1">{job.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {job.workHours}</span>
                        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {job.salary}</span>
                      </div>
                    </div>
                    <Badge variant={job.status === 'OPEN' ? 'success' : job.status === 'FILLED' ? 'warning' : 'secondary'}>
                      {job.status === 'OPEN' ? '招聘中' : job.status === 'FILLED' ? '已招满' : '已关闭'}
                    </Badge>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2 text-xs text-gray-500">
                    <span>已报名：{job.applications?.length || 0} 人</span>
                    <span className="mx-1">|</span>
                    <span>已录用：{job.hiredCount}/{job.headCount}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="card p-12 text-center">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无历史记录</p>
          </div>
        )}
      </div>
    </div>
  )
}

function getMockApplications(): JobApplication[] {
  return [
    {
      id: 'a1', status: 'PENDING', message: '我有多年的餐饮服务经验',
      createdAt: '2026-07-28T10:30:00Z', updatedAt: '2026-07-28T10:30:00Z',
      jobId: '1', workerId: 'w1',
      job: { id: '1', title: '周末餐饮服务员', employerId: 'e1' },
    } as JobApplication,
    {
      id: 'a2', status: 'ACCEPTED', message: '随时可以到岗',
      createdAt: '2026-07-27T14:00:00Z', updatedAt: '2026-07-28T09:00:00Z',
      jobId: '2', workerId: 'w1',
      job: { id: '2', title: '电商仓库分拣员', employerId: 'e2' },
    } as JobApplication,
  ]
}
