import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:7777'

/**
 * API Route: /api/blobs/[blobName]/url
 * 
 * Proxies blob URL generation requests to the backend.
 * This allows the frontend to request SAS URLs for blob storage images.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { blobName: string } }
) {
  try {
    const { blobName } = params
    const { searchParams } = new URL(request.url)
    const expiryHours = searchParams.get('expiry_hours') || '24'

    // Forward the request to the backend with auth cookies
    const backendUrl = `${BACKEND_URL}/api/blobs/${encodeURIComponent(blobName)}/url?expiry_hours=${expiryHours}`
    
    // Get cookies from the request to forward to backend
    const cookies = request.headers.get('cookie') || ''

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Cookie': cookies,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Failed to generate blob URL' },
        { status: response.status }
      )
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error generating blob URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate blob URL' },
      { status: 500 }
    )
  }
}
