'use client'

import { memo, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface MetadataBadgeProps {
  label: string
  value: string | number
  icon?: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md'
  className?: string
}

const variantStyles = {
  default: 'bg-accent/20 text-primary/80',
  success: 'bg-green-500/20 text-green-500',
  warning: 'bg-yellow-500/20 text-yellow-500',
  error: 'bg-red-500/20 text-red-500',
  info: 'bg-blue-500/20 text-blue-500'
} as const

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[10px] gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5'
} as const

const MetadataBadge = memo(({
  label,
  value,
  icon,
  variant = 'default',
  size = 'sm',
  className
}: MetadataBadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md font-semibold uppercase transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="whitespace-nowrap">
        {label}: {value}
      </span>
    </span>
  )
})

MetadataBadge.displayName = 'MetadataBadge'

export default MetadataBadge
