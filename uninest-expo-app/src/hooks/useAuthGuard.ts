import { useEffect } from 'react';
import { useRouter } from 'expo-router';

import { useAuthStore } from '@/state/stores/authStore';

const DEFAULT_REDIRECT = '/(auth)/login';

type UseAuthGuardOptions = {
  redirectTo?: string;
  requireVendor?: boolean;
  requireAdmin?: boolean;
};

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    loading,
    hasInitialized,
    vendorCategories,
    vendorStatus,
  } = useAuthStore((state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    hasInitialized: state.hasInitialized,
    vendorCategories: state.vendorCategories,
    vendorStatus: state.vendorStatus,
  }));

  const { redirectTo = DEFAULT_REDIRECT, requireVendor = false, requireAdmin = false } = options;

  useEffect(() => {
    if (!hasInitialized || loading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace(redirectTo);
      return;
    }

    const role = user?.user_metadata?.role;

    if (requireVendor && role !== 'vendor') {
      router.replace(redirectTo);
      return;
    }

    if (requireAdmin && role !== 'admin') {
      router.replace(redirectTo);
    }
  }, [hasInitialized, loading, isAuthenticated, requireAdmin, requireVendor, redirectTo, router, user]);

  const isChecking = !hasInitialized || loading;

  return {
    user,
    isAuthenticated,
    isChecking,
    vendorCategories,
    vendorStatus,
  } as const;
}
