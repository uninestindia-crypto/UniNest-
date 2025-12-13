'use client'

import type { AnalyticsPayload } from '@/lib/analytics'

type InstallPlatform = 'ios' | 'android'
type GtagFn = (command: 'event', eventName: string, params?: AnalyticsPayload) => void

declare global {
  interface Window {
    gtag?: GtagFn
  }
}

export function trackPWAInstall(platform: InstallPlatform) {
  if (typeof window === 'undefined') return

  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'pwa_install', {
        platform,
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[pwaAnalytics] failed to send gtag event', error)
    }
  }

  try {
    void fetch('/api/analytics/pwa-install', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      }),
    })
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[pwaAnalytics] failed to send custom analytics', error)
    }
  }

  try {
    localStorage.setItem('pwa_installed', 'true')
    localStorage.setItem('pwa_install_date', new Date().toISOString())
    localStorage.setItem('pwa_platform', platform)
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[pwaAnalytics] failed to store install data locally', error)
    }
  }
}

export function isPWAInstalled(): boolean {
  if (typeof window === 'undefined') return false

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
    document.referrer.includes('android-app://')
  )
}

export function getPWAInstallDate(): string | null {
  if (typeof window === 'undefined') return null

  try {
    return localStorage.getItem('pwa_install_date')
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[pwaAnalytics] failed to access install date', error)
    }
    return null
  }
}
