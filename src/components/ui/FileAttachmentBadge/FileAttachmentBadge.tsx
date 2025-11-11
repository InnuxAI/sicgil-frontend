'use client'

import { getFileTypeInfo, truncateFileName } from '@/lib/fileUtils'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileAttachmentBadgeProps {
  fileName: string
  fileType?: string
  onRemove?: () => void
  maxLength?: number
  className?: string
}

const FileAttachmentBadge = ({ 
  fileName, 
  fileType, 
  onRemove,
  maxLength = 30,
  className 
}: FileAttachmentBadgeProps) => {
  const fileInfo = getFileTypeInfo(fileName, fileType)
  const FileIcon = fileInfo.icon
  const displayName = truncateFileName(fileName, maxLength)

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-all",
        fileInfo.bgColor,
        fileInfo.textColor,
        fileInfo.borderColor,
        className
      )}
    >
      <FileIcon className="h-3.5 w-3.5 flex-shrink-0" />
      <span className="font-medium" title={fileName}>
        {displayName}
      </span>
      {onRemove && (
        <button
          onClick={onRemove}
          className={cn(
            "ml-1 flex-shrink-0 transition-opacity hover:opacity-70",
            fileInfo.textColor
          )}
          type="button"
          aria-label="Remove file"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

export default FileAttachmentBadge
