import { MapPin, Clock, Briefcase, Shield, Eye, Users, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Job } from '@/types'
import { formatDate, formatSalary, getLevelColor, getLevelName, cn } from '@/lib/utils'

interface JobCardProps {
  job: Job
  onViewMap?: (job: Job) => void
  onApply?: (job: Job) => void
  onChat?: (job: Job) => void
  showApply?: boolean
}

export default function JobCard({ job, onViewMap, onApply, onChat, showApply = true }: JobCardProps) {
  const tags = job.tags ? job.tags.split(',').filter(Boolean) : []

  return (
    <div className={cn(
      'card p-6 group',
      job.isInsured && 'ring-1 ring-green-100'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{job.title}</h3>
            {job.isInsured && (
              <span className="shrink-0 flex items-center gap-1 text-[11px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                <Shield className="w-3 h-3" />
                已投保
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              {job.category}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {job.views} 次浏览
            </span>
          </div>
        </div>
        <div className="text-right shrink-0 ml-4">
          <div className="text-xl font-bold text-accent-600">
            {formatSalary(job.salary, job.salaryType)}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            {job.salaryType === 'DAILY' ? '日结' : job.salaryType === 'HOURLY' ? '时薪' : '月薪'}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{job.description}</p>

      {/* Info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-2.5">
          <div className="text-[11px] text-gray-400 mb-0.5">工作时间</div>
          <div className="text-xs font-medium text-gray-700 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {job.workHours}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5">
          <div className="text-[11px] text-gray-400 mb-0.5">开始日期</div>
          <div className="text-xs font-medium text-gray-700 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(job.startDate)}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5">
          <div className="text-[11px] text-gray-400 mb-0.5">招聘人数</div>
          <div className="text-xs font-medium text-gray-700 flex items-center gap-1">
            <Users className="w-3 h-3" />
            {job.hiredCount}/{job.headCount}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5">
          <div className="text-[11px] text-gray-400 mb-0.5">雇主等级</div>
          <div className="text-xs font-medium flex items-center gap-1">
            <span className={cn('px-1.5 py-0.5 rounded text-[10px]', getLevelColor(job.company?.level || 'B'))}>
              {getLevelName(job.company?.level || 'B')}
            </span>
          </div>
        </div>
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.map((tag, i) => (
            <span key={i} className="text-[11px] bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full">
              {tag.trim()}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      {showApply && (
        <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={() => onApply?.(job)}
          >
            立即报名
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onChat?.(job)}
          >
            联系雇主
          </Button>
          {job.latitude && job.longitude && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewMap?.(job)}
              title="查看地图"
            >
              <MapPin className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
