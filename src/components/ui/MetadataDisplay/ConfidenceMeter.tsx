'use client'

import { memo } from 'react'
import { cn } from '@/lib/utils'

interface ConfidenceMeterProps {
  value: number // 0-100
  showPercentage?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const getConfidenceColor = (value: number): string => {
  if (value >= 75) return 'bg-positive'
  if (value >= 50) return 'bg-brand'
  return 'bg-destructive'
}

const getConfidenceLabel = (value: number): string => {
  if (value >= 90) return 'Very High'
  if (value >= 75) return 'High'
  if (value >= 50) return 'Medium'
  if (value >= 25) return 'Low'
  return 'Very Low'
}

const sizeStyles = {
  sm: { container: 'h-1.5', text: 'text-[10px]' },
  md: { container: 'h-2', text: 'text-xs' },
  lg: { container: 'h-2.5', text: 'text-sm' }
} as const

const ConfidenceMeter = memo(({
  value,
  showPercentage = true,
  size = 'md',
  className
}: ConfidenceMeterProps) => {
  // Clamp value between 0 and 100
  const clampedValue = Math.min(Math.max(value, 0), 100)
  const colorClass = getConfidenceColor(clampedValue)
  const label = getConfidenceLabel(clampedValue)

  return (
    <div className={cn('flex items-center gap-3 w-full', className)}>
      {/* Progress Bar */}
      <div className="flex-1 min-w-[100px]">
        <div
          className={cn(
            'w-full rounded-full bg-background-secondary overflow-hidden',
            sizeStyles[size].container
          )}
        >
          <div
            className={cn(
              'h-full transition-all duration-500 ease-out rounded-full',
              colorClass
            )}
            style={{ width: `${clampedValue}%` }}
          />
        </div>
      </div>

      {/* Label and Percentage */}
      <div className={cn('flex items-center gap-2 flex-shrink-0', sizeStyles[size].text)}>
        <span className="font-semibold text-primary/80">{label}</span>
        {showPercentage && (
          <span className="font-mono text-primary/60">
            {clampedValue.toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  )
})

ConfidenceMeter.displayName = 'ConfidenceMeter'

export default ConfidenceMeter
