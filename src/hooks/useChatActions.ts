import { useCallback } from 'react'
import { toast } from 'sonner'

import { useStore } from '../store'

import { AgentDetails, TeamDetails, type ChatMessage } from '@/types/os'
import { getAgentsAPI, getStatusAPI, getTeamsAPI } from '@/api/os'
import { useQueryState } from 'nuqs'

const useChatActions = () => {
  const { chatInputRef } = useStore()
  const selectedEndpoint = useStore((state) => state.selectedEndpoint)
  const authToken = useStore((state) => state.authToken)
  const [, setSessionId] = useQueryState('session')
  const setMessages = useStore((state) => state.setMessages)
  const setIsEndpointActive = useStore((state) => state.setIsEndpointActive)
  const setIsEndpointLoading = useStore((state) => state.setIsEndpointLoading)
  const setAgents = useStore((state) => state.setAgents)
  const setTeams = useStore((state) => state.setTeams)
  const setSelectedModel = useStore((state) => state.setSelectedModel)
  const setMode = useStore((state) => state.setMode)
  const selectedAgentId = useStore((state) => state.selectedAgentId)
  const setSelectedAgentId = useStore((state) => state.setSelectedAgentId)
  const selectedTeamId = useStore((state) => state.selectedTeamId)
  const setSelectedTeamId = useStore((state) => state.setSelectedTeamId)
  const selectedDbId = useStore((state) => state.selectedDbId)
  const setSelectedDbId = useStore((state) => state.setSelectedDbId)

  const getStatus = useCallback(async () => {
    try {
      const status = await getStatusAPI(selectedEndpoint, authToken)
      return status
    } catch {
      return 503
    }
  }, [selectedEndpoint, authToken])

  const getAgents = useCallback(async () => {
    try {
      const agents = await getAgentsAPI(selectedEndpoint, authToken)
      return agents
    } catch {
      toast.error('Error fetching agents')
      return []
    }
  }, [selectedEndpoint, authToken])

  const getTeams = useCallback(async () => {
    try {
      const teams = await getTeamsAPI(selectedEndpoint, authToken)
      return teams
    } catch {
      toast.error('Error fetching teams')
      return []
    }
  }, [selectedEndpoint, authToken])

  const clearChat = useCallback(() => {
    setMessages([])
    setSessionId(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const focusChatInput = useCallback(() => {
    setTimeout(() => {
      requestAnimationFrame(() => chatInputRef?.current?.focus())
    }, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addMessage = useCallback(
    (message: ChatMessage) => {
      setMessages((prevMessages) => [...prevMessages, message])
    },
    [setMessages]
  )

  const initialize = useCallback(async () => {
    setIsEndpointLoading(true)
    try {
      const status = await getStatus()
      let agents: AgentDetails[] = []
      let teams: TeamDetails[] = []
      if (status === 200) {
        setIsEndpointActive(true)
        teams = await getTeams()
        agents = await getAgents()

        if (!selectedAgentId && !selectedTeamId) {
          const currentMode = useStore.getState().mode

          if (currentMode === 'team' && teams.length > 0) {
            const firstTeam = teams[0]
            setSelectedTeamId(firstTeam.id)
            setSelectedModel(firstTeam.model?.provider || '')
            setSelectedDbId(firstTeam.db_id || '')
            setSelectedAgentId(null)
            setTeams(teams)
          } else if (currentMode === 'agent' && agents.length > 0) {
            const firstAgent = agents[0]
            setMode('agent')
            setSelectedAgentId(firstAgent.id)
            setSelectedModel(firstAgent.model?.model || '')
            setSelectedDbId(firstAgent.db_id || '')
            setAgents(agents)
          }
        } else {
          setAgents(agents)
          setTeams(teams)
          if (selectedAgentId) {
            const agent = agents.find((a) => a.id === selectedAgentId)
            if (agent) {
              setMode('agent')
              setSelectedModel(agent.model?.model || '')
              setSelectedDbId(agent.db_id || '')
              setSelectedTeamId(null)
            } else if (agents.length > 0) {
              const firstAgent = agents[0]
              setMode('agent')
              setSelectedAgentId(firstAgent.id)
              setSelectedModel(firstAgent.model?.model || '')
              setSelectedDbId(firstAgent.db_id || '')
              setSelectedTeamId(null)
            }
          } else if (selectedTeamId) {
            const team = teams.find((t) => t.id === selectedTeamId)
            if (team) {
              setMode('team')
              setSelectedModel(team.model?.provider || '')
              setSelectedDbId(team.db_id || '')
              setSelectedAgentId(null)
            } else if (teams.length > 0) {
              const firstTeam = teams[0]
              setMode('team')
              setSelectedTeamId(firstTeam.id)
              setSelectedModel(firstTeam.model?.provider || '')
              setSelectedDbId(firstTeam.db_id || '')
              setSelectedAgentId(null)
            }
          }
        }
      } else {
        setIsEndpointActive(false)
        setMode('agent')
        setSelectedModel('')
        setSelectedAgentId(null)
        setSelectedTeamId(null)
      }
      return { agents, teams }
    } catch (error) {
      console.error('Error initializing :', error)
      setIsEndpointActive(false)
      setMode('agent')
      setSelectedModel('')
      setSelectedAgentId(null)
      setSelectedTeamId(null)
      setAgents([])
      setTeams([])
    } finally {
      setIsEndpointLoading(false)
    }
  }, [
    getStatus,
    getAgents,
    getTeams,
    setIsEndpointActive,
    setIsEndpointLoading,
    setAgents,
    setTeams,
    setSelectedAgentId,
    setSelectedModel,
    setMode,
    setSelectedTeamId,
    setSelectedDbId,
    selectedAgentId,
    selectedTeamId
  ])

  return {
    clearChat,
    addMessage,
    getAgents,
    focusChatInput,
    getTeams,
    initialize
  }
}

export default useChatActions
