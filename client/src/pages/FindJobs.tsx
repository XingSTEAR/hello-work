import { useState, useEffect, useCallback } from 'react'
import { Search, Filter, MapPin, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import JobCard from '@/components/JobCard'
import MapView from '@/components/MapView'
import { useAuth } from '@/context/AuthContext'
import { useChat } from '@/context/ChatContext'
import { useToast } from '@/components/ui/toast'
import { useNavigate } from 'react-router-dom'
import { JOB_CATEGORIES, SALARY_TYPES } from '@/lib/utils'
import api from '@/lib/api'
import type { Job, JobFilters } from '@/types'

export default function FindJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<JobFilters>({})
  const [keyword, setKeyword] = useState('')
  const [mapJob, setMapJob] = useState<Job | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const { isAuthenticated, user } = useAuth()
  const { startChat } = useChat()
  const { toast } = useToast()
  const navigate = useNavigate()

  const loadJobs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.category && filters.category !== '全部') params.set('category', filters.category)
      if (filters.salaryType) params.set('salaryType', filters.salaryType)
      if (filters.location) params.set('location', filters.location)
      if (keyword) params.set('keyword', keyword)

      const res = await api.get(`/jobs?${params.toString()}`)
      if (res.data.success) {
        setJobs(res.data.data || [])
      }
    } catch {
      // Load mock data
      setJobs(getMockJobs())
    } finally {
      setLoading(false)
    }
  }, [filters, keyword])

  useEffect(() => {
    loadJobs()
  }, [loadJobs])

  const handleApply = async (job: Job) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (user?.role !== 'WORKER') {
      toast('info', '企业账号无法报名岗位，请使用劳动者账号')
      return
    }
    try {
      const res = await api.post(`/jobs/${job.id}/apply`)
      if (res.data.success) {
        toast('success', '报名成功！请等待雇主确认')
      } else {
        toast('error', res.data.error || '报名失败')
      }
    } catch {
      toast('error', '报名失败，请稍后重试')
    }
  }

  const handleChat = async (job: Job) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (job.employerId === user?.id) {
      toast('info', '不能和自己发布的岗位聊天')
      return
    }
    // 创建/获取聊天会话，然后跳转到消息页面
    const session = await startChat(job.id, job.employerId)
    if (session) {
      navigate(`/messages/${session.id}`)
    } else {
      navigate('/messages')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="搜索岗位名称、公司或技能关键词..."
                className="pl-10 pr-4"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadJobs()}
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              筛选
              {Object.values(filters).some(v => v) && (
                <span className="ml-1.5 w-2 h-2 bg-primary-500 rounded-full" />
              )}
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-50 animate-slide-up">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Category */}
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block font-medium">岗位分类</label>
                  <div className="flex flex-wrap gap-1.5">
                    {JOB_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setFilters(f => ({ ...f, category: f.category === cat ? undefined : cat }))}
                        className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                          (filters.category === cat || (!filters.category && cat === '全部'))
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Salary Type */}
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block font-medium">薪资类型</label>
                  <div className="flex flex-wrap gap-1.5">
                    {SALARY_TYPES.map((st) => (
                      <button
                        key={st.value}
                        onClick={() => setFilters(f => ({ ...f, salaryType: f.salaryType === st.value ? undefined : st.value }))}
                        className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                          filters.salaryType === st.value
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block font-medium">工作地点</label>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <Input
                      className="pl-8 h-8 text-xs"
                      placeholder="输入城市或区域..."
                      value={filters.location || ''}
                      onChange={(e) => setFilters(f => ({ ...f, location: e.target.value || undefined }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-3">
                <Button variant="ghost" size="sm" onClick={() => setFilters({})}>
                  <X className="w-3.5 h-3.5 mr-1" />
                  清除筛选
                </Button>
                <Button size="sm" onClick={loadJobs}>
                  应用筛选
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Job List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">找零工</h1>
            <p className="text-sm text-gray-500 mt-1">
              {loading ? '加载中...' : `共找到 ${jobs.length} 个岗位`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-4 bg-gray-100 rounded w-1/2 mb-4" />
                <div className="h-16 bg-gray-50 rounded mb-4" />
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="h-10 bg-gray-50 rounded" />
                  <div className="h-10 bg-gray-50 rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="h-9 bg-gray-100 rounded flex-1" />
                  <div className="h-9 bg-gray-100 rounded flex-1" />
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">暂无匹配岗位</h3>
            <p className="text-sm text-gray-400">尝试调整筛选条件或搜索关键词</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onViewMap={(j) => setMapJob(j)}
                onApply={handleApply}
                onChat={handleChat}
              />
            ))}
          </div>
        )}
      </div>

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

function getMockJobs(): Job[] {
  return [
    {
      id: '1', title: '周末餐饮服务员', description: '高端餐厅招聘周末兼职服务员，环境优雅，日结薪资，提供工作餐',
      category: '餐饮服务', salary: '200', salaryType: 'DAILY', location: '北京市朝阳区',
      address: '朝阳区建国路88号', latitude: 39.9087, longitude: 116.4605,
      startDate: '2026-08-01', workHours: '10:00-18:00',
      headCount: 5, hiredCount: 2, status: 'OPEN', isInsured: true,
      tags: '日结,提供工作餐', views: 328, employerId: 'e1',
      company: { id: 'c1', name: '星选餐饮集团', level: 'A', isVerified: true, userId: 'e1' },
      createdAt: '', updatedAt: '',
    },
    {
      id: '2', title: '电商仓库分拣员', description: '大型电商仓库急聘分拣打包人员，工作简单易上手，包住宿',
      category: '物流配送', salary: '25', salaryType: 'HOURLY', location: '上海市浦东新区',
      address: '浦东新区物流园区', latitude: 31.2304, longitude: 121.4737,
      startDate: '2026-08-03', workHours: '08:00-20:00',
      headCount: 20, hiredCount: 8, status: 'OPEN', isInsured: true,
      tags: '时薪,包住宿,简单易学', views: 512, employerId: 'e2',
      company: { id: 'c2', name: '速达物流', level: 'S', isVerified: true, userId: 'e2' },
      createdAt: '', updatedAt: '',
    },
    {
      id: '3', title: '展会临时引导员', description: '国际会展中心招聘为期3天的展会引导员，形象良好即可',
      category: '活动展会', salary: '180', salaryType: 'DAILY', location: '广州市海珠区',
      address: '海珠区琶洲会展中心', latitude: 23.1058, longitude: 113.3585,
      startDate: '2026-08-05', workHours: '09:00-17:00',
      headCount: 15, hiredCount: 3, status: 'OPEN', isInsured: false,
      tags: '日结,短期,轻松', views: 205, employerId: 'e3',
      company: { id: 'c3', name: '广博会展', level: 'B', isVerified: true, userId: 'e3' },
      createdAt: '', updatedAt: '',
    },
    {
      id: '4', title: '高端家政保洁师', description: '为高端住宅提供专业保洁服务，有经验者优先，提供培训',
      category: '家政服务', salary: '50', salaryType: 'HOURLY', location: '深圳市南山区',
      address: '南山区科技园', latitude: 22.5431, longitude: 113.9494,
      startDate: '2026-08-10', workHours: '08:00-16:00',
      headCount: 10, hiredCount: 1, status: 'OPEN', isInsured: true,
      tags: '高薪,培训上岗', views: 189, employerId: 'e4',
      company: { id: 'c4', name: '净家服务', level: 'A', isVerified: true, userId: 'e4' },
      createdAt: '', updatedAt: '',
    },
    {
      id: '5', title: '商场促销导购', description: '周末商场品牌促销活动，需热情外向，有销售经验优先',
      category: '零售促销', salary: '150', salaryType: 'DAILY', location: '成都市锦江区',
      address: '锦江区春熙路', latitude: 30.6598, longitude: 104.0804,
      startDate: '2026-08-02', workHours: '10:00-20:00',
      headCount: 8, hiredCount: 4, status: 'OPEN', isInsured: false,
      tags: '日结,提成,周末', views: 276, employerId: 'e5',
      company: { id: 'c5', name: '百家商贸', level: 'B', isVerified: true, userId: 'e5' },
      createdAt: '', updatedAt: '',
    },
    {
      id: '6', title: '临时数据录入员', description: '企业档案数字化项目，招聘数据录入人员，电脑操作熟练即可',
      category: '临时文员', salary: '160', salaryType: 'DAILY', location: '杭州市西湖区',
      address: '西湖区文三路', latitude: 30.2741, longitude: 120.1550,
      startDate: '2026-08-08', workHours: '09:00-18:00',
      headCount: 12, hiredCount: 0, status: 'OPEN', isInsured: true,
      tags: '日结,坐班,简单', views: 145, employerId: 'e6',
      company: { id: 'c6', name: '数智科技', level: 'A', isVerified: true, userId: 'e6' },
      createdAt: '', updatedAt: '',
    },
  ] as Job[]
}
