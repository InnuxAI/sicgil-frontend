'use client'

import ChatInput from './ChatInput'
import MessageArea from './MessageArea'
const ChatArea = () => {
  return (
    <main className="relative m-1.5 flex h-full flex-grow flex-col rounded-xl bg-background">
      <div className="flex-1 overflow-hidden">
        <MessageArea />
      </div>
      <div className="ml-9 px-4 pb-4">
        <ChatInput />
      </div>
    </main>
  )
}

export default ChatArea
