'use client'
import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { TextArea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store'
import useAIChatStreamHandler from '@/hooks/useAIStreamHandler'
import { useQueryState } from 'nuqs'
import Icon from '@/components/ui/icon'
import { cancelAgentRunAPI, cancelTeamRunAPI } from '@/api/os'
import { constructEndpointUrl } from '@/lib/constructEndpointUrl'
import StopIcon from '@/components/ui/StopIcon'
import FileAttachmentBadge from '@/components/ui/FileAttachmentBadge/FileAttachmentBadge'

const ChatInput = () => {
  const { chatInputRef } = useStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { handleStreamResponse } = useAIChatStreamHandler()
  const selectedAgentId = useStore((state) => state.selectedAgentId)
  const selectedTeamId = useStore((state) => state.selectedTeamId)
  const [inputMessage, setInputMessage] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const isStreaming = useStore((state) => state.isStreaming)
  const currentRunId = useStore((state) => state.currentRunId)
  const selectedEndpoint = useStore((state) => state.selectedEndpoint)
  const authToken = useStore((state) => state.authToken)
  const mode = useStore((state) => state.mode)
  const setIsStreaming = useStore((state) => state.setIsStreaming)
  const setCurrentRunId = useStore((state) => state.setCurrentRunId)
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileArray = Array.from(files)
      setSelectedFiles((prev) => [...prev, ...fileArray])
      // Reset the input value so the same file can be selected again if needed
      e.target.value = ''
    }
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCancelRun = async () => {
    if (!currentRunId) {
      toast.error('No active run to cancel')
      return
    }

    try {
      const endpointUrl = constructEndpointUrl(selectedEndpoint)
      let success = false

      if (mode === 'agent' && selectedAgentId) {
        success = await cancelAgentRunAPI(
          endpointUrl,
          selectedAgentId,
          currentRunId,
          authToken
        )
      } else if (mode === 'team' && selectedTeamId) {
        success = await cancelTeamRunAPI(
          endpointUrl,
          selectedTeamId,
          currentRunId,
          authToken
        )
      }

      if (success) {
        toast.info('Run stopped')
        setIsStreaming(false)
        setCurrentRunId(null)
      } else {
        toast.error('Failed to cancel run')
      }
    } catch (error) {
      toast.error(
        `Error cancelling run: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  const handleSubmit = async () => {
    if (!inputMessage.trim() && selectedFiles.length === 0) return

    const currentMessage = inputMessage
    const currentFiles = [...selectedFiles]
    setInputMessage('')
    setSelectedFiles([])

    try {
      // Create FormData with message and files
      const formData = new FormData()
      formData.append('message', currentMessage)
      
      // Append all selected files
      currentFiles.forEach((file) => {
        formData.append('files', file)
      })

      // Store attachment metadata for display
      const attachmentData = currentFiles.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type
      }))
      
      // Pass attachments metadata via FormData
      formData.append('attachments', JSON.stringify(attachmentData))

      await handleStreamResponse(formData)
    } catch (error) {
      toast.error(
        `Error in handleSubmit: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  return (
    <div className="font-geist relative mx-auto mb-1 w-full max-w-3xl">
      {/* File Preview */}
      {selectedFiles.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {selectedFiles.map((file, index) => (
            <FileAttachmentBadge
              key={index}
              fileName={file.name}
              fileType={file.type}
              onRemove={() => handleRemoveFile(index)}
            />
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end justify-center gap-x-2 rounded-2xl bg-accent p-2">
        {/* File Upload Button */}
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={!(selectedAgentId || selectedTeamId) || isStreaming}
          size="icon"
          variant="ghost"
          className="bg-background-secondary hover:border-accent hover:bg-background hover:rounded-xl rounded-3xl p-5 transition-all"
          type="button"
        >
          <Icon type="paperclip" color="primary" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept=".xlsx,.xls,.csv,.pdf,.txt,.png,.jpg,.jpeg"
        />

        <TextArea
          placeholder={'Ask anything'}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === 'Enter' &&
              !e.nativeEvent.isComposing &&
              !e.shiftKey &&
              !isStreaming
            ) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          className="bg-background focus:border-accent w-full border px-4 text-sm"
          disabled={!(selectedAgentId || selectedTeamId)}
          ref={chatInputRef}
        />
        <Button
          onClick={isStreaming ? handleCancelRun : handleSubmit}
          disabled={
            !(selectedAgentId || selectedTeamId) ||
            (!isStreaming && !inputMessage.trim() && selectedFiles.length === 0)
          }
          size="icon"
          className="hover:bg-primary/90 rounded-xl p-5 transition-all"
        >
          {isStreaming ? (
            <StopIcon className="text-primaryAccent" width={20} height={20} />
          ) : (
            <Icon type="send" color="primaryAccent" />
          )}
        </Button>
      </div>
    </div>
  )
}

export default ChatInput
