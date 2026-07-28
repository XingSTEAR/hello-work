import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ChatProvider } from '@/context/ChatContext'
import { ToastProvider } from '@/components/ui/toast'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import FindJobs from '@/pages/FindJobs'
import PostJob from '@/pages/PostJob'
import Messages from '@/pages/Messages'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Profile from '@/pages/Profile'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ChatProvider>
          <ToastProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/find-jobs" element={<FindJobs />} />
                <Route path="/post-job" element={<PostJob />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/messages/:sessionId" element={<Messages />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Routes>
          </ToastProvider>
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
