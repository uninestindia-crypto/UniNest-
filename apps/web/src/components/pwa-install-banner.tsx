'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const INSTALL_STORAGE_KEY = 'uninest-pwa-install-dismissed';

export function PwaInstallBanner() {
  const [visible, setVisible] = useState(false);
  const [isIosManualPrompt, setIsIosManualPrompt] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storage = window.localStorage;
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone;

    if (isStandalone) {
      storage.setItem(INSTALL_STORAGE_KEY, 'installed');
      setVisible(false);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEvent;
      promptEvent.preventDefault();
      const status = storage.getItem(INSTALL_STORAGE_KEY);
      if (status === 'dismissed' || status === 'installed') {
        return;
      }

      deferredPromptRef.current = promptEvent;
      setIsIosManualPrompt(false);
      setVisible(true);
    };

    const handleAppInstalled = () => {
      storage.setItem(INSTALL_STORAGE_KEY, 'installed');
      deferredPromptRef.current = null;
      setVisible(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    const status = storage.getItem(INSTALL_STORAGE_KEY);
    if (!status && !deferredPromptRef.current) {
      const isiOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
      if (isiOS && !isStandalone) {
        setIsIosManualPrompt(true);
        setVisible(true);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (typeof window === 'undefined') {
      return;
    }

    const storage = window.localStorage;
    const promptEvent = deferredPromptRef.current;

    if (promptEvent) {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      const status = outcome === 'accepted' ? 'installed' : 'dismissed';
      storage.setItem(INSTALL_STORAGE_KEY, status);
      deferredPromptRef.current = null;
      setVisible(status !== 'installed');
      return;
    }

    const isiOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    const fallbackUrl = isiOS
      ? 'https://support.apple.com/en-in/HT208982'
      : 'https://support.google.com/chrome/answer/9658361';

    window.open(fallbackUrl, '_blank', 'noopener');
    storage.setItem(INSTALL_STORAGE_KEY, 'dismissed');
    setVisible(false);
  };

  const handleDismiss = () => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(INSTALL_STORAGE_KEY, 'dismissed');
    deferredPromptRef.current = null;
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50 rounded-2xl border border-white/20 bg-slate-950/90 px-5 py-4 shadow-2xl backdrop-blur sm:left-auto sm:right-6 sm:w-96">
      <div className="flex items-start gap-4">
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold text-white">Install UniNest</p>
          <p className="text-xs text-slate-200">
            {isIosManualPrompt
              ? 'Add UniNest to your home screen from Safari for quick access.'
              : 'Add this experience to your home screen to access bookings and campaigns in one tap.'}
          </p>
        </div>
        <div className="flex flex-shrink-0 gap-2">
          <Button variant="ghost" size="sm" className="text-xs text-slate-200" onClick={handleDismiss}>
            Later
          </Button>
          <Button size="sm" className="text-xs" onClick={handleInstallClick}>
            Install
          </Button>
        </div>
      </div>
    </div>
  );
}
