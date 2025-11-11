'use client'
import { Button } from '@/components/ui/button'
import { ModeSelector } from '@/components/chat/Sidebar/ModeSelector'
import { EntitySelector } from '@/components/chat/Sidebar/EntitySelector'
import useChatActions from '@/hooks/useChatActions'
import { useStore } from '@/store'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import Icon from '@/components/ui/icon'
import { getProviderIcon } from '@/lib/modelProvider'
import Sessions from './Sessions'
import Library from './Library'
import AuthToken from './AuthToken'
import UserProfile from './UserProfile'
import { isValidUrl } from '@/lib/utils'
import { toast } from 'sonner'
import { useQueryState } from 'nuqs'
import { truncateText } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter, usePathname } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7777";

const CollapsibleSection = ({
  title,
  children,
  defaultOpen = true
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-xs font-medium uppercase text-primary hover:text-primary/80 transition-colors"
      >
        <span>{title}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Icon type="chevron-down" size="xxs" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="w-full overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const SidebarHeader = ({ onLogoClick }: { onLogoClick: () => void }) => (
  <button 
    onClick={onLogoClick}
    className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
    type="button"
  >
    <div className="transition-transform duration-1000 hover:rotate-[405deg]">
      <Icon type="gemini" size="xs" />
    </div>
    <div className="-translate-x-1 rotate-45 transition-transform duration-1000 hover:rotate-[405deg]">
      <Icon type="gemini" size="xs" />
    </div>
    <span className="text-s font-semibold text-foreground">IntelliChat</span>
  </button>
)

const NewChatButton = ({
  disabled,
  onClick
}: {
  disabled: boolean
  onClick: () => void
}) => (
  <Button
    onClick={onClick}
    disabled={disabled}
    size="lg"
    className="h-9 w-full rounded-xl bg-primary text-xs font-medium text-background hover:bg-primary/80"
  >
    {/* <Icon type="plus-icon" size="xs" className="text-background" /> */}
    <span className="uppercase font-semibold">New Chat</span>
  </Button>
)

const DashboardButton = ({
  onClick,
  isActive
}: {
  onClick: () => void
  isActive: boolean
}) => (
  <Button
    onClick={onClick}
    size="lg"
    className={`h-9 w-full rounded-xl text-xs font-medium transition-all ${
      isActive 
        ? 'bg-primary text-background hover:bg-primary/80' 
        : 'bg-accent border border-primary/15 text-primary hover:bg-accent/80'
    }`}
  >
    <Icon type="activity" size="xs" className={isActive ? 'text-background' : 'text-primary'} />
    <span className="uppercase font-semibold">Dashboard</span>
  </Button>
)

const ModelDisplay = ({ model }: { model: string }) => (
  <div className="flex h-9 w-full items-center gap-3 rounded-xl border border-primary/15 bg-accent p-3 text-xs font-medium uppercase">
    {(() => {
      const icon = getProviderIcon(model)
      return icon ? <Icon type={icon} className="shrink-0" size="xs" /> : null
    })()}
    {model}
  </div>
)

const Endpoint = () => {
  const {
    selectedEndpoint,
    isEndpointActive,
    setSelectedEndpoint,
    setAgents,
    setSessionsData,
    setMessages
  } = useStore()
  const { initialize } = useChatActions()
  const [isEditing, setIsEditing] = useState(false)
  const [endpointValue, setEndpointValue] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [, setSessionId] = useQueryState('session')

  useEffect(() => {
    setEndpointValue(selectedEndpoint)
    setIsMounted(true)
  }, [selectedEndpoint])

  const getStatusColor = (isActive: boolean) =>
    isActive ? 'bg-positive' : 'bg-destructive'

  const handleSave = async () => {
    if (!isValidUrl(endpointValue)) {
      toast.error('Please enter a valid URL')
      return
    }
    const cleanEndpoint = endpointValue.replace(/\/$/, '').trim()
    setSelectedEndpoint(cleanEndpoint)
    setSessionId(null)
    setIsEditing(false)
    setIsHovering(false)
    setAgents([])
    setSessionsData([])
    setMessages([])
  }

  const handleCancel = () => {
    setEndpointValue(selectedEndpoint)
    setIsEditing(false)
    setIsHovering(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const handleRefresh = async () => {
    setIsRotating(true)
    await initialize()
    setTimeout(() => setIsRotating(false), 500)
  }

  return (
    <div className="flex w-full items-center gap-1">
      {isEditing ? (
        <>
          <input
            type="text"
            value={endpointValue}
            onChange={(e) => setEndpointValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex h-9 w-full items-center text-ellipsis rounded-xl border border-primary/15 bg-accent p-3 text-xs font-medium"
            autoFocus
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
            className="hover:cursor-pointer hover:bg-transparent"
          >
            <Icon type="save" size="xs" />
          </Button>
        </>
      ) : (
        <>
          <motion.div
            className="relative flex h-9 w-full cursor-pointer items-center justify-between rounded-xl border border-primary/15 bg-accent p-3 uppercase"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={() => setIsEditing(true)}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <AnimatePresence mode="wait">
              {isHovering ? (
                <motion.div
                  key="endpoint-display-hover"
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="flex items-center gap-2 whitespace-nowrap text-xs font-medium text-primary">
                    <Icon type="edit" size="xxs" /> EDIT AGENTOS
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="endpoint-display"
                  className="absolute inset-0 flex items-center justify-between px-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-xs font-medium text-primary/80">
                    {isMounted
                      ? truncateText(selectedEndpoint, 21) ||
                        API_URL
                      : 'http://localhost:7777'}
                  </p>
                  <div
                    className={`size-2 shrink-0 rounded-full ${getStatusColor(isEndpointActive)}`}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="hover:cursor-pointer hover:bg-transparent"
          >
            <motion.div
              key={isRotating ? 'rotating' : 'idle'}
              animate={{ rotate: isRotating ? 360 : 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              <Icon type="refresh" size="xs" />
            </motion.div>
          </Button>
        </>
      )}
    </div>
  )
}

const Sidebar = ({
  hasEnvToken,
  envToken
}: {
  hasEnvToken?: boolean
  envToken?: string
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const isDashboardActive = pathname === '/dashboard'
  
  const [isCollapsed, setIsCollapsed] = useState(isDashboardActive)
  const { clearChat, focusChatInput, initialize } = useChatActions()
  const {
    messages,
    selectedEndpoint,
    isEndpointActive,
    selectedModel,
    hydrated,
    isEndpointLoading,
    mode,
    selectedAgentId,
    selectedTeamId
  } = useStore()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    if (hydrated) initialize()
  }, [selectedEndpoint, initialize, hydrated, mode])

  useEffect(() => {
    // Collapse sidebar by default on dashboard page
    if (isDashboardActive) {
      setIsCollapsed(true)
    }
  }, [isDashboardActive])

  const handleNewChat = () => {
    router.push('/')
    clearChat()
    focusChatInput()
  }

  const handleLogoClick = () => {
    router.push('/')
    clearChat()
    focusChatInput()
  }

  const handleDashboardClick = () => {
    router.push('/dashboard')
  }

  return (
    <motion.aside
      className="relative flex h-screen shrink-0 grow-0 flex-col overflow-hidden px-2 py-3 font-geist"
      initial={{ width: '16rem' }}
      animate={{ width: isCollapsed ? '2.5rem' : '16rem' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <motion.button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute right-2 top-2 z-10 p-1"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        type="button"
        whileTap={{ scale: 0.95 }}
      >
        <Icon
          type="sheet"
          size="xs"
          className={`transform ${isCollapsed ? 'rotate-180' : 'rotate-0'}`}
        />
      </motion.button>
      <motion.div
        className="flex flex-col h-full w-60"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: isCollapsed ? 0 : 1, x: isCollapsed ? -20 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{
          pointerEvents: isCollapsed ? 'none' : 'auto'
        }}
      >
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-5 pb-4 scrollbar-thin">
          <SidebarHeader onLogoClick={handleLogoClick} />
          <NewChatButton
            disabled={messages.length === 0}
            onClick={handleNewChat}
          />
          <DashboardButton
            onClick={handleDashboardClick}
            isActive={isDashboardActive}
          />
          {isMounted && (
            <>
              <CollapsibleSection title="Server" defaultOpen={false}>
                <Endpoint />
              </CollapsibleSection>
              <CollapsibleSection title="Auth Token" defaultOpen={false}>
                <AuthToken hasEnvToken={hasEnvToken} envToken={envToken} />
              </CollapsibleSection>
              {isEndpointActive && (
                <>
                  <CollapsibleSection title="Mode" defaultOpen={false}>
                    <motion.div
                      className="flex w-full flex-col items-start gap-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                    >
                      {isEndpointLoading ? (
                        <div className="flex w-full flex-col gap-2">
                          {Array.from({ length: 3 }).map((_, index) => (
                            <Skeleton
                              key={index}
                              className="h-9 w-full rounded-xl"
                            />
                          ))}
                        </div>
                      ) : (
                        <>
                          <ModeSelector />
                          <EntitySelector />
                          {selectedModel && (selectedAgentId || selectedTeamId) && (
                            <ModelDisplay model={selectedModel} />
                          )}
                        </>
                      )}
                    </motion.div>
                  </CollapsibleSection>
                  <Tabs defaultValue="sessions" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-2">
                      <TabsTrigger value="sessions" className="text-xs">
                        Sessions
                      </TabsTrigger>
                      <TabsTrigger value="library" className="text-xs">
                        Library
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="sessions" className="mt-0">
                      <Sessions />
                    </TabsContent>
                    <TabsContent value="library" className="mt-0">
                      <Library />
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </>
          )}
        </div>
        
        {/* Fixed footer with UserProfile */}
        <div className="shrink-0 border-t border-border/50 pt-4">
          <UserProfile />
        </div>
      </motion.div>
    </motion.aside>
  )
}

export default Sidebar
