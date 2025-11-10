import type { ChatMessage } from '@/types/os'

import { AgentMessage, UserMessage } from './MessageItem'
import {
  ReferenceData
} from '@/types/os'
import React, { type FC } from 'react'

import Icon from '@/components/ui/icon'
import ChatBlankState from './ChatBlankState'
import { useStore } from '@/store'
import useAIChatStreamHandler from '@/hooks/useAIStreamHandler'
import { toast } from 'sonner'
import ToolCallsContainer from './ToolCallsContainer'
import EnhancedReasoningStep from './EnhancedReasoningStep'
import EnhancedReferenceCard from './EnhancedReferenceCard'

interface MessageListProps {
  messages: ChatMessage[]
}

interface MessageWrapperProps {
  message: ChatMessage
  isLastMessage: boolean
  messageIndex: number
}

interface ReferenceProps {
  references: ReferenceData[]
}

const References: FC<ReferenceProps> = ({ references }) => (
  <div className="flex flex-col gap-4 w-full">
    {references.map((referenceData, index) => (
      <div
        key={`${referenceData.query}-${index}`}
        className="flex flex-col gap-3"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {referenceData.references.map((reference, refIndex) => (
            <EnhancedReferenceCard
              key={`${reference.name}-${reference.meta_data.chunk}-${refIndex}`}
              reference={reference}
              query={referenceData.query}
              time={referenceData.time}
            />
          ))}
        </div>
      </div>
    ))}
  </div>
)

const AgentMessageWrapper = ({ message, messageIndex }: MessageWrapperProps) => {
  const { handleStreamResponse } = useAIChatStreamHandler()
  const messages = useStore((state) => state.messages)
  const setMessages = useStore((state) => state.setMessages)

  const handleRetry = async () => {
    // Find the user message that triggered this agent response
    let userMessageIndex = messageIndex - 1
    while (userMessageIndex >= 0 && messages[userMessageIndex].role !== 'user') {
      userMessageIndex--
    }

    if (userMessageIndex >= 0) {
      const userMessage = messages[userMessageIndex]
      
      // Clear the current agent message content (but keep the message object)
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages]
        updatedMessages[messageIndex] = {
          ...updatedMessages[messageIndex],
          content: '',
          tool_calls: [],
          extra_data: undefined,
          videos: undefined,
          images: undefined,
          audio: undefined,
          response_audio: undefined,
          streamingError: false
        }
        return updatedMessages
      })

      try {
        // Create FormData with the original message
        const formData = new FormData()
        formData.append('message', userMessage.content || '')
        formData.append('__retry', 'true') // Flag to indicate this is a retry
        
        // Add attachments if they exist
        if (userMessage.attachments) {
          formData.append('attachments', JSON.stringify(userMessage.attachments))
        }

        // Retry the request - this will update the existing message
        await handleStreamResponse(formData)
      } catch (error) {
        toast.error(
          `Error retrying: ${
            error instanceof Error ? error.message : String(error)
          }`
        )
      }
    }
  }

  return (
    <div className="flex flex-col gap-y-9">
      {message.extra_data?.reasoning_steps &&
        message.extra_data.reasoning_steps.length > 0 && (
          <div className="flex items-start gap-4">
            <Icon type="reasoning" size="sm" />
            <div className="flex flex-col gap-3">
              <p className="text-xs uppercase text-primary/80">Reasoning</p>
              <div className="flex flex-col gap-2">
                {message.extra_data.reasoning_steps.map((step, index) => (
                  <EnhancedReasoningStep
                    key={`${step.title}-${step.action}-${index}`}
                    step={step}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      {message.extra_data?.references &&
        message.extra_data.references.length > 0 && (
          <div className="flex items-start gap-4 w-full">
            <Icon type="references" size="sm" className="mt-1" />
            <div className="flex flex-col gap-3 flex-1 min-w-0">
              <p className="text-xs uppercase text-primary/80">References</p>
              <References references={message.extra_data.references} />
            </div>
          </div>
        )}
      {message.tool_calls && message.tool_calls.length > 0 && (
        <ToolCallsContainer toolCalls={message.tool_calls} />
      )}
      <AgentMessage message={message} onRetry={handleRetry} />
    </div>
  )
}

const Messages = ({ messages }: MessageListProps) => {
  if (messages.length === 0) {
    return <ChatBlankState />
  }

  return (
    <>
      {messages.map((message, index) => {
        const key = `${message.role}-${message.created_at}-${index}`
        const isLastMessage = index === messages.length - 1

        if (message.role === 'agent') {
          return (
            <AgentMessageWrapper
              key={key}
              message={message}
              isLastMessage={isLastMessage}
              messageIndex={index}
            />
          )
        }
        return <UserMessage key={key} message={message} />
      })}
    </>
  )
}

export default Messages
