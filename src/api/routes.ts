export const APIRoutes = {
  GetAgents: (agentOSUrl: string) => `${agentOSUrl}/agents`,
  AgentRun: (agentOSUrl: string) => `${agentOSUrl}/agents/{agent_id}/runs`,
  CancelAgentRun: (agentOSUrl: string, agentId: string, runId: string) =>
    `${agentOSUrl}/agents/${agentId}/runs/${runId}/cancel`,
  Status: (agentOSUrl: string) => `${agentOSUrl}/health`,
  GetSessions: (agentOSUrl: string) => `${agentOSUrl}/sessions`,
  GetSession: (agentOSUrl: string, sessionId: string) =>
    `${agentOSUrl}/sessions/${sessionId}/runs`,

  DeleteSession: (agentOSUrl: string, sessionId: string) =>
    `${agentOSUrl}/sessions/${sessionId}`,

  GetTeams: (agentOSUrl: string) => `${agentOSUrl}/teams`,
  TeamRun: (agentOSUrl: string, teamId: string) =>
    `${agentOSUrl}/teams/${teamId}/runs`,
  CancelTeamRun: (agentOSUrl: string, teamId: string, runId: string) =>
    `${agentOSUrl}/teams/${teamId}/runs/${runId}/cancel`,
  DeleteTeamSession: (agentOSUrl: string, teamId: string, sessionId: string) =>
    `${agentOSUrl}/v1//teams/${teamId}/sessions/${sessionId}`,
  
  // Blob storage routes
  GetBlobUrl: (agentOSUrl: string, blobName: string, expiryHours: number = 24) =>
    `${agentOSUrl}/api/blobs/${encodeURIComponent(blobName)}/url?expiry_hours=${expiryHours}`,
  
  // File mention routes
  ListContainerFiles: (agentOSUrl: string, containerName: string) =>
    `${agentOSUrl}/api/blobs/containers/${encodeURIComponent(containerName)}/files`,
  
  // Blob file download and cleanup
  DownloadBlobFiles: (agentOSUrl: string) =>
    `${agentOSUrl}/api/blobs/download`,
  CleanupFiles: (agentOSUrl: string) =>
    `${agentOSUrl}/api/files/cleanup`
}
