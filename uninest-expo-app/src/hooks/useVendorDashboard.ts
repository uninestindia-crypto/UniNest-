import { useQuery } from '@tanstack/react-query';

import {
  FALLBACK_VENDOR_DASHBOARD,
  VendorDashboardSnapshot,
  fetchVendorDashboardSnapshot,
} from '@/services/vendor/dashboard';

export function useVendorDashboard(vendorId: string | null) {
  const query = useQuery<VendorDashboardSnapshot>({
    queryKey: ['vendor-dashboard', vendorId],
    queryFn: async () => {
      if (!vendorId) {
        throw new Error('Missing vendor context');
      }
      return fetchVendorDashboardSnapshot(vendorId);
    },
    enabled: Boolean(vendorId),
    staleTime: 1000 * 60,
  });

  const snapshot = query.data ?? FALLBACK_VENDOR_DASHBOARD;
  const errorMessage = query.error instanceof Error ? query.error.message : query.error ? 'Failed to load dashboard' : null;

  return {
    snapshot,
    errorMessage,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
  } as const;
}
