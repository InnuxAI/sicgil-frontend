import Icon from '@/components/ui/icon'
import MarkdownRenderer from '@/components/ui/typography/MarkdownRenderer'
import { useStore } from '@/store'
import type { ChatMessage } from '@/types/os'
import Videos from './Multimedia/Videos'
import Images from './Multimedia/Images'
import Audios from './Multimedia/Audios'
import { memo, useState } from 'react'
import AgentThinkingLoader from './AgentThinkingLoader'
import { CopyButton } from '@/components/ui/shadcn-io/copy-button'
import { Button } from '@/components/ui/button'
import { RotateCcw, Bookmark } from 'lucide-react'
import { toast } from 'sonner'
import { authService } from '@/lib/auth/service'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7777"

interface MessageProps {
  message: ChatMessage
  onRetry?: () => void
}

const AgentMessage = ({ message, onRetry }: MessageProps) => {
  const { streamingErrorMessage } = useStore()
  let messageContent
  if (message.streamingError) {
    messageContent = (
      <p className="text-destructive">
        Oops! Something went wrong while streaming.{' '}
        {streamingErrorMessage ? (
          <>{streamingErrorMessage}</>
        ) : (
          'Please try refreshing the page or try again later.'
        )}
      </p>
    )
  } else if (message.content) {
    messageContent = (
      <div className="flex w-full flex-col gap-4">
        <MarkdownRenderer>{message.content}</MarkdownRenderer>
        {message.videos && message.videos.length > 0 && (
          <Videos videos={message.videos} />
        )}
        {message.images && message.images.length > 0 && (
          <Images images={message.images} />
        )}
        {message.audio && message.audio.length > 0 && (
          <Audios audio={message.audio} />
        )}
      </div>
    )
  } else if (message.response_audio) {
    if (!message.response_audio.transcript) {
      messageContent = (
        <div className="mt-2 flex items-start">
          <AgentThinkingLoader />
        </div>
      )
    } else {
      messageContent = (
        <div className="flex w-full flex-col gap-4">
          <MarkdownRenderer>
            {message.response_audio.transcript}
          </MarkdownRenderer>
          {message.response_audio.content && message.response_audio && (
            <Audios audio={[message.response_audio]} />
          )}
        </div>
      )
    }
  } else {
    messageContent = (
      <div className="mt-2">
        <AgentThinkingLoader />
      </div>
    )
  }

  return (
    <div className="group flex flex-row items-start gap-4 font-geist">
      <div className="flex-shrink-0">
        <Icon type="agent" size="sm" />
      </div>
      <div className="flex w-full flex-col gap-2">
        {messageContent}
        {/* Action buttons - only show when message has content */}
        {message.content && (
          <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <CopyButton 
              content={message.content} 
              size="sm" 
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            />
            {onRetry && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRetry}
                className="text-muted-foreground hover:text-foreground h-6 w-6 p-0"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const UserMessage = memo(({ message }: MessageProps) => {
  const [isSaving, setIsSaving] = useState(false)

  const handleSavePrompt = async () => {
    if (!message.content) return

    try {
      setIsSaving(true)
      const authToken = authService.getToken()
      
      if (!authToken) {
        toast.error('Please sign in to save prompts')
        return
      }

      const response = await fetch(`${API_URL}/prompts/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          prompt: message.content,
        }),
      })

      if (response.ok) {
        toast.success('Prompt saved to library!')
      } else {
        toast.error('Failed to save prompt')
      }
    } catch (error) {
      console.error('Failed to save prompt:', error)
      toast.error('Failed to save prompt')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="group flex items-start justify-end gap-4 pt-4 max-md:break-words">
      <div className="flex flex-col items-end gap-2">
        <div className="relative max-w-[500px]">
          <div className="rounded-tl-3xl rounded-bl-3xl rounded-br-3xl bg-[purple]/20 p-2">
            <div className="scrollbar-hide font-geist text-secondary max-h-[250px] overflow-y-auto rounded-tl-2xl rounded-bl-2xl rounded-br-2xl bg-[purple]/20 px-3 py-2 text-start text-sm backdrop-blur-sm">
              {message.content}
            </div>
          </div>
        </div>
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap justify-end gap-2">
            {message.attachments.map((attachment, index) => (
              <div
                key={index}
                className="border-accent/50 bg-primaryAccent/30 text-primary/80 flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs"
              >
                <Icon type="paperclip" size="xxs" />
                <span className="max-w-[200px] truncate">
                  {attachment.name}
                </span>
              </div>
            ))}
          </div>
        )}
        {/* Copy and Bookmark buttons for user message */}
        {message.content && (
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <CopyButton 
              content={message.content} 
              size="sm" 
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSavePrompt}
              disabled={isSaving}
              className="text-muted-foreground hover:text-foreground h-6 w-6 p-0"
              title="Save to library"
            >
              <Bookmark className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
      <div className="flex-shrink-0">
        <Icon type="user" size="sm" />
      </div>
    </div>
  )
})

AgentMessage.displayName = 'AgentMessage'
UserMessage.displayName = 'UserMessage'
export { AgentMessage, UserMessage }
