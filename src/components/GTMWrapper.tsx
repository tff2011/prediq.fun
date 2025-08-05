'use client'

import { usePathname } from 'next/navigation'
import { GoogleTagManagerHead, GoogleTagManagerBody } from './GoogleTagManager'

interface GTMWrapperProps {
  gtmId: string | undefined
  position: 'head' | 'body'
}

export function GTMWrapper({ gtmId, position }: GTMWrapperProps) {
  const pathname = usePathname()
  
  // Don't render GTM on admin routes
  if (!gtmId || pathname.includes('/admin')) {
    return null
  }

  if (position === 'head') {
    return <GoogleTagManagerHead gtmId={gtmId} />
  }

  return <GoogleTagManagerBody gtmId={gtmId} />
}