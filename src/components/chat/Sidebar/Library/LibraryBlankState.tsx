'use client'

import { Library } from 'lucide-react'

const LibraryBlankState = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
      <Library className="h-8 w-8 text-muted-foreground/50" />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-muted-foreground">
          No saved prompts yet
        </p>
        <p className="text-xs text-muted-foreground/60">
          Bookmark prompts from your chats to save them here
        </p>
      </div>
    </div>
  )
}

export default LibraryBlankState
