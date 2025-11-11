'use client'

import { getFileTypeInfo } from '@/lib/fileUtils'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileMentionBadgeProps {
  fileName: string
  fileType?: string
  onRemove?: () => void
  className?: string
}

/**
 * Compact inline badge for file mentions in chat input
 * Similar to FileAttachmentBadge but smaller and optimized for inline display
 */
const FileMentionBadge = ({ 
  fileName, 
  fileType, 
  onRemove,
  className 
}: FileMentionBadgeProps) => {
  const fileInfo = getFileTypeInfo(fileName, fileType)
  const FileIcon = fileInfo.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium transition-all",
        fileInfo.bgColor,
        fileInfo.textColor,
        fileInfo.borderColor,
        className
      )}
      contentEditable={false}
      suppressContentEditableWarning
    >
      <FileIcon className="h-3 w-3 flex-shrink-0" />
      <span className="max-w-[150px] truncate" title={fileName}>
        {fileName}
      </span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onRemove()
          }}
          className={cn(
            "flex-shrink-0 transition-opacity hover:opacity-70",
            fileInfo.textColor
          )}
          type="button"
          aria-label="Remove mention"
          tabIndex={-1}
        >
          <X className="h-2.5 w-2.5" />
        </button>
      )}
    </span>
  )
}

export default FileMentionBadge
