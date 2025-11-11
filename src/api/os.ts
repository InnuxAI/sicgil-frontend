import { toast } from 'sonner'

import { APIRoutes } from './routes'

import { AgentDetails, Sessions, TeamDetails } from '@/types/os'
import { authService } from '@/lib/auth/service'

// Helper function to create headers with auth token from storage
const createHeaders = (authToken?: string): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  }

  // Use provided token or get from auth service
  const token = authToken || authService.getToken()
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

export const getAgentsAPI = async (
  endpoint: string,
  authToken?: string
): Promise<AgentDetails[]> => {
  const url = APIRoutes.GetAgents(endpoint)
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(authToken)
    })
    if (!response.ok) {
      toast.error(`Failed to fetch  agents: ${response.statusText}`)
      return []
    }
    const data = await response.json()
    return data
  } catch {
    toast.error('Error fetching  agents')
    return []
  }
}

export const getStatusAPI = async (
  base: string,
  authToken?: string
): Promise<number> => {
  const response = await fetch(APIRoutes.Status(base), {
    method: 'GET',
    headers: createHeaders(authToken)
  })
  return response.status
}

export const getAllSessionsAPI = async (
  base: string,
  type: 'agent' | 'team',
  componentId: string,
  dbId: string,
  authToken?: string,
  userId?: string
): Promise<Sessions | { data: [] }> => {
  try {
    const url = new URL(APIRoutes.GetSessions(base))
    url.searchParams.set('type', type)
    url.searchParams.set('component_id', componentId)
    url.searchParams.set('db_id', dbId)
    
    // CRITICAL: Filter sessions by user_id to prevent users from seeing each other's chats
    if (userId) {
      url.searchParams.set('user_id', userId)
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: createHeaders(authToken)
    })

    if (!response.ok) {
      if (response.status === 404) {
        return { data: [] }
      }
      throw new Error(`Failed to fetch sessions: ${response.statusText}`)
    }
    return response.json()
  } catch {
    return { data: [] }
  }
}

export const getSessionAPI = async (
  base: string,
  type: 'agent' | 'team',
  sessionId: string,
  dbId?: string,
  authToken?: string
) => {
  // build query string
  const queryParams = new URLSearchParams({ type })
  if (dbId) queryParams.append('db_id', dbId)

  const response = await fetch(
    `${APIRoutes.GetSession(base, sessionId)}?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: createHeaders(authToken)
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch session: ${response.statusText}`)
  }

  return response.json()
}

export const getSessionDetailsAPI = async (
  base: string,
  sessionId: string,
  dbId?: string,
  authToken?: string
) => {
  // Try to get full session document (not just runs)
  const queryParams = new URLSearchParams()
  if (dbId) queryParams.append('db_id', dbId)
  
  const response = await fetch(
    `${base}/sessions/${sessionId}?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: createHeaders(authToken)
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch session details: ${response.statusText}`)
  }

  return response.json()
}

export const getSessionSummariesAPI = async (
  base: string,
  sessionIds: string[],
  dbId: string,
  authToken?: string
): Promise<Record<string, { summary?: string; topics?: string[]; updated_at?: string }>> => {
  try {
    const response = await fetch(
      `${base}/sessions/summaries`,
      {
        method: 'POST',
        headers: createHeaders(authToken),
        body: JSON.stringify({
          session_ids: sessionIds,
          db_id: dbId
        })
      }
    )

    if (!response.ok) {
      console.error('Failed to fetch session summaries:', response.statusText)
      return {}
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching session summaries:', error)
    return {}
  }
}

export const deleteSessionAPI = async (
  base: string,
  dbId: string,
  sessionId: string,
  authToken?: string
) => {
  const queryParams = new URLSearchParams()
  if (dbId) queryParams.append('db_id', dbId)
  const response = await fetch(
    `${APIRoutes.DeleteSession(base, sessionId)}?${queryParams.toString()}`,
    {
      method: 'DELETE',
      headers: createHeaders(authToken)
    }
  )
  return response
}

export const getTeamsAPI = async (
  endpoint: string,
  authToken?: string
): Promise<TeamDetails[]> => {
  const url = APIRoutes.GetTeams(endpoint)
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(authToken)
    })
    if (!response.ok) {
      toast.error(`Failed to fetch  teams: ${response.statusText}`)
      return []
    }
    const data = await response.json()

    return data
  } catch {
    toast.error('Error fetching  teams')
    return []
  }
}

export const deleteTeamSessionAPI = async (
  base: string,
  teamId: string,
  sessionId: string,
  authToken?: string
) => {
  const response = await fetch(
    APIRoutes.DeleteTeamSession(base, teamId, sessionId),
    {
      method: 'DELETE',
      headers: createHeaders(authToken)
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to delete team session: ${response.statusText}`)
  }
  return response
}

export const cancelAgentRunAPI = async (
  base: string,
  agentId: string,
  runId: string,
  authToken?: string
): Promise<boolean> => {
  try {
    const response = await fetch(
      APIRoutes.CancelAgentRun(base, agentId, runId),
      {
        method: 'POST',
        headers: createHeaders(authToken)
      }
    )
    return response.ok
  } catch (error) {
    console.error('Error cancelling agent run:', error)
    return false
  }
}

export const cancelTeamRunAPI = async (
  base: string,
  teamId: string,
  runId: string,
  authToken?: string
): Promise<boolean> => {
  try {
    const response = await fetch(
      APIRoutes.CancelTeamRun(base, teamId, runId),
      {
        method: 'POST',
        headers: createHeaders(authToken)
      }
    )
    return response.ok
  } catch (error) {
    console.error('Error cancelling team run:', error)
    return false
  }
}

// Blob storage API
export const getBlobUrlAPI = async (
  agentOSUrl: string,
  blobName: string,
  expiryHours: number = 24,
  authToken?: string
): Promise<{ url: string; blob_name: string } | null> => {
  try {
    const url = APIRoutes.GetBlobUrl(agentOSUrl, blobName, expiryHours)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders(authToken),
      credentials: 'include' // Include cookies for auth
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error getting blob URL:', error)
    return null
  }
}
