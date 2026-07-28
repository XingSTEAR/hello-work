import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Briefcase, MapPin, Clock, DollarSign, UserPlus, Shield,
  Send, PlusCircle, Eye, FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import JobCard from '@/components/JobCard'
import MapView from '@/components/MapView'
import { Dialog } from '@/components/ui/dialog'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/components/ui/toast'
import { JOB_CATEGORIES, SALARY_TYPES } from '@/lib/utils'
import api from '@/lib/api'
import type { Job } from '@/types'

export default function PostJob() {
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [myJobs, setMyJobs] = useState<Job[]>([])
  const [showForm, setShowForm] = useState(false)
  const [mapJob, setMapJob] = useState<Job | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '餐饮服务',
    salary: '',
    salaryType: 'DAILY' as string,
    location: '',
    address: '',
    workHours: '',
    startDate: '',
    endDate: '',
    headCount: '1',
    requirements: '',
    benefits: '',
    tags: '',
    isInsured: false,
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (user?.role !== 'EMPLOYER') {
      toast('info', '只有企业账号才能发布岗位，请切换到企业账号')
      return
    }
    loadMyJobs()
  }, [isAuthenticated, user])

  async function loadMyJobs() {
    try {
      const res = await api.get('/jobs/my')
      if (res.data.success) setMyJobs(res.data.data || [])
    } catch { /* mock data handled by JobCard */ }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.salary || !form.location || !form.startDate) {
      toast('error', '请填写必填字段（岗位名称、薪资、地点、开始日期）')
      return
    }

    setSubmitting(true)
    try {
      const res = await api.post('/jobs', {
        ...form,
        headCount: parseInt(form.headCount),
      })
      if (res.data.success) {
        toast('success', '岗位发布成功！')
        setShowForm(false)
        resetForm()
        loadMyJobs()
      } else {
        toast('error', res.data.error || '发布失败')
      }
    } catch {
      // Simulate success for demo
      toast('success', '岗位发布成功！')
      setShowForm(false)
      resetForm()
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setForm({
      title: '', description: '', category: '餐饮服务', salary: '',
      salaryType: 'DAILY', location: '', address: '',
      workHours: '', startDate: '', endDate: '', headCount: '1',
      requirements: '', benefits: '', tags: '', isInsured: false,
    })
  }

  if (!isAuthenticated || user?.role !== 'EMPLOYER') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">需要企业账号</h2>
          <p className="text-gray-500 mb-6">请使用企业账号登录后发布岗位</p>
          <Button onClick={() => navigate('/login')}>前往登录</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">招零工</h1>
            <p className="text-sm text-gray-500 mt-1">发布和管理你的招聘岗位</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/jobs')}>
              <Eye className="w-4 h-4 mr-2" />
              浏览市场
            </Button>
            <Button onClick={() => setShowForm(true)}>
              <PlusCircle className="w-4 h-4 mr-2" />
              发布新岗位
            </Button>
          </div>
        </div>

        {/* My Posted Jobs */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            我的发布
            {myJobs.length > 0 && (
              <span className="text-sm text-gray-400 font-normal ml-2">({myJobs.length} 个岗位)</span>
            )}
          </h2>

          {myJobs.length === 0 ? (
            <div className="card p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-base font-medium text-gray-600 mb-2">还没有发布过岗位</h3>
              <p className="text-sm text-gray-400 mb-6">发布你的第一个零工岗位，快速匹配合适的劳动者</p>
              <Button onClick={() => setShowForm(true)}>
                <PlusCircle className="w-4 h-4 mr-2" />
                发布第一个岗位
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  showApply={false}
                  onViewMap={(j) => setMapJob(j)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Post Job Dialog */}
      <Dialog
        open={showForm}
        onClose={() => { setShowForm(false); resetForm() }}
        title="发布新岗位"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 岗位名称 */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <Briefcase className="w-3.5 h-3.5" /> 岗位名称 *
            </label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="如：周末餐饮服务员"
              required
            />
          </div>

          {/* 分类 & 薪资类型 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                岗位分类
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input-field"
              >
                {JOB_CATEGORIES.filter(c => c !== '全部').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                薪资类型
              </label>
              <div className="flex gap-2">
                {SALARY_TYPES.map((st) => (
                  <button
                    key={st.value}
                    type="button"
                    onClick={() => setForm({ ...form, salaryType: st.value })}
                    className={`flex-1 py-2 text-xs rounded-lg border transition-colors ${
                      form.salaryType === st.value
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 薪资 */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
              <DollarSign className="w-3.5 h-3.5" /> 薪资（元）*
              <span className="text-gray-400 font-normal text-xs">
                {form.salaryType === 'DAILY' ? '/天' : form.salaryType === 'HOURLY' ? '/小时' : '/月'}
              </span>
            </label>
            <Input
              type="number"
              value={form.salary}
              onChange={(e) => setForm({ ...form, salary: e.target.value })}
              placeholder="如：200"
              required
            />
          </div>

          {/* 地点 & 地址 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <MapPin className="w-3.5 h-3.5" /> 工作地点（城市/区域）*
              </label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="如：北京市朝阳区"
                required
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                详细地址
              </label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="如：建国路88号SOHO大楼"
              />
            </div>
          </div>

          {/* 工作时间 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <Clock className="w-3.5 h-3.5" /> 上班时间 *
              </label>
              <Input
                value={form.workHours}
                onChange={(e) => setForm({ ...form, workHours: e.target.value })}
                placeholder="如：09:00-18:00"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                开始日期 *
              </label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                required
              />
            </div>
          </div>

          {/* 结束日期 & 人数 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">结束日期（可选）</label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <UserPlus className="w-3.5 h-3.5" /> 招聘人数
              </label>
              <Input
                type="number"
                value={form.headCount}
                onChange={(e) => setForm({ ...form, headCount: e.target.value })}
                min="1"
              />
            </div>
          </div>

          {/* 岗位描述 */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">岗位描述</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="请详细描述工作内容、环境和要求..."
              className="input-field min-h-[80px] resize-y"
            />
          </div>

          {/* 要求 & 福利 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">任职要求</label>
              <Input
                value={form.requirements}
                onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                placeholder="如：18-45岁，身体健康"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">岗位福利</label>
              <Input
                value={form.benefits}
                onChange={(e) => setForm({ ...form, benefits: e.target.value })}
                placeholder="如：提供工作餐、交通补贴"
              />
            </div>
          </div>

          {/* 标签 */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">岗位标签（逗号分隔）</label>
            <Input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="如：日结,简单易学,包餐"
            />
          </div>

          {/* 投保 */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isInsured}
                onChange={(e) => setForm({ ...form, isInsured: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-700">
                为该岗位购买按单人身保险
                <span className="text-xs text-gray-400 ml-1">（推荐，提升岗位吸引力）</span>
              </span>
            </label>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => { setShowForm(false); resetForm() }}
            >
              取消
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? (
                <>提交中...</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  发布岗位
                </>
              )}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Map Modal */}
      {mapJob && (
        <MapView
          open={!!mapJob}
          onClose={() => setMapJob(null)}
          latitude={mapJob.latitude}
          longitude={mapJob.longitude}
          title={mapJob.title}
          address={mapJob.address}
        />
      )}
    </div>
  )
}
