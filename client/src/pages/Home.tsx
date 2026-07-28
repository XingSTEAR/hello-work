import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Briefcase, Shield, Zap, Award, Users, Search, MapPin, Clock,
  TrendingUp, Star, Heart, ArrowRight, CheckCircle, Building2, UserCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import JobCard from '@/components/JobCard'
import MapView from '@/components/MapView'
import type { Job } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { useChat } from '@/context/ChatContext'
import { useToast } from '@/components/ui/toast'

export default function Home() {
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([])
  const [mapJob, setMapJob] = useState<Job | null>(null)
  const [stats, setStats] = useState({ users: 0, jobs: 0, companies: 0, completed: 0 })
  const { isAuthenticated, user } = useAuth()
  const { startChat } = useChat()
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    loadFeaturedJobs()
    // 模拟统计数据
    setStats({
      users: 128000,
      jobs: 45000,
      companies: 12000,
      completed: 89000,
    })
  }, [])

  async function loadFeaturedJobs() {
    try {
      const res = await api.get('/jobs?limit=3')
      if (res.data.success) {
        setFeaturedJobs(res.data.data)
      }
    } catch {
      setFeaturedJobs([
        {
          id: '1', title: '周末餐饮服务员', description: '高端餐厅招聘周末兼职服务员，环境优雅，日结薪资',
          category: '餐饮服务', salary: '200', salaryType: 'DAILY', location: '北京市朝阳区',
          address: '朝阳区建国路88号', latitude: 39.9087, longitude: 116.4605,
          startDate: '2026-08-01', workHours: '10:00-18:00',
          headCount: 5, hiredCount: 2, status: 'OPEN', isInsured: true,
          tags: '日结,提供工作餐', views: 328, employerId: 'e1',
          company: { id: 'c1', name: '星选餐饮集团', level: 'A', isVerified: true, userId: 'e1' },
          createdAt: '', updatedAt: '',
        } as Job,
        {
          id: '2', title: '电商仓库分拣员', description: '大型电商仓库急聘分拣打包人员，工作简单易上手',
          category: '物流配送', salary: '25', salaryType: 'HOURLY', location: '上海市浦东新区',
          address: '浦东新区物流园区', latitude: 31.2304, longitude: 121.4737,
          startDate: '2026-08-03', workHours: '08:00-20:00',
          headCount: 20, hiredCount: 8, status: 'OPEN', isInsured: true,
          tags: '时薪,包住宿', views: 512, employerId: 'e2',
          company: { id: 'c2', name: '速达物流', level: 'S', isVerified: true, userId: 'e2' },
          createdAt: '', updatedAt: '',
        } as Job,
        {
          id: '3', title: '展会临时引导员', description: '国际会展中心招聘为期3天的展会引导员，形象良好即可',
          category: '活动展会', salary: '180', salaryType: 'DAILY', location: '广州市海珠区',
          address: '海珠区琶洲会展中心', latitude: 23.1058, longitude: 113.3585,
          startDate: '2026-08-05', workHours: '09:00-17:00',
          headCount: 15, hiredCount: 3, status: 'OPEN', isInsured: false,
          tags: '日结,短期', views: 205, employerId: 'e3',
          company: { id: 'c3', name: '广博会展', level: 'B', isVerified: true, userId: 'e3' },
          createdAt: '', updatedAt: '',
        } as Job,
      ])
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
    await startChat(job.id, job.employerId)
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-primary-950 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(249,115,22,0.1),transparent_50%)]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary-400" />
              </div>
              <span className="text-sm text-primary-300 font-medium bg-primary-500/10 px-3 py-1 rounded-full">
                HELLO WORK 零工枢纽
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              中国领先的
              <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent"> 数字化零工经济平台</span>
            </h1>

            <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-2xl">
              连接企业与灵活劳动者，以「薪酬担保日结+按单保险+AI法律保障」三大机制，
              重新定义零工经济的信任标准。让每一份零工都有保障，让每一次合作都可信赖。
            </p>

            <div className="flex flex-wrap gap-3">
              <Button size="lg" variant="accent" onClick={() => navigate('/register')} className="px-8">
                免费注册
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="secondary" onClick={() => navigate('/jobs')}>
                <Search className="w-4 h-4 mr-2" />
                浏览岗位
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16">
            {[
              { icon: Users, label: '注册用户', value: `${(stats.users / 10000).toFixed(0)}万+` },
              { icon: Briefcase, label: '岗位发布', value: `${(stats.jobs / 10000).toFixed(0)}万+` },
              { icon: Building2, label: '合作企业', value: `${(stats.companies / 10000).toFixed(1)}万+` },
              { icon: CheckCircle, label: '完成用工', value: `${(stats.completed / 10000).toFixed(0)}万+` },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <stat.icon className="w-6 h-6 text-primary-400 mb-3" />
                <div className="text-2xl sm:text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50',
                title: '薪酬担保日结', desc: '平台担保资金，完工当日自动结算，零拖欠风险'
              },
              {
                icon: Heart, color: 'text-red-600', bg: 'bg-red-50',
                title: '按单人身保险', desc: '每笔订单自动投保，工伤意外有保障，安心工作每一天'
              },
              {
                icon: Zap, color: 'text-accent-600', bg: 'bg-accent-50',
                title: 'AI法律保障', desc: '智能合同审查+在线纠纷调解，维护双方合法权益'
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Introduction */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title">为什么选择 HELLO WORK？</h2>
          <p className="section-subtitle">
            我们不只是连接供需，更构建了一个完整的零工生态保障体系
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {/* For Workers */}
            <div className="relative bg-gradient-to-br from-primary-50 to-white border border-primary-100 rounded-2xl p-8">
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mb-5">
                <UserCheck className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">为劳动者打造的零工入口</h3>
              <ul className="space-y-3 mb-6">
                {[
                  '海量日结岗位，覆盖餐饮、物流、零售等7大行业',
                  '薪酬担保机制，完工自动结算，杜绝拖欠',
                  '按单免费保险，工作期间全程保障',
                  '信用等级成长，高等级享优先推荐和更高日薪',
                  '一键联系雇主，在线沟通效率更高',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button onClick={() => navigate('/register')}>
                劳动者注册
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>

            {/* For Employers */}
            <div className="relative bg-gradient-to-br from-accent-50 to-white border border-accent-100 rounded-2xl p-8">
              <div className="w-14 h-14 bg-accent-100 rounded-2xl flex items-center justify-center mb-5">
                <Building2 className="w-7 h-7 text-accent-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">为企业打造的灵活用工入口</h3>
              <ul className="space-y-3 mb-6">
                {[
                  '快速发布岗位需求，覆盖全国主要城市',
                  '精准匹配推荐，智能算法筛选合适候选人',
                  '支持高德地图标注用工地点，一目了然',
                  '企业信用等级体系（B/A/S三级），优质企业获更多曝光',
                  '在线管理应聘者，一站式完成招聘流程',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="accent" onClick={() => navigate('/register')}>
                企业注册
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title">热门岗位推荐</h2>
          <p className="section-subtitle">
            精选优质零工岗位，日结/时薪/月薪灵活选择
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onViewMap={(j) => setMapJob(j)}
                onChat={handleChat}
                onApply={() => navigate(isAuthenticated ? '#' : '/login')}
              />
            ))}
          </div>

          <div className="text-center mt-10">
            <Button variant="outline" size="lg" onClick={() => navigate('/jobs')}>
              查看更多岗位
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title">三步开始你的零工之旅</h2>
          <p className="section-subtitle">简单、高效、有保障</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {[
              {
                step: '01',
                icon: UserCheck,
                title: '免费注册认证',
                desc: '手机号快速注册，实名认证保障交易安全。选择你的角色，劳动者或企业雇主。',
              },
              {
                step: '02',
                icon: Search,
                title: '智能匹配岗位',
                desc: '完善个人资料或发布岗位需求，AI算法精准匹配最合适的零工机会。',
              },
              {
                step: '03',
                icon: Shield,
                title: '安全交易保障',
                desc: '平台担保薪酬日结，按单投保，法律保障。让每一次合作都有可靠后盾。',
              },
            ].map((item, i) => (
              <div key={i} className="relative text-center p-8">
                <div className="text-6xl font-bold text-gray-100 absolute top-0 left-1/2 -translate-x-1/2 select-none">
                  {item.step}
                </div>
                <div className="relative">
                  <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-16 right-0 translate-x-1/2 w-12 h-0.5 bg-gray-200">
                    <div className="w-2 h-2 bg-primary-500 rounded-full absolute top-1/2 -translate-y-1/2 right-0" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            准备好开启你的零工之旅了吗？
          </h2>
          <p className="text-primary-100 mb-8 text-lg">
            立即注册，享受薪酬担保+保险保障+法律护航的全方位零工服务
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button size="lg" variant="secondary" onClick={() => navigate('/register')}>
              免费注册（劳动者）
            </Button>
            <Button size="lg" className="bg-white/10 hover:bg-white/20 text-white border border-white/20" onClick={() => navigate('/register')}>
              企业入驻
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

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
