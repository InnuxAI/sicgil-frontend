'use client'

import { memo, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExpandableSectionProps {
  title: string | ReactNode
  children: ReactNode
  defaultExpanded?: boolean
  icon?: ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
}

const ExpandableSection = memo(({
  title,
  children,
  defaultExpanded = false,
  icon,
  className,
  headerClassName,
  contentClassName
}: ExpandableSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className={cn('rounded-lg border border-accent/30 bg-background-secondary/30 overflow-hidden', className)}>
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center justify-between p-3 text-left transition-colors hover:bg-background-secondary/50',
          headerClassName
        )}
        whileHover={{ x: 1 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.15 }}
      >
        <div className="flex items-center gap-2 flex-1">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span className="text-sm font-semibold text-primary">
            {title}
          </span>
        </div>
        
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="flex-shrink-0"
        >
          <ChevronDown className="h-4 w-4 text-primary/60" />
        </motion.div>
      </motion.button>

      <AnimatePresence initial={false}>
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
            className="overflow-hidden"
          >
            <motion.div
              className={cn('p-3 pt-0', contentClassName)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

ExpandableSection.displayName = 'ExpandableSection'

export default ExpandableSection
