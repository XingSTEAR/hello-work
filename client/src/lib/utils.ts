import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTime(date: string): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const targetDay = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const dayDiff = (today.getTime() - targetDay.getTime()) / 86400000

  if (dayDiff === 0) {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (dayDiff === 1) {
    return '昨天 ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (dayDiff < 7) {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return days[d.getDay()]
  } else {
    return `${d.getMonth() + 1}/${d.getDate()}`
  }
}

export function formatSalary(salary: string, type: string): string {
  switch (type) {
    case 'DAILY':
      return `¥${salary}/天`
    case 'HOURLY':
      return `¥${salary}/小时`
    case 'MONTHLY':
      return `¥${salary}/月`
    default:
      return salary
  }
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    '餐饮服务': 'utensils-crossed',
    '物流配送': 'truck',
    '零售促销': 'shopping-bag',
    '家政服务': 'home',
    '临时文员': 'file-text',
    '活动展会': 'calendar-check',
    '其他': 'briefcase',
  }
  return icons[category] || 'briefcase'
}

export function getLevelColor(level: string): string {
  const colors: Record<string, string> = {
    'BRONZE': 'text-amber-600 bg-amber-50',
    'SILVER': 'text-slate-500 bg-slate-50',
    'GOLD': 'text-yellow-600 bg-yellow-50',
    'DIAMOND': 'text-blue-600 bg-blue-50',
    'B': 'text-blue-600 bg-blue-50',
    'A': 'text-green-600 bg-green-50',
    'S': 'text-purple-600 bg-purple-50',
  }
  return colors[level] || 'text-gray-600 bg-gray-50'
}

export function getLevelName(level: string): string {
  const names: Record<string, string> = {
    'BRONZE': '青铜',
    'SILVER': '白银',
    'GOLD': '黄金',
    'DIAMOND': '钻石',
    'B': 'B级',
    'A': 'A级',
    'S': 'S级',
  }
  return names[level] || level
}

export const JOB_CATEGORIES = [
  '全部',
  '餐饮服务',
  '物流配送',
  '零售促销',
  '家政服务',
  '临时文员',
  '活动展会',
  '其他',
]

export const SALARY_TYPES = [
  { value: 'DAILY', label: '日结' },
  { value: 'HOURLY', label: '时薪' },
  { value: 'MONTHLY', label: '月薪' },
]
