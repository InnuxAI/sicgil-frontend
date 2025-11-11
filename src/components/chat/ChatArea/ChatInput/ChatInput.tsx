'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { TextArea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store'
import useAIChatStreamHandler from '@/hooks/useAIStreamHandler'
import { useQueryState } from 'nuqs'
import Icon from '@/components/ui/icon'
import { cancelAgentRunAPI, cancelTeamRunAPI, downloadBlobFilesAPI, cleanupFilesAPI } from '@/api/os'
import { constructEndpointUrl } from '@/lib/constructEndpointUrl'
import StopIcon from '@/components/ui/StopIcon'
import FileAttachmentBadge from '@/components/ui/FileAttachmentBadge/FileAttachmentBadge'
import MentionPopup from './MentionPopup'
import FileMentionBadge from './FileMentionBadge'
import type { BlobFileMetadata } from '@/api/os'

const ChatInput = () => {
  const { chatInputRef } = useStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mentionPopupRef = useRef<HTMLDivElement>(null)

  const { handleStreamResponse } = useAIChatStreamHandler()
  const selectedAgentId = useStore((state) => state.selectedAgentId)
  const selectedTeamId = useStore((state) => state.selectedTeamId)
  const [inputMessage, setInputMessage] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [mentionedFiles, setMentionedFiles] = useState<BlobFileMetadata[]>([])
  
  // Mention popup state
  const [showMentionPopup, setShowMentionPopup] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionPosition, setMentionPosition] = useState<{ bottom: number; left: number } | undefined>()
  
  const isStreaming = useStore((state) => state.isStreaming)
  const currentRunId = useStore((state) => state.currentRunId)
  const selectedEndpoint = useStore((state) => state.selectedEndpoint)
  const authToken = useStore((state) => state.authToken)
  const mode = useStore((state) => state.mode)
  const setIsStreaming = useStore((state) => state.setIsStreaming)
  const setCurrentRunId = useStore((state) => state.setCurrentRunId)
  
  // Blob files state from store
  const blobFiles = useStore((state) => state.blobFiles)
  const isFetchingBlobFiles = useStore((state) => state.isFetchingBlobFiles)
  const fetchBlobFiles = useStore((state) => state.fetchBlobFiles)
  const lastBlobFetchTime = useStore((state) => state.lastBlobFetchTime)
  
  // Fetch blob files on mount and set up auto-refresh
  useEffect(() => {
    // Initial fetch if not already fetched
    if (blobFiles.length === 0 && !isFetchingBlobFiles) {
      fetchBlobFiles()
    }
    
    // Set up auto-refresh every 60 seconds
    const intervalId = setInterval(() => {
      if (!isStreaming) {
        fetchBlobFiles()
      }
    }, 60000)
    
    return () => clearInterval(intervalId)
  }, [])
  
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
  
  const handleRemoveMention = (fileName: string) => {
    setMentionedFiles((prev) => prev.filter(f => f.name !== fileName))
  }

  // Calculate cursor position in textarea for popup positioning
  const getCursorPosition = (textarea: HTMLTextAreaElement, cursorIndex: number) => {
    // Get textarea position relative to the ChatInput container (parent)
    const container = textarea.closest('.font-geist') as HTMLElement
    if (!container) return null
    
    const containerRect = container.getBoundingClientRect()
    const textareaRect = textarea.getBoundingClientRect()
    const textareaOffsetTop = textareaRect.top - containerRect.top
    const textareaOffsetLeft = textareaRect.left - containerRect.left
    
    // Position popup's BOTTOM 4px above the textarea's TOP
    // Popup grows upwards from this point
    const popupBottom = textareaOffsetTop - 4
    
    return {
      bottom: popupBottom,  // Position from bottom of container
      left: textareaOffsetLeft
    }
  }

  // Detect @ character and show mention popup
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setInputMessage(value)
    
    const cursorPosition = e.target.selectionStart
    const textBeforeCursor = value.substring(0, cursorPosition)
    
    // Check if @ was just typed
    const atMatch = textBeforeCursor.match(/@(\w*)$/)
    
    if (atMatch) {
      const query = atMatch[1] || ''
      setMentionQuery(query)
      setShowMentionPopup(true)
      
      // Calculate popup position at cursor
      const position = getCursorPosition(e.target, cursorPosition)
      if (position) {
        setMentionPosition({
          bottom: position.bottom,
          left: position.left
        })
      }
    } else {
      setShowMentionPopup(false)
      setMentionQuery('')
    }
  }
  
  // Handle file mention selection
  const handleMentionSelect = (file: BlobFileMetadata) => {
    // Check if already mentioned
    if (mentionedFiles.some(f => f.name === file.name)) {
      toast.info('File already mentioned')
      setShowMentionPopup(false)
      return
    }
    
    // Add to mentioned files
    setMentionedFiles(prev => [...prev, file])
    
    // Remove @ trigger and query from input
    const cursorPosition = chatInputRef.current?.selectionStart || 0
    const textBeforeCursor = inputMessage.substring(0, cursorPosition)
    const textAfterCursor = inputMessage.substring(cursorPosition)
    
    const atMatch = textBeforeCursor.match(/@(\w*)$/)
    if (atMatch) {
      const beforeAt = textBeforeCursor.substring(0, textBeforeCursor.length - atMatch[0].length)
      setInputMessage(beforeAt + textAfterCursor)
    }
    
    setShowMentionPopup(false)
    setMentionQuery('')
    
    // Refocus textarea
    setTimeout(() => chatInputRef.current?.focus(), 0)
  }
  
  // Close mention popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mentionPopupRef.current &&
        !mentionPopupRef.current.contains(event.target as Node) &&
        chatInputRef.current &&
        !chatInputRef.current.contains(event.target as Node)
      ) {
        setShowMentionPopup(false)
      }
    }
    
    if (showMentionPopup) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMentionPopup])

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
    if (!inputMessage.trim() && selectedFiles.length === 0 && mentionedFiles.length === 0) return

    const currentMessage = inputMessage
    const currentFiles = [...selectedFiles]
    const currentMentions = [...mentionedFiles]
    
    setInputMessage('')
    setSelectedFiles([])
    setMentionedFiles([])

    let downloadedFilenames: string[] = []

    try {
      const endpointUrl = constructEndpointUrl(selectedEndpoint)
      
      // STEP 1: Download mentioned blob files to excel_files folder (if any)
      if (currentMentions.length > 0) {
        toast.info(`Preparing ${currentMentions.length} mentioned file(s)...`)
        
        const blobNames = currentMentions.map(f => f.name)
        const downloadResult = await downloadBlobFilesAPI(
          endpointUrl,
          blobNames,
          'filescontainer',
          authToken
        )
        
        if (!downloadResult || !downloadResult.success) {
          toast.error('Failed to download mentioned files')
          return
        }
        
        downloadedFilenames = downloadResult.downloaded_files.map(f => f.filename)
        toast.success(`Downloaded ${downloadedFilenames.length} file(s)`)
      }
      
      // STEP 2: Build message with local file paths (not blob names)
      let finalMessage = currentMessage
      
      if (downloadedFilenames.length > 0) {
        finalMessage += '\n\n**Files available for analysis:**\n'
        downloadedFilenames.forEach(filename => {
          finalMessage += `- ${filename} \n`
        })
      }
      
      // STEP 3: Create FormData with message and uploaded files
      const formData = new FormData()
      formData.append('message', finalMessage)
      
      // Append all selected (uploaded) files
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

      // STEP 4: Run agent
      await handleStreamResponse(formData)
      
      // STEP 5: Cleanup downloaded files after agent completes
      if (downloadedFilenames.length > 0) {
        // Give agent a moment to finish processing
        setTimeout(async () => {
          try {
            const cleanupResult = await cleanupFilesAPI(
              endpointUrl,
              downloadedFilenames,
              authToken
            )
            
            if (cleanupResult && cleanupResult.success) {
              console.log(`Cleaned up ${cleanupResult.deleted_count} file(s)`)
            }
          } catch (error) {
            console.error('Error cleaning up files:', error)
            // Non-critical error, don't show to user
          }
        }, 2000) // Wait 2 seconds after streaming completes
      }
      
    } catch (error) {
      toast.error(
        `Error in handleSubmit: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
      
      // Cleanup on error
      if (downloadedFilenames.length > 0) {
        try {
          const endpointUrl = constructEndpointUrl(selectedEndpoint)
          await cleanupFilesAPI(endpointUrl, downloadedFilenames, authToken)
        } catch (cleanupError) {
          console.error('Error cleaning up after failure:', cleanupError)
        }
      }
    }
  }

  return (
    <div className="font-geist relative mx-auto mb-1 w-full max-w-3xl">
      {/* Mention Popup */}
      {showMentionPopup && (
        <div ref={mentionPopupRef} className="absolute z-50">
          <MentionPopup
            files={blobFiles}
            isLoading={isFetchingBlobFiles}
            searchQuery={mentionQuery}
            onSelect={handleMentionSelect}
            onClose={() => setShowMentionPopup(false)}
            onRefresh={fetchBlobFiles}
            position={mentionPosition}
          />
        </div>
      )}
      
      {/* Mentioned Files Preview */}
      {mentionedFiles.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {mentionedFiles.map((file) => (
            <FileMentionBadge
              key={file.name}
              fileName={file.name}
              fileType={file.content_type}
              onRemove={() => handleRemoveMention(file.name)}
            />
          ))}
        </div>
      )}
      
      {/* File Attachments Preview */}
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
          placeholder={'Ask anything (type @ to mention files)'}
          value={inputMessage}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            // Don't submit if mention popup is open
            if (showMentionPopup && e.key === 'Enter') {
              e.preventDefault()
              return
            }
            
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
            (!isStreaming && !inputMessage.trim() && selectedFiles.length === 0 && mentionedFiles.length === 0)
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
