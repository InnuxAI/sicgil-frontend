'use client'

import { memo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ProgressIndicatorProps {
  progress?: number // 0-100, if undefined shows indeterminate
  eta?: number // seconds
  label?: string
  variant?: 'linear' | 'circular'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeStyles = {
  sm: { height: 'h-1.5', circular: 'h-8 w-8', text: 'text-xs' },
  md: { height: 'h-2', circular: 'h-12 w-12', text: 'text-sm' },
  lg: { height: 'h-2.5', circular: 'h-16 w-16', text: 'text-base' }
} as const

const ProgressIndicator = memo(({
  progress,
  eta,
  label,
  variant = 'linear',
  size = 'md',
  className
}: ProgressIndicatorProps) => {
  const [countdown, setCountdown] = useState(eta)

  // Countdown timer for ETA
  useEffect(() => {
    if (eta === undefined) return

    setCountdown(eta)
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === undefined || prev <= 0) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [eta])

  const formatTime = (seconds: number | undefined): string => {
    if (seconds === undefined) return ''
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  if (variant === 'circular') {
    return (
      <div className={cn('flex flex-col items-center gap-2', className)}>
        <div className="relative">
          <Loader2 className={cn('animate-spin text-primary', sizeStyles[size].circular)} />
          {progress !== undefined && (
            <span className={cn(
              'absolute inset-0 flex items-center justify-center font-mono font-semibold',
              sizeStyles[size].text
            )}>
              {progress.toFixed(0)}%
            </span>
          )}
        </div>
        {label && (
          <p className={cn('text-center text-primary/80', sizeStyles[size].text)}>
            {label}
          </p>
        )}
        {countdown !== undefined && countdown > 0 && (
          <p className={cn('text-center text-primary/60 font-mono', sizeStyles[size].text)}>
            ETA: {formatTime(countdown)}
          </p>
        )}
      </div>
    )
  }

  // Linear variant
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {(label || countdown !== undefined) && (
        <div className="flex items-center justify-between">
          {label && (
            <p className={cn('text-primary/80', sizeStyles[size].text)}>
              {label}
            </p>
          )}
          {countdown !== undefined && countdown > 0 && (
            <p className={cn('text-primary/60 font-mono', sizeStyles[size].text)}>
              ETA: {formatTime(countdown)}
            </p>
          )}
        </div>
      )}
      
      <div className={cn(
        'w-full rounded-full bg-background-secondary overflow-hidden',
        sizeStyles[size].height
      )}>
        {progress === undefined ? (
          // Indeterminate progress
          <div className="h-full w-full bg-primary/30 animate-pulse" />
        ) : (
          // Determinate progress
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          />
        )}
      </div>

      {progress !== undefined && (
        <p className={cn('text-right text-primary/60 font-mono', sizeStyles[size].text)}>
          {progress.toFixed(0)}%
        </p>
      )}
    </div>
  )
})

ProgressIndicator.displayName = 'ProgressIndicator'

export default ProgressIndicator
