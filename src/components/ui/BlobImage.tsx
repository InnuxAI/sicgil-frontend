'use client'

import { FC, useState, useEffect, memo } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { PARAGRAPH_SIZES } from './typography/Paragraph/constants'
import { getBlobUrlAPI } from '@/api/os'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7777'

interface BlobImageProps {
  blobName: string
  alt?: string
  className?: string
}

interface BlobUrlCache {
  url: string
  expiresAt: Date
}

// Global cache for blob URLs to avoid repeated API calls
const urlCache = new Map<string, BlobUrlCache>()

/**
 * BlobImage Component
 * 
 * Handles images stored in Azure Blob Storage by converting blob filenames to SAS URLs.
 * 
 * Features:
 * - Automatically converts blob filenames to temporary SAS URLs
 * - Caches URLs with expiry tracking
 * - Auto-refreshes URLs before expiry (5 min buffer)
 * - Requires user authentication
 * - Works seamlessly in markdown content
 * 
 * Usage in agent responses:
 * ![Chart](chart_20231110_143000.png)
 */
const BlobImage: FC<BlobImageProps> = memo(({ blobName, alt, className }) => {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    let mounted = true

    async function loadBlobUrl() {
      try {
        // Check if we have a valid cached URL
        const cached = urlCache.get(blobName)
        if (cached && new Date() < cached.expiresAt) {
          if (mounted) {
            setImageUrl(cached.url)
            setLoading(false)
          }
          return
        }
        
        // Use centralized API to get blob URL
        const data = await getBlobUrlAPI(API_URL, blobName, 24)

        if (!data || !data.url) {
          throw new Error('No URL returned from server')
        }

        // Cache the URL with expiry (24 hours - 5 min buffer)
        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + 24)
        expiresAt.setMinutes(expiresAt.getMinutes() - 5) // 5 min buffer

        urlCache.set(blobName, {
          url: data.url,
          expiresAt
        })

        if (mounted) {
          setImageUrl(data.url)
          setLoading(false)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load image')
          setLoading(false)
        }
      }
    }

    loadBlobUrl()

    return () => {
      mounted = false
    }
  }, [blobName])

  if (loading) {
    return (
      <div className="flex h-40 w-full max-w-xl items-center justify-center rounded-md bg-secondary/50">
        <div className="flex items-center gap-2 text-muted">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <span className={PARAGRAPH_SIZES.body}>Loading image...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-xl">
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-md bg-secondary/50 text-muted">
          <p className={cn(PARAGRAPH_SIZES.body, 'text-primary')}>
            Image unavailable
          </p>
          <p className={cn(PARAGRAPH_SIZES.body, 'text-xs text-muted')}>
            {error}
          </p>
          <p className={cn(PARAGRAPH_SIZES.body, 'max-w-md truncate text-xs')}>
            {blobName}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('w-full max-w-xl', className)}>
      <Image
        src={imageUrl}
        width={1280}
        height={720}
        alt={alt ?? blobName}
        className="size-full rounded-md object-cover"
        onError={() => {
          setError('Failed to load image')
          // Clear cache on error
          urlCache.delete(blobName)
        }}
        unoptimized
      />
    </div>
  )
})

BlobImage.displayName = 'BlobImage'

/**
 * Clear the blob URL cache
 * Call this when user logs out
 */
export function clearBlobUrlCache(blobName?: string) {
  if (blobName) {
    urlCache.delete(blobName)
  } else {
    urlCache.clear()
  }
}

export default BlobImage
