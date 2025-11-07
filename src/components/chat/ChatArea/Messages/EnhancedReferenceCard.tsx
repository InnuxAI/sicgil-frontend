'use client'

import { memo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Clock, Search, ChevronDown } from 'lucide-react'
import { Reference } from '@/types/os'
import { MetadataBadge } from '@/components/ui/MetadataDisplay'
import { CopyButton } from '@/components/ui/shadcn-io/copy-button'

interface EnhancedReferenceCardProps {
  reference: Reference
  query?: string
  time?: number
}

const EnhancedReferenceCard = memo(({
  reference,
  query,
  time
}: EnhancedReferenceCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.div
      className="relative rounded-lg border border-accent/30 bg-background-secondary/30 overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 text-left hover:bg-background-secondary/50 transition-colors"
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileText className="h-4 w-4 flex-shrink-0 text-primary/60" />
            <p className="text-sm font-semibold text-primary truncate">
              {reference.name}
            </p>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            <ChevronDown className="h-4 w-4 text-primary/60" />
          </motion.div>
        </div>

        {/* Metadata Badges */}
        <div className="flex gap-2 flex-wrap mb-2">
          <MetadataBadge
            label="Chunk"
            value={`${reference.meta_data.chunk}`}
            icon={<FileText className="h-3 w-3" />}
            variant="default"
            size="sm"
          />
          {time !== undefined && (
            <MetadataBadge
              label="Retrieved"
              value={`${time.toFixed(0)}ms`}
              icon={<Clock className="h-3 w-3" />}
              variant="info"
              size="sm"
            />
          )}
        </div>

        {/* Preview when collapsed */}
        {!isExpanded && (
          <p className="text-xs text-primary/60 line-clamp-2 mt-2">
            {reference.content}
          </p>
        )}
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: 'auto',
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
            className="overflow-hidden border-t border-accent/20"
          >
            <div className="p-3 space-y-3">
              {/* Original Query */}
              {query && (
                <div className="rounded-lg bg-primary-accent/10 border border-primary-accent/20 p-2.5">
                  <p className="text-xs font-semibold mb-1.5 text-primary-accent flex items-center gap-1.5">
                    <Search className="h-3 w-3" />
                    Query:
                  </p>
                  <p className="text-xs text-primary/80 italic">&ldquo;{query}&rdquo;</p>
                </div>
              )}

              {/* Full Content */}
              <div className="rounded-lg bg-background-secondary p-2.5">
                <p className="text-xs font-semibold mb-1.5 text-primary">Content:</p>
                <p className="text-xs text-primary/80 whitespace-pre-wrap max-h-[300px] overflow-y-auto leading-relaxed">
                  {reference.content}
                </p>
              </div>

              {/* Chunk Metadata */}
              <div className="flex items-center justify-between text-xs text-primary/50">
                <span>Chunk size: {reference.meta_data.chunk_size} characters</span>
              </div>

              {/* Copy Button */}
              <div className="flex justify-end">
                <CopyButton
                  content={reference.content}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

EnhancedReferenceCard.displayName = 'EnhancedReferenceCard'

export default EnhancedReferenceCard
