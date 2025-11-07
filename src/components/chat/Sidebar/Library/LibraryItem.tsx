'use client'

import { FC, useState } from 'react'
import { SavedPrompt } from './Library'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CopyButton } from '@/components/ui/shadcn-io/copy-button'
import { Trash2 } from 'lucide-react'

interface LibraryItemProps {
  prompt: SavedPrompt
  onDelete: (id: string) => void
}

const LibraryItem: FC<LibraryItemProps> = ({ prompt, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false)

  const truncatePrompt = (text: string, maxLength: number = 20) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
    return `${Math.floor(diffInDays / 365)} years ago`
  }

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="group relative flex cursor-pointer items-start gap-2 rounded-lg px-3 py-2 bg-secondary transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="text-xs line-clamp-2">
            {truncatePrompt(prompt.prompt)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {formatDate(prompt.created_at)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(prompt._id)
          }}
        >
          <Trash2 className="h-3 w-3 text-destructive hover:bg-destructive/20" />
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Saved Prompt</DialogTitle>
            <DialogDescription>
              Saved on {new Date(prompt.created_at).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div className="rounded-lg bg-accent p-4 whitespace-pre-wrap">
              {prompt.prompt}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <CopyButton
                content={prompt.prompt}
                size="sm"
                className="bg-accent"
              />
              <Button
                className="bg-accent"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default LibraryItem
