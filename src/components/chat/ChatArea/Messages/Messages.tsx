import type { ChatMessage } from '@/types/os'

import { AgentMessage, UserMessage } from './MessageItem'
import Tooltip from '@/components/ui/tooltip'
import { memo, useState } from 'react'
import {
  ToolCallProps,
  ReasoningStepProps,
  ReasoningProps,
  ReferenceData,
  Reference
} from '@/types/os'
import React, { type FC } from 'react'

import Icon from '@/components/ui/icon'
import ChatBlankState from './ChatBlankState'
import { useStore } from '@/store'
import useAIChatStreamHandler from '@/hooks/useAIStreamHandler'
import { toast } from 'sonner'

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

interface ReferenceItemProps {
  reference: Reference
}

const ReferenceItem: FC<ReferenceItemProps> = ({ reference }) => (
  <div className="relative flex h-[63px] w-[190px] cursor-default flex-col justify-between overflow-hidden rounded-md bg-background-secondary p-3 transition-colors hover:bg-background-secondary/80">
    <p className="text-sm font-medium text-primary">{reference.name}</p>
    <p className="truncate text-xs text-primary/40">{reference.content}</p>
  </div>
)

const References: FC<ReferenceProps> = ({ references }) => (
  <div className="flex flex-col gap-4">
    {references.map((referenceData, index) => (
      <div
        key={`${referenceData.query}-${index}`}
        className="flex flex-col gap-3"
      >
        <div className="flex flex-wrap gap-3">
          {referenceData.references.map((reference, refIndex) => (
            <ReferenceItem
              key={`${reference.name}-${reference.meta_data.chunk}-${refIndex}`}
              reference={reference}
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
            <Tooltip
              delayDuration={0}
              content={<p className="text-accent">Reasoning</p>}
              side="top"
            >
              <Icon type="reasoning" size="sm" />
            </Tooltip>
            <div className="flex flex-col gap-3">
              <p className="text-xs uppercase">Reasoning</p>
              <Reasonings reasoning={message.extra_data.reasoning_steps} />
            </div>
          </div>
        )}
      {message.extra_data?.references &&
        message.extra_data.references.length > 0 && (
          <div className="flex items-start gap-4">
            <Tooltip
              delayDuration={0}
              content={<p className="text-accent">References</p>}
              side="top"
            >
              <Icon type="references" size="sm" />
            </Tooltip>
            <div className="flex flex-col gap-3">
              <References references={message.extra_data.references} />
            </div>
          </div>
        )}
      {message.tool_calls && message.tool_calls.length > 0 && (
        <div className="flex items-start gap-3">
          <Tooltip
            delayDuration={0}
            content={<p className="text-accent">Tool Calls</p>}
            side="top"
          >
            <Icon
              type="hammer"
              className="rounded-lg bg-background-secondary p-1"
              size="sm"
              color="secondary"
            />
          </Tooltip>

          <div className="flex w-full flex-col gap-2">
            {message.tool_calls.map((toolCall, index) => (
              <ToolComponent
                key={
                  toolCall.tool_call_id ||
                  `${toolCall.tool_name}-${toolCall.created_at}-${index}`
                }
                tools={toolCall}
              />
            ))}
          </div>
        </div>
      )}
      <AgentMessage message={message} onRetry={handleRetry} />
    </div>
  )
}
const Reasoning: FC<ReasoningStepProps> = ({ index, stepTitle }) => (
  <div className="flex items-center gap-2 text-secondary">
    <div className="flex h-[20px] items-center rounded-md bg-background-secondary p-2">
      <p className="text-xs">STEP {index + 1}</p>
    </div>
    <p className="text-xs">{stepTitle}</p>
  </div>
)
const Reasonings: FC<ReasoningProps> = ({ reasoning }) => (
  <div className="flex flex-col items-start justify-center gap-2">
    {reasoning.map((title, index) => (
      <Reasoning
        key={`${title.title}-${title.action}-${index}`}
        stepTitle={title.title}
        index={index}
      />
    ))}
  </div>
)

const ToolComponent = memo(({ tools }: ToolCallProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex cursor-pointer items-center gap-2 rounded-lg bg-accent px-3 py-2 text-xs transition-all hover:bg-accent/80"
      >
        <Icon 
          type={isExpanded ? "chevron-up" : "chevron-down"} 
          size="xxs" 
        />
        <p className="font-dmmono uppercase text-primary/80">
          {tools.tool_name}
        </p>
        {(tools.metrics?.time || tools.metrics?.duration) && (
          <span className="ml-auto text-primary/60">
            {((tools.metrics?.time || tools.metrics?.duration || 0)).toFixed(2)}s
          </span>
        )}
      </button>
      
      {isExpanded && (
        <div className="flex flex-col gap-3 rounded-lg border border-accent/50 bg-primaryAccent/30 p-3 text-xs">
          {/* Input/Arguments */}
          {tools.tool_args && Object.keys(tools.tool_args).length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-primary">Input:</p>
              <pre className="overflow-x-auto rounded bg-background-secondary p-2 font-mono text-xs text-primary">
                {JSON.stringify(tools.tool_args, null, 2)}
              </pre>
            </div>
          )}
          
          {/* Output/Result */}
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-primary">Output:</p>
            {(tools.result || tools.content) ? (
              <pre className="max-h-[400px] overflow-auto whitespace-pre-wrap break-words rounded bg-background-secondary p-2 font-mono text-xs text-primary">
                {tools.result || tools.content}
              </pre>
            ) : (
              <div className="rounded bg-background-secondary p-2 text-primary/50">
                <span className="italic">No output yet or still loading...</span>
              </div>
            )}
          </div>
          
          {/* Error State */}
          {tools.tool_call_error && (
            <div className="flex items-center gap-2 rounded bg-destructive/10 p-2 text-destructive">
              <Icon type="x" size="xxs" />
              <span>Tool execution failed</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
})
ToolComponent.displayName = 'ToolComponent'
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
