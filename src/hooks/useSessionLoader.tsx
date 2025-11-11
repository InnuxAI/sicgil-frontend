import { useCallback } from 'react'
import { getSessionAPI, getAllSessionsAPI, getSessionSummariesAPI } from '@/api/os'
import { useStore } from '../store'
import { toast } from 'sonner'
import { ChatMessage, ToolCall, ReasoningMessage, ChatEntry } from '@/types/os'
import { getJsonMarkdown } from '@/lib/utils'
import { useAuth } from '@/lib/auth/AuthContext'

interface SessionResponse {
  session_id: string
  agent_id: string
  user_id: string | null
  runs?: ChatEntry[]
  memory: {
    runs?: ChatEntry[]
    chats?: ChatEntry[]
  }
  agent_data: Record<string, unknown>
  input?: {
    input_content?: string
    files?: Array<{
      id: string
      filename: string
      mime_type: string
      format: string
      content: string
    }>
  }
}

interface LoaderArgs {
  entityType: 'agent' | 'team' | null
  agentId?: string | null
  teamId?: string | null
  dbId: string | null
}

const useSessionLoader = () => {
  const { user } = useAuth()
  const setMessages = useStore((state) => state.setMessages)
  const selectedEndpoint = useStore((state) => state.selectedEndpoint)
  const authToken = useStore((state) => state.authToken)
  const setIsSessionsLoading = useStore((state) => state.setIsSessionsLoading)
  const setSessionsData = useStore((state) => state.setSessionsData)

  const getSessions = useCallback(
    async ({ entityType, agentId, teamId, dbId }: LoaderArgs) => {
      const selectedId = entityType === 'agent' ? agentId : teamId
      if (!selectedEndpoint || !entityType || !selectedId || !dbId) return

      try {
        setIsSessionsLoading(true)

        const sessions = await getAllSessionsAPI(
          selectedEndpoint,
          entityType,
          selectedId,
          dbId,
          authToken,
          user?.id  // CRITICAL: Pass user_id to filter sessions
        )
        
        if (sessions.data && sessions.data.length > 0) {
          // Fetch summaries for all sessions
          try {
            const sessionIds = sessions.data.map(s => s.session_id)
            const summaries = await getSessionSummariesAPI(
              selectedEndpoint,
              sessionIds,
              dbId,
              authToken
            )
            
            // Merge summaries into session data
            const sessionsWithSummaries = sessions.data.map(session => ({
              ...session,
              summary: summaries[session.session_id]
            }))
            
            setSessionsData(sessionsWithSummaries)
          } catch {
            setSessionsData(sessions.data ?? [])
          }
        } else {
          setSessionsData(sessions.data ?? [])
        }
      } catch {
        toast.error('Error loading sessions')
        setSessionsData([])
      } finally {
        setIsSessionsLoading(false)
      }
    },
    [selectedEndpoint, authToken, user?.id, setSessionsData, setIsSessionsLoading]
  )

  const getSession = useCallback(
    async (
      { entityType, agentId, teamId, dbId }: LoaderArgs,
      sessionId: string
    ) => {
      const selectedId = entityType === 'agent' ? agentId : teamId
      if (
        !selectedEndpoint ||
        !sessionId ||
        !entityType ||
        !selectedId ||
        !dbId
      )
        return

      try {
        const response: SessionResponse = await getSessionAPI(
          selectedEndpoint,
          entityType,
          sessionId,
          dbId,
          authToken
        )
        if (response) {
          if (Array.isArray(response)) {
            const messagesFor = response.flatMap((run: any) => {
              const filteredMessages: ChatMessage[] = []

              if (run) {
                // Get user content from input or find current user message (not from_history)
                let userContent = run.input?.input_content || run.run_input || ''
                let attachments: any = undefined
                
                // Try to get files from the current user message in messages array
                if (run.messages && Array.isArray(run.messages)) {
                  const currentUserMessage = run.messages.find((msg: any) => 
                    msg.role === 'user' && msg.from_history === false
                  )
                  
                  if (currentUserMessage) {
                    // Use content from the current user message if available
                    if (currentUserMessage.content) {
                      userContent = currentUserMessage.content
                    }
                    
                    // Map files from user message to attachments format
                    if (currentUserMessage.files && currentUserMessage.files.length > 0) {
                      attachments = currentUserMessage.files.map((file: { filename: string; mime_type: string }) => ({
                        name: file.filename,
                        type: file.mime_type,
                        size: 0 // Size not available in stored session data
                      }))
                    }
                  }
                }
                
                // Fallback: try to get files from input if not found in messages
                if (!attachments && run.input?.files && run.input.files.length > 0) {
                  attachments = run.input.files.map((file: { filename: string; mime_type: string }) => ({
                    name: file.filename,
                    type: file.mime_type,
                    size: 0
                  }))
                }

                filteredMessages.push({
                  role: 'user',
                  content: userContent,
                  created_at: run.created_at,
                  attachments: attachments && attachments.length > 0 ? attachments : undefined
                })
              }

              if (run) {
                const toolCalls = [
                  ...(run.tools ?? []),
                  ...(run.extra_data?.reasoning_messages ?? []).reduce(
                    (acc: ToolCall[], msg: ReasoningMessage) => {
                      if (msg.role === 'tool') {
                        acc.push({
                          role: msg.role,
                          content: msg.content,
                          tool_call_id: msg.tool_call_id ?? '',
                          tool_name: msg.tool_name ?? '',
                          tool_args: msg.tool_args ?? {},
                          tool_call_error: msg.tool_call_error ?? false,
                          metrics: msg.metrics ?? { time: 0 },
                          created_at:
                            msg.created_at ?? Math.floor(Date.now() / 1000)
                        })
                      }
                      return acc
                    },
                    []
                  )
                ]

                filteredMessages.push({
                  role: 'agent',
                  content: (run.content as string) ?? '',
                  tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
                  extra_data: run.extra_data,
                  images: run.images,
                  videos: run.videos,
                  audio: run.audio,
                  response_audio: run.response_audio,
                  created_at: run.created_at
                })
              }
              return filteredMessages
            })

            const processedMessages = messagesFor.map(
              (message: ChatMessage) => {
                if (Array.isArray(message.content)) {
                  const textContent = message.content
                    .filter((item: { type: string }) => item.type === 'text')
                    .map((item) => item.text)
                    .join(' ')

                  return {
                    ...message,
                    content: textContent
                  }
                }
                if (typeof message.content !== 'string') {
                  return {
                    ...message,
                    content: getJsonMarkdown(message.content)
                  }
                }
                return message
              }
            )

            setMessages(processedMessages)
            return processedMessages
          }
        }
      } catch {
        return null
      }
    },
    [selectedEndpoint, authToken, setMessages]
  )

  return { getSession, getSessions }
}

export default useSessionLoader
