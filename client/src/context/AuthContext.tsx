import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { User, AuthState, ApiResponse } from '@/types'
import api from '@/lib/api'

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => void
  updateUser: (user: User) => void
}

interface RegisterData {
  email: string
  password: string
  name: string
  phone: string
  role: 'WORKER' | 'EMPLOYER'
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    isLoading: true,
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      try {
        const user = JSON.parse(savedUser)
        setState({ user, token, isAuthenticated: true, isLoading: false })
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setState({ user: null, token: null, isAuthenticated: false, isLoading: false })
      }
    } else {
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', { email, password })
      if (res.data.success && res.data.data) {
        const { user, token } = res.data.data
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setState({ user, token, isAuthenticated: true, isLoading: false })
        return true
      }
      return false
    } catch {
      return false
    }
  }, [])

  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    try {
      const res = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data)
      if (res.data.success && res.data.data) {
        const { user, token } = res.data.data
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        setState({ user, token, isAuthenticated: true, isLoading: false })
        return true
      }
      return false
    } catch {
      return false
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false })
  }, [])

  const updateUser = useCallback((user: User) => {
    localStorage.setItem('user', JSON.stringify(user))
    setState((prev) => ({ ...prev, user }))
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
