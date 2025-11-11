'use client'

import { usePathname } from 'next/navigation'
import Sidebar from '@/components/chat/Sidebar/Sidebar'
import { Suspense } from 'react'

export default function AppShell({ 
  children,
  hasEnvToken,
  envToken 
}: { 
  children: React.ReactNode
  hasEnvToken: boolean
  envToken: string
}) {
  const pathname = usePathname()
  
  // Don't show sidebar on login/signup pages
  const isAuthPage = pathname === '/login' || pathname === '/signup'
  
  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background font-geist">
      <Suspense fallback={<div>Loading...</div>}>
        <Sidebar hasEnvToken={hasEnvToken} envToken={envToken} />
      </Suspense>
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
