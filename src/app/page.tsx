'use client'
import { ChatArea } from '@/components/chat/ChatArea'
import { Suspense } from 'react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function Home() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div>Loading...</div>}>
        <ChatArea />
      </Suspense>
    </ProtectedRoute>
  )
}
