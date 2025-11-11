import type { Metadata } from 'next'
import { DM_Mono, Geist } from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/lib/auth/AuthContext'
import { ThemeProvider } from '@/components/theme-provider'
import { CommandMenu } from '@/components/CommandMenu'
import './globals.css'
import AppShell from '@/components/AppShell'

const geistSans = Geist({
  variable: '--font-geist-sans',
  weight: '400',
  subsets: ['latin']
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: '400'
})

export const metadata: Metadata = {
  title: 'Intelligent Agent Analysis & Chat UI',
  description:
    'A modern chat interface for AI agents built with Next.js, Tailwind CSS, and TypeScript. Engage in dynamic conversations and data analysis with ease.',
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  // Check if OS_SECURITY_KEY is defined
  const hasEnvToken = !!process.env.NEXT_PUBLIC_OS_SECURITY_KEY
  const envToken = process.env.NEXT_PUBLIC_OS_SECURITY_KEY || ''

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${dmMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <NuqsAdapter>
              <AppShell hasEnvToken={hasEnvToken} envToken={envToken}>
                {children}
              </AppShell>
            </NuqsAdapter>
            <CommandMenu />
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

