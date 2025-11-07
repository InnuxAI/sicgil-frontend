import { memo, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Hammer, X } from 'lucide-react'
import Icon from '@/components/ui/icon'
import { ToolCall } from '@/types/os'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'

interface ToolCallsContainerProps {
  toolCalls: ToolCall[]
}

interface ToolItemProps {
  tool: ToolCall
}

// Role color mapping for badges
const roleColors = {
  user: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  assistant: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
  tool: 'bg-green-500/20 text-green-500 border-green-500/30',
  system: 'bg-orange-500/20 text-orange-500 border-orange-500/30'
} as const

const ToolItem = memo(({ tool }: ToolItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  return (
    <div className="flex flex-col gap-2">
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex cursor-pointer items-center gap-2 rounded-lg bg-accent px-3 py-2 text-xs transition-all hover:bg-accent/80"
        whileHover={{ scale: 1.002 }}
        whileTap={{ scale: 0.995 }}
        transition={{ duration: 0.15 }}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <ChevronDown className="h-3 w-3" />
        </motion.div>
        <p className="font-dmmono uppercase text-primary/80">
          {tool.tool_name}
        </p>
        
        {/* Role Badge */}
        {tool.role && (
          <span
            className={cn(
              'px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wide',
              roleColors[tool.role] || 'bg-gray-500/20 text-gray-500 border-gray-500/30'
            )}
          >
            {tool.role}
          </span>
        )}
        
        {(tool.metrics?.time || tool.metrics?.duration) && (
          <motion.span 
            className="ml-auto text-primary/60"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {((tool.metrics?.time || tool.metrics?.duration || 0)).toFixed(2)}s
          </motion.span>
        )}
      </motion.button>
      
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div 
            className="overflow-hidden rounded-lg border border-accent/50 bg-primaryAccent/30"
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: "auto", 
              opacity: 1,
              transition: {
                height: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.2, delay: 0.05 }
              }
            }}
            exit={{ 
              height: 0, 
              opacity: 0,
              transition: {
                height: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.15 }
              }
            }}
          >
            <motion.div
              className="p-3 text-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Input/Arguments */}
              {tool.tool_args && Object.keys(tool.tool_args).length > 0 && (
                <div className="flex flex-col gap-1 mb-3">
                  <p className="font-semibold text-primary">Input:</p>
                  <pre className="overflow-x-auto rounded bg-background-secondary p-2 font-mono text-xs text-primary">
                    {JSON.stringify(tool.tool_args, null, 2)}
                  </pre>
                </div>
              )}
              
              {/* Output/Result */} 
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-primary">Output:</p>
                {(tool.result || tool.content) ? (
                  <pre className="max-h-[400px] overflow-auto whitespace-pre-wrap break-words rounded bg-background-secondary p-2 font-mono text-xs text-primary">
                    {tool.result || tool.content}
                  </pre>
                ) : (
                  <div className="rounded bg-background-secondary p-2 text-primary/50">
                    <span className="italic">No output yet or still loading...</span>
                  </div>
                )}
              </div>
              
              {/* Error State */}
              {tool.tool_call_error && (
                <div className="flex items-center gap-2 rounded bg-destructive/10 p-2 text-destructive mt-2">
                  <X className="h-3 w-3" />
                  <span>Tool execution failed</span>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
ToolItem.displayName = 'ToolItem'

const ToolCallsContainer = memo(({ toolCalls }: ToolCallsContainerProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const isStreaming = useStore((state) => state.isStreaming)
  const containerRef = useRef<HTMLDivElement>(null)
  const prevToolCallsLength = useRef(toolCalls.length)

  // Auto-scroll to bottom when new tool calls are added during streaming (only if not collapsed)
  useEffect(() => {
    if (isStreaming && !isCollapsed && toolCalls.length > prevToolCallsLength.current) {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight
      }
    }
    prevToolCallsLength.current = toolCalls.length
  }, [toolCalls.length, isStreaming, isCollapsed])

  // Auto-expand when streaming starts and collapse when streaming completes
  useEffect(() => {
    if (isStreaming && toolCalls.length > 0) {
      // Auto-expand during streaming
      setIsCollapsed(false)
    } else if (!isStreaming && toolCalls.length > 0) {
      // Add a small delay to ensure all content is rendered, then collapse
      const timer = setTimeout(() => {
        setIsCollapsed(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isStreaming, toolCalls.length])

  if (toolCalls.length === 0) return null

  return (
    <motion.div 
      className="flex items-start gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex-shrink-0">
        <Icon
          type="hammer"
          className="rounded-lg bg-background-secondary p-1"
          size="sm"
          color="secondary"
        />
      </div>

      <div className="flex w-full flex-col gap-2">
        <motion.button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 text-xs text-primary/80 transition-colors hover:text-primary"
        //   whileHover={{ x: 1 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 90 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <ChevronDown className="h-3 w-3" />
          </motion.div>
          <motion.span 
            className="font-semibold uppercase"
            layout
          >
            Tool Calls ({toolCalls.length})
          </motion.span>
        </motion.button>

        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div 
              className="overflow-hidden rounded-lg border border-accent/30 bg-background-secondary/30"
              initial={{ height: 0, opacity: 0 }}
              animate={{ 
                height: "auto", 
                opacity: 1,
                transition: {
                  height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                  opacity: { duration: 0.2, delay: 0.05 }
                }
              }}
              exit={{ 
                height: 0, 
                opacity: 0,
                transition: {
                  height: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
                  opacity: { duration: 0.15 }
                }
              }}
            >
              <div 
                ref={containerRef}
                className="flex max-h-[400px] w-full flex-col gap-2 overflow-y-auto p-3"
              >
                {toolCalls.map((toolCall, index) => (
                  <motion.div
                    key={
                      toolCall.tool_call_id ||
                      `${toolCall.tool_name}-${toolCall.created_at}-${index}`
                    }
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: {
                        delay: index * 0.04,
                        duration: 0.25,
                        ease: [0.4, 0, 0.2, 1]
                      }
                    }}
                  >
                    <ToolItem tool={toolCall} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
})
ToolCallsContainer.displayName = 'ToolCallsContainer'

export default ToolCallsContainer
