import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import {
  AgentDetails,
  SessionEntry,
  TeamDetails,
  type ChatMessage
} from '@/types/os'
import { listContainerFilesAPI, BlobFileMetadata } from '@/api/os'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7777";

interface Store {
  hydrated: boolean
  setHydrated: () => void
  streamingErrorMessage: string
  setStreamingErrorMessage: (streamingErrorMessage: string) => void
  endpoints: {
    endpoint: string
    id__endpoint: string
  }[]
  setEndpoints: (
    endpoints: {
      endpoint: string
      id__endpoint: string
    }[]
  ) => void
  isStreaming: boolean
  setIsStreaming: (isStreaming: boolean) => void
  isEndpointActive: boolean
  setIsEndpointActive: (isActive: boolean) => void
  isEndpointLoading: boolean
  setIsEndpointLoading: (isLoading: boolean) => void
  messages: ChatMessage[]
  setMessages: (
    messages: ChatMessage[] | ((prevMessages: ChatMessage[]) => ChatMessage[])
  ) => void
  chatInputRef: React.RefObject<HTMLTextAreaElement | null>
  selectedEndpoint: string
  setSelectedEndpoint: (selectedEndpoint: string) => void
  authToken: string
  setAuthToken: (authToken: string) => void
  agents: AgentDetails[]
  setAgents: (agents: AgentDetails[]) => void
  teams: TeamDetails[]
  setTeams: (teams: TeamDetails[]) => void
  selectedModel: string
  setSelectedModel: (model: string) => void
  mode: 'agent' | 'team'
  setMode: (mode: 'agent' | 'team') => void
  selectedAgentId: string | null
  setSelectedAgentId: (agentId: string | null) => void
  selectedTeamId: string | null
  setSelectedTeamId: (teamId: string | null) => void
  selectedDbId: string | null
  setSelectedDbId: (dbId: string | null) => void
  sessionsData: SessionEntry[] | null
  setSessionsData: (
    sessionsData:
      | SessionEntry[]
      | ((prevSessions: SessionEntry[] | null) => SessionEntry[] | null)
  ) => void
  isSessionsLoading: boolean
  setIsSessionsLoading: (isSessionsLoading: boolean) => void
  currentRunId: string | null
  setCurrentRunId: (runId: string | null) => void
  clearUserState: () => void  // Clear all user-specific state on logout
  // File mention state
  blobFiles: BlobFileMetadata[]
  setBlobFiles: (files: BlobFileMetadata[]) => void
  isFetchingBlobFiles: boolean
  setIsFetchingBlobFiles: (isFetching: boolean) => void
  lastBlobFetchTime: number | null
  setLastBlobFetchTime: (time: number | null) => void
  fetchBlobFiles: () => Promise<void>
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      streamingErrorMessage: '',
      setStreamingErrorMessage: (streamingErrorMessage) =>
        set(() => ({ streamingErrorMessage })),
      endpoints: [],
      setEndpoints: (endpoints) => set(() => ({ endpoints })),
      isStreaming: false,
      setIsStreaming: (isStreaming) => set(() => ({ isStreaming })),
      isEndpointActive: false,
      setIsEndpointActive: (isActive) =>
        set(() => ({ isEndpointActive: isActive })),
      isEndpointLoading: true,
      setIsEndpointLoading: (isLoading) =>
        set(() => ({ isEndpointLoading: isLoading })),
      messages: [],
      setMessages: (messages) =>
        set((state) => ({
          messages:
            typeof messages === 'function' ? messages(state.messages) : messages
        })),
      chatInputRef: { current: null },
      selectedEndpoint: API_URL,
      setSelectedEndpoint: (selectedEndpoint) =>
        set(() => ({ selectedEndpoint })),
      authToken: '',
      setAuthToken: (authToken) => set(() => ({ authToken })),
      agents: [],
      setAgents: (agents) => set({ agents }),
      teams: [],
      setTeams: (teams) => set({ teams }),
      selectedModel: '',
      setSelectedModel: (selectedModel) => set(() => ({ selectedModel })),
      mode: 'agent',
      setMode: (mode) => set(() => ({ mode })),
      selectedAgentId: null,
      setSelectedAgentId: (selectedAgentId) => set(() => ({ selectedAgentId })),
      selectedTeamId: null,
      setSelectedTeamId: (selectedTeamId) => set(() => ({ selectedTeamId })),
      selectedDbId: null,
      setSelectedDbId: (selectedDbId) => set(() => ({ selectedDbId })),
      sessionsData: null,
      setSessionsData: (sessionsData) =>
        set((state) => ({
          sessionsData:
            typeof sessionsData === 'function'
              ? sessionsData(state.sessionsData)
              : sessionsData
        })),
      isSessionsLoading: false,
      setIsSessionsLoading: (isSessionsLoading) =>
        set(() => ({ isSessionsLoading })),
      currentRunId: null,
      setCurrentRunId: (runId) => set(() => ({ currentRunId: runId })),
      // File mention state
      blobFiles: [],
      setBlobFiles: (files) => set(() => ({ blobFiles: files })),
      isFetchingBlobFiles: false,
      setIsFetchingBlobFiles: (isFetching) => set(() => ({ isFetchingBlobFiles: isFetching })),
      lastBlobFetchTime: null,
      setLastBlobFetchTime: (time) => set(() => ({ lastBlobFetchTime: time })),
      fetchBlobFiles: async () => {
        const state = useStore.getState()
        
        // Prevent concurrent fetches
        if (state.isFetchingBlobFiles) {
          return
        }
        
        state.setIsFetchingBlobFiles(true)
        
        try {
          const response = await listContainerFilesAPI(
            state.selectedEndpoint,
            'filescontainer',
            state.authToken
          )
          
          if (response && response.success) {
            state.setBlobFiles(response.files)
            state.setLastBlobFetchTime(Date.now())
          }
        } catch (error) {
          console.error('Error fetching blob files:', error)
        } finally {
          state.setIsFetchingBlobFiles(false)
        }
      },
      clearUserState: () =>
        set(() => ({
          messages: [],
          sessionsData: null,
          agents: [],
          teams: [],
          selectedModel: '',
          selectedAgentId: null,
          selectedTeamId: null,
          selectedDbId: null,
          currentRunId: null,
          isStreaming: false,
          streamingErrorMessage: '',
          blobFiles: [],
          lastBlobFetchTime: null
        }))
    }),
    {
      name: 'endpoint-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedEndpoint: state.selectedEndpoint,
        selectedAgentId: state.selectedAgentId,
        selectedTeamId: state.selectedTeamId,
        selectedDbId: state.selectedDbId,
        mode: state.mode
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated?.()
      }
    }
  )
)
