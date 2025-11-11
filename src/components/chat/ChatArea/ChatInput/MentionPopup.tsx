'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Search, Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getFileTypeInfo } from '@/lib/fileUtils'
import { BlobFileMetadata } from '@/api/os'

interface MentionPopupProps {
  files: BlobFileMetadata[]
  isLoading: boolean
  searchQuery: string
  onSelect: (file: BlobFileMetadata) => void
  onClose: () => void
  onRefresh: () => void
  position?: { bottom: number; left: number }
}

const MentionPopup = ({
  files,
  isLoading,
  searchQuery,
  onSelect,
  onClose,
  onRefresh,
  position
}: MentionPopupProps) => {
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Filter files based on search query
  const filteredFiles = useMemo(() => {
    if (!localSearch.trim()) return files
    
    const query = localSearch.toLowerCase()
    return files.filter(file => 
      file.name.toLowerCase().includes(query)
    )
  }, [files, localSearch])

  // Reset selected index when filtered files change
  useEffect(() => {
    setSelectedIndex(0)
  }, [filteredFiles])

  // Focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus()
  }, [])

  // Update local search when external searchQuery changes
  useEffect(() => {
    setLocalSearch(searchQuery)
  }, [searchQuery])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => 
            Math.min(prev + 1, filteredFiles.length - 1)
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (filteredFiles[selectedIndex]) {
            onSelect(filteredFiles[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [filteredFiles, selectedIndex, onSelect, onClose])

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [selectedIndex])

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div
      className="bg-background border-border w-96 overflow-hidden rounded-lg border shadow-lg"
      style={position ? { 
        position: 'absolute',
        bottom: `${position.bottom}px`, 
        left: `${position.left}px`,
        maxHeight: '300px'
      } : {}}
    >
      {/* Search Bar */}
      <div className="border-border flex items-center gap-2 border-b p-2">
        <Search className="text-muted-foreground h-4 w-4 flex-shrink-0" />
        <input
          ref={searchInputRef}
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search files..."
          className="text-foreground placeholder:text-muted-foreground w-full bg-transparent text-sm outline-none"
        />
        {isLoading ? (
          <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
        ) : (
          <button
            onClick={onRefresh}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh files"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* File List */}
      <div
        ref={listRef}
        className="overflow-y-auto"
        style={{ maxHeight: '220px' }}
      >
        {isLoading && files.length === 0 ? (
          <div className="text-muted-foreground flex items-center justify-center gap-2 p-8">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading files...</span>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-muted-foreground p-8 text-center text-sm">
            {localSearch.trim() ? 'No files found' : 'No files available'}
          </div>
        ) : (
          filteredFiles.map((file, index) => {
            const fileInfo = getFileTypeInfo(file.name, file.content_type)
            const FileIcon = fileInfo.icon
            const isSelected = index === selectedIndex

            return (
              <button
                key={file.name}
                onClick={() => onSelect(file)}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-2 text-left transition-colors',
                  isSelected
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent/50'
                )}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded',
                    fileInfo.bgColor
                  )}
                >
                  <FileIcon className={cn('h-4 w-4', fileInfo.textColor)} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-foreground truncate text-sm font-medium">
                    {file.name}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {formatFileSize(file.size)}
                    {file.last_modified && (
                      <span className="ml-2">
                        • {new Date(file.last_modified).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>

      {/* Footer hint */}
      <div className="bg-muted/50 border-border flex items-center justify-between border-t px-3 py-1.5 text-xs text-muted-foreground">
        <span>↑↓ Navigate • Enter Select • Esc Close</span>
        <span>{filteredFiles.length} files</span>
      </div>
    </div>
  )
}

export default MentionPopup
