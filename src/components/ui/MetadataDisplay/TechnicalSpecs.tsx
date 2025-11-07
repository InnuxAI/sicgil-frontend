'use client'

import { memo } from 'react'
import { cn } from '@/lib/utils'

interface TechnicalSpecsProps {
  specs: Record<string, string | number>
  columns?: 1 | 2
  size?: 'sm' | 'md'
  className?: string
}

const sizeStyles = {
  sm: 'text-xs gap-2 p-2',
  md: 'text-sm gap-3 p-3'
} as const

const TechnicalSpecs = memo(({
  specs,
  columns = 2,
  size = 'sm',
  className
}: TechnicalSpecsProps) => {
  const entries = Object.entries(specs)

  if (entries.length === 0) {
    return (
      <div className={cn(
        'rounded-lg bg-background-secondary/50 p-3 text-center',
        className
      )}>
        <p className="text-xs text-primary/50 italic">No specifications available</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-lg bg-background-secondary/50 grid',
        sizeStyles[size],
        columns === 2 ? 'grid-cols-2' : 'grid-cols-1',
        className
      )}
    >
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="flex items-start justify-between gap-2 border-b border-accent/20 last:border-b-0 py-1.5"
        >
          <span className="font-semibold text-primary/80 flex-shrink-0">
            {key}:
          </span>
          <span className="text-primary/60 text-right font-mono break-words">
            {value}
          </span>
        </div>
      ))}
    </div>
  )
})

TechnicalSpecs.displayName = 'TechnicalSpecs'

export default TechnicalSpecs
