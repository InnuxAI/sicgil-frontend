'use client'

import { FC, useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import LibraryItem from './LibraryItem'
import LibraryBlankState from './LibraryBlankState'
import { authService } from '@/lib/auth/service'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7777"

export interface SavedPrompt {
  _id: string
  user_id: string
  prompt: string
  created_at: string
  tags?: string[]
}

interface SkeletonListProps {
  skeletonCount: number
}

const SkeletonList: FC<SkeletonListProps> = ({ skeletonCount }) => {
  const list = Array.from({ length: skeletonCount }, (_, i) => i)

  return (
    <>
      {list.map((k, idx) => (
        <Skeleton
          key={k}
          className={cn(
            'mb-1 h-11 rounded-lg px-3 py-2',
            idx > 0 && 'bg-background-secondary'
          )}
        />
      ))}
    </>
  )
}

const Library = () => {
  const { user } = useAuth()
  const [prompts, setPrompts] = useState<SavedPrompt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchPrompts = useCallback(async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      const authToken = authService.getToken()
      
      if (!authToken) {
        console.log('No auth token available')
        setIsLoading(false)
        return
      }

      const response = await fetch(`${API_URL}/prompts`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPrompts(data)
      }
    } catch (error) {
      console.error('Failed to fetch prompts:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchPrompts()
  }, [fetchPrompts])

  const handleScroll = () => {
    setIsScrolling(true)

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false)
    }, 1500)
  }

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  const handleDelete = async (promptId: string) => {
    try {
      const authToken = authService.getToken()
      
      if (!authToken) {
        console.error('No auth token available')
        return
      }

      const response = await fetch(`${API_URL}/prompts/${promptId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
      })

      if (response.ok) {
        setPrompts(prompts.filter(p => p._id !== promptId))
      }
    } catch (error) {
      console.error('Failed to delete prompt:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="mt-4 h-[calc(100vh-325px)] w-full overflow-y-auto">
          <SkeletonList skeletonCount={5} />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div
        className={`h-[calc(100vh-345px)] overflow-y-auto font-geist transition-all duration-300 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:transition-opacity [&::-webkit-scrollbar]:duration-300 ${
          isScrolling
            ? '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-background [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:opacity-0'
            : '[&::-webkit-scrollbar]:opacity-100'
        }`}
        onScroll={handleScroll}
        onMouseOver={() => setIsScrolling(true)}
        onMouseLeave={handleScroll}
      >
        {prompts.length === 0 ? (
          <LibraryBlankState />
        ) : (
          <div className="flex flex-col gap-y-1 pr-1">
            {prompts.map((prompt) => (
              <LibraryItem
                key={prompt._id}
                prompt={prompt}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Library
