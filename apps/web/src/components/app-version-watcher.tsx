'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppVersion } from '@/hooks/use-app-version';

type AppVersionWatcherProps = {
  intervalMs?: number;
  versionUrl?: string;
  reloadDelayMs?: number;
  className?: string;
};

type UpdateState = {
  isRefreshing: boolean;
  currentVersion: string | null;
  nextVersion: string | null;
};

const DEFAULT_RELOAD_DELAY_MS = 1_500;

export function AppVersionWatcher({
  intervalMs,
  versionUrl,
  reloadDelayMs = DEFAULT_RELOAD_DELAY_MS,
  className,
}: AppVersionWatcherProps) {
  const [updateState, setUpdateState] = useState<UpdateState>({
    isRefreshing: false,
    currentVersion: null,
    nextVersion: null,
  });

  const reloadTimeoutRef = useRef<number>();

  const handleMismatch = useCallback(
    (nextVersion: string, currentVersion: string | null) => {
      setUpdateState({
        isRefreshing: true,
        currentVersion,
        nextVersion,
      });

      reloadTimeoutRef.current = window.setTimeout(() => {
        window.location.reload();
      }, reloadDelayMs);
    },
    [reloadDelayMs],
  );

  useAppVersion(handleMismatch, {
    intervalMs,
    versionUrl,
  });

  useEffect(() => () => {
    if (reloadTimeoutRef.current) {
      window.clearTimeout(reloadTimeoutRef.current);
    }
  }, []);

  if (!updateState.isRefreshing) {
    return null;
  }

  return (
    <div
      className={cn(
        'pointer-events-none fixed bottom-5 left-1/2 z-[9999] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-lg bg-slate-900/95 px-4 py-2 text-center text-sm font-medium text-white shadow-xl backdrop-blur',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      A new version is available. Refreshing…
    </div>
  );
}
