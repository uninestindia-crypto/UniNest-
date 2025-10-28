'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { X, Share, Plus, Home } from 'lucide-react'
import { trackPWAInstall, isPWAInstalled } from '@/utils/pwaAnalytics'
import { trackEvent } from '@/lib/analytics'

interface DeviceState {
  isIOS: boolean
  isAndroid: boolean
  isInstalled: boolean
  isIpad: boolean
  isStandalone: boolean
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const SHARE_ICON_LABEL = 'Share'

export default function StealthAppDownload() {
  const [device, setDevice] = useState<DeviceState | null>(null)
  const [showIOSModal, setShowIOSModal] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  const detectDevice = useCallback((): DeviceState => {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent || navigator.vendor : ''
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as { MSStream?: unknown }).MSStream
    const isAndroid = /android/i.test(userAgent)
    const isIpad = /iPad/.test(userAgent)

    const nav = typeof navigator !== 'undefined' ? (navigator as Navigator & { standalone?: boolean }) : undefined
    const isStandalone =
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches || nav?.standalone === true)

    const installed = isPWAInstalled() || (isIOS && isStandalone)

    return {
      isIOS,
      isAndroid,
      isInstalled: installed,
      isIpad,
      isStandalone: Boolean(isStandalone),
    }
  }, [])

  const recordInstall = useCallback((platform: 'ios' | 'android') => {
    if (typeof window === 'undefined') return

    try {
      if (localStorage.getItem('pwa_installed') === 'true') {
        return
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[stealth-app-download] failed to read install flag', error)
      }
    }

    trackPWAInstall(platform)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    setDevice(detectDevice())

    const handleBeforeInstallPrompt = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEvent
      promptEvent.preventDefault()
      setDeferredPrompt(promptEvent)
    }

    const handleAppInstalled = () => {
      recordInstall('android')
      setDevice((prev) => (prev ? { ...prev, isInstalled: true } : null))
      setDeferredPrompt(null)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setDevice(detectDevice())
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [detectDevice, recordInstall])

  // Android Installation
  const handleAndroidInstall = useCallback(async () => {
    trackEvent('pwa_install_click', { platform: 'android' })

    if (!deferredPrompt) {
      if (typeof window !== 'undefined') {
        window.open('https://support.google.com/chrome/answer/9658361', '_blank', 'noopener')
      }
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      recordInstall('android')
      setDevice((prev) => (prev ? { ...prev, isInstalled: true } : prev))
    }

    setDeferredPrompt(null)
  }, [deferredPrompt, recordInstall])

  // iOS Installation Instructions
  const handleIOSInstall = useCallback(() => {
    setShowIOSModal(true)
    trackEvent('pwa_install_click', { platform: 'ios' })
    trackEvent('pwa_install_modal_open', { platform: 'ios' })
  }, [])

  const closeIOSModal = useCallback(() => {
    setShowIOSModal(false)
  }, [])

  const shouldShowAndroidButton = useMemo(() => {
    if (!device) return false
    if (!device.isAndroid) return false
    return !device.isInstalled
  }, [device])

  const shouldShowIOSButton = useMemo(() => {
    if (!device) return false
    if (!device.isIOS) return false
    if (device.isStandalone) return false
    return !device.isInstalled
  }, [device])

  const iosSteps = useMemo(() => {
    if (!device?.isIOS) return [] as Array<{ title: string; description: ReactNode }>

    const shareInstruction = device.isIpad
      ? 'Tap the Share button in the Safari toolbar at the top right'
      : 'Tap the Share button in the Safari toolbar at the bottom'

    return [
      {
        title: 'Open the Share menu',
        description: (
          <>
            {shareInstruction}. Look for the{' '}
            <Share aria-label={SHARE_ICON_LABEL} className="mx-1 inline h-4 w-4" /> icon.
          </>
        ),
      },
      {
        title: 'Choose “Add to Home Screen”',
        description: (
          <>
            Scroll through the options and tap <Plus className="mx-1 inline h-4 w-4" /> “Add to Home Screen”.
          </>
        ),
      },
      {
        title: 'Confirm the name and tap “Add”',
        description: (
          <>
            The UniNest icon appears with your apps so you can open it like any native app.
          </>
        ),
      },
    ]
  }, [device])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!device) return

    if (device.isIOS && device.isInstalled) {
      recordInstall('ios')
    }
  }, [device, recordInstall])

  if (!device || device.isInstalled) return null

  return (
    <>
      {shouldShowAndroidButton && (
        <button
          onClick={handleAndroidInstall}
          className="inline-flex items-center gap-3 rounded-lg bg-black px-6 py-3 text-white transition-colors hover:bg-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          style={{
            fontFamily: 'Google Sans, sans-serif',
          }}
          aria-label="Get UniNest on Google Play"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.523 15.341c-.1-.3-.25-.6-.45-.9a4.9 4.9 0 00-1-1.1 5.1 5.1 0 00-1.5-.8 5.6 5.6 0 00-1.9-.3 5.6 5.6 0 00-1.9.3c-.6.2-1.1.5-1.5.8-.4.3-.8.7-1 1.1-.2.3-.4.6-.5.9-.1.3-.1.6-.1.9 0 .9.3 1.7.8 2.4.5.7 1.2 1.2 2.1 1.5v3.8c0 .4.3.8.8.8s.8-.3.8-.8v-3.5h2.1v3.5c0 .4.3.8.8.8s.8-.3.8-.8v-3.8c.9-.3 1.6-.8 2.1-1.5.5-.7.8-1.5.8-2.4 0-.3 0-.6-.1-.9zm-11.4-2.7l1.4 2.4c-.5.3-.9.7-1.2 1.2-.3.5-.5 1-.6 1.6l-2.4-1.4c.2-1.4.8-2.6 1.8-3.7zm7.4 3.7c-.3-.5-.7-.9-1.2-1.2l1.4-2.4c1 1.1 1.6 2.3 1.8 3.7l-2.4 1.4c-.1-.6-.3-1.1-.6-1.6zM12 4.5c.4 0 .8-.3.8-.8s-.3-.8-.8-.8-.8.3-.8.8.4.8.8.8z" />
          </svg>
          <div className="text-left">
            <div className="text-xs opacity-80">GET IT ON</div>
            <div className="text-sm font-semibold">Google Play</div>
          </div>
        </button>
      )}

      {shouldShowIOSButton && (
        <button
          onClick={handleIOSInstall}
          className="inline-flex items-center gap-3 rounded-lg bg-black px-6 py-3 text-white shadow transition-colors hover:bg-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          }}
          aria-label="Download UniNest on the App Store"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5M13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
          </svg>
          <div className="text-left">
            <div className="text-xs opacity-80">Download on the</div>
            <div className="text-sm font-semibold">App Store</div>
          </div>
        </button>
      )}

      {showIOSModal && shouldShowIOSButton && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
          style={{
            paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)',
            paddingTop: 'max(env(safe-area-inset-top), 1rem)',
          }}
        >
          <div className="w-full max-w-md rounded-t-[28px] bg-white shadow-2xl transition sm:rounded-3xl dark:bg-gray-900 animate-slide-up">
            <div
              className="p-6 pt-5 sm:pt-6"
              style={{
                paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
              }}
            >
              <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-700" aria-hidden="true" />
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Install UniNest App</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Add UniNest to your {device?.isIpad ? 'iPad' : 'iPhone'} for a full-screen, native experience.
                  </p>
                </div>
                <button
                  onClick={closeIOSModal}
                  className="rounded-full p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Close install instructions"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {iosSteps.map((step, index) => (
                  <div key={step.title} className="flex items-start gap-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-white font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-gray-900 dark:text-white">{step.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-900 dark:bg-blue-900/20 dark:text-blue-200">
                  💡 <strong>Tip:</strong> Once added, UniNest opens full screen and works offline just like a native app.
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Having trouble? Ensure you’re using Safari, then follow the steps above. Other browsers on iOS don’t yet support adding PWAs to the home screen.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
