export interface User {
  id: string
  email: string
  name: string
  phone?: string
  role: 'WORKER' | 'EMPLOYER' | 'ADMIN'
  avatar?: string
  bio?: string
  balance: number
  rating: number
  level: 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND'
  points: number
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface Company {
  id: string
  name: string
  logo?: string
  description?: string
  industry?: string
  scale?: string
  address?: string
  license?: string
  level: 'B' | 'A' | 'S'
  isVerified: boolean
  userId: string
}

export interface Job {
  id: string
  title: string
  description: string
  category: string
  salary: string
  salaryType: 'DAILY' | 'HOURLY' | 'MONTHLY'
  location: string
  address: string
  latitude?: number
  longitude?: number
  startDate: string
  endDate?: string
  workHours: string
  headCount: number
  hiredCount: number
  status: 'OPEN' | 'CLOSED' | 'FILLED'
  requirements?: string
  benefits?: string
  isInsured: boolean
  tags: string
  views: number
  createdAt: string
  updatedAt: string
  employerId: string
  companyId?: string
  employer?: User
  company?: Company
  applications?: JobApplication[]
}

export interface JobApplication {
  id: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED'
  message?: string
  createdAt: string
  updatedAt: string
  jobId: string
  workerId: string
  job?: Job
  worker?: User
}

export interface ChatSession {
  id: string
  createdAt: string
  updatedAt: string
  jobId?: string
  userId: string
  employerId: string
  user?: User
  employer?: User
  job?: Job
  messages: Message[]
}

export interface Message {
  id: string
  content: string
  isRead: boolean
  createdAt: string
  sessionId: string
  senderId: string
  receiverId: string
  sender?: User
}

export interface Transaction {
  id: string
  amount: number
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT' | 'REFUND' | 'GURANTEE'
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  description?: string
  createdAt: string
  userId: string
  jobId?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface JobFilters {
  category?: string
  salaryType?: string
  location?: string
  keyword?: string
  minSalary?: string
  maxSalary?: string
}
