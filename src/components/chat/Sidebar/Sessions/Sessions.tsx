'use client'

import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQueryState } from 'nuqs'
import { useAuth } from '@/lib/auth/AuthContext'

import { useStore } from '@/store'
import useSessionLoader from '@/hooks/useSessionLoader'

import SessionItem from './SessionItem'
import SessionBlankState from './SessionBlankState'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface SkeletonListProps {
  skeletonCount: number
}
const SkeletonList: FC<SkeletonListProps> = ({ skeletonCount }) => {
  const list = useMemo(
    () => Array.from({ length: skeletonCount }, (_, i) => i),
    [skeletonCount]
  )

  return list.map((k, idx) => (
    <Skeleton
      key={k}
      className={cn(
        'mb-1 h-11 rounded-lg px-3 py-2',
        idx > 0 && 'bg-background-secondary'
      )}
    />
  ))
}

const Sessions = () => {
  const { user } = useAuth()
  const [sessionId] = useQueryState('session')

  const {
    selectedEndpoint,
    mode,
    isEndpointActive,
    isEndpointLoading,
    hydrated,
    sessionsData,
    setSessionsData,
    isSessionsLoading,
    selectedAgentId,
    selectedTeamId,
    selectedDbId
  } = useStore()

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  )

  const { getSessions, getSession } = useSessionLoader()
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

  const handleScroll = () => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    scrollTimeoutRef.current = setTimeout(() => {
      // Scroll ended
    }, 1500)
  }

  // Cleanup the scroll timeout when component unmounts
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (hydrated && sessionId && selectedEndpoint && (selectedAgentId || selectedTeamId)) {
      const entityType = selectedAgentId ? 'agent' : 'team'
      getSession({ entityType, agentId: selectedAgentId, teamId: selectedTeamId, dbId: selectedDbId }, sessionId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, sessionId, selectedEndpoint, selectedAgentId, selectedTeamId, selectedDbId])

  useEffect(() => {
    if (!selectedEndpoint || isEndpointLoading) return
    if (!(selectedAgentId || selectedTeamId || selectedDbId)) {
      setSessionsData([])
      return
    }
    setSessionsData([])
    getSessions({
      entityType: mode,
      agentId: selectedAgentId,
      teamId: selectedTeamId,
      dbId: selectedDbId
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedEndpoint,
    selectedAgentId,
    selectedTeamId,
    mode,
    isEndpointLoading,
    getSessions,
    selectedDbId,
    user?.id  // Re-fetch sessions when user changes (login/logout)
  ])

  useEffect(() => {
    if (sessionId) setSelectedSessionId(sessionId)
  }, [sessionId])

  const handleSessionClick = useCallback(
    (id: string) => () => setSelectedSessionId(id),
    []
  )

  if (isSessionsLoading || isEndpointLoading) {
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
        className={`h-[calc(100vh-345px)] overflow-y-auto font-geist transition-all duration-300 scrollbar-thin`}
        onScroll={handleScroll}
        onMouseLeave={handleScroll}
      >
        {!isEndpointActive ||
        (!isSessionsLoading &&
          (!sessionsData || sessionsData?.length === 0)) ? (
          <SessionBlankState />
        ) : (
          <div className="flex flex-col gap-y-1 pr-1">
            {sessionsData?.map((entry, idx) => (
              <SessionItem
                key={`${entry?.session_id}-${idx}`}
                currentSessionId={selectedSessionId}
                isSelected={selectedSessionId === entry?.session_id}
                onSessionClick={handleSessionClick(entry?.session_id)}
                session_name={entry?.session_name ?? '-'}
                session_id={entry?.session_id}
                created_at={entry?.created_at}
                summary={entry?.summary}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Sessions
