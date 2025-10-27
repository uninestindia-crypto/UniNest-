'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type UseAppVersionOptions = {
  /**
   * Polling interval in milliseconds. Defaults to 60s.
   */
  intervalMs?: number;
  /**
   * Endpoint that returns `{ appVersion: string }`. Defaults to `/api/version`.
   */
  versionUrl?: string;
};

type VersionPayload = {
  appVersion: string;
};

const STORAGE_KEY = 'uninest-app-version';
const DEFAULT_INTERVAL_MS = 60_000;
const DEFAULT_VERSION_URL = '/api/version';

function readStoredVersion(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Unable to read stored app version', error);
    return null;
  }
}

function persistVersion(version: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, version);
  } catch (error) {
    console.warn('Unable to persist app version', error);
  }
}

async function fetchVersion(versionUrl: string): Promise<string | null> {
  try {
    const response = await fetch(`${versionUrl}?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'cache-control': 'no-cache',
      },
    });

    if (!response.ok) {
      console.warn('App version request failed', response.status, response.statusText);
      return null;
    }

    const payload = (await response.json()) as VersionPayload;

    if (!payload?.appVersion) {
      console.warn('App version payload missing `appVersion`');
      return null;
    }

    return String(payload.appVersion);
  } catch (error) {
    console.warn('Unable to fetch app version', error);
    return null;
  }
}

export function useAppVersion(
  onVersionMismatch: (nextVersion: string, currentVersion: string | null) => void,
  options: UseAppVersionOptions = {},
) {
  const { intervalMs = DEFAULT_INTERVAL_MS, versionUrl = DEFAULT_VERSION_URL } = options;

  const [currentVersion, setCurrentVersion] = useState<string | null>(() => readStoredVersion());
  const mismatchNotifiedRef = useRef(false);
  const mountedRef = useRef(false);

  const memoisedMismatchHandler = useMemo(() => onVersionMismatch, [onVersionMismatch]);

  useEffect(() => {
    mountedRef.current = true;

    const checkForUpdates = async () => {
      const remoteVersion = await fetchVersion(versionUrl);
      if (!remoteVersion) return;

      setCurrentVersion(prev => {
        if (prev !== remoteVersion && mountedRef.current) {
          persistVersion(remoteVersion);

          if (prev && prev !== remoteVersion && !mismatchNotifiedRef.current) {
            mismatchNotifiedRef.current = true;
            memoisedMismatchHandler(remoteVersion, prev);
          }
        }
        return remoteVersion;
      });
    };

    void checkForUpdates();
    const timer = window.setInterval(checkForUpdates, intervalMs);

    return () => {
      mountedRef.current = false;
      window.clearInterval(timer);
    };
  }, [intervalMs, memoisedMismatchHandler, versionUrl]);

  return currentVersion;
}
