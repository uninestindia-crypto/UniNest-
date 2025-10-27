import { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/src/state/stores/authStore';
import { useVendorDashboardStore } from '@/src/state/stores/vendorDashboardStore';
import { VendorDashboardHeader } from '@/src/components/vendor/dashboard/VendorDashboardHeader';

export default function VendorDashboardScreen() {
  const router = useRouter();
  const { user, vendorCategories, isAuthenticated, loading, fetchProfile } = useAuthStore();
  const { initializeDashboard } = useVendorDashboardStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else {
        initializeDashboard();
      }
    }
  }, [isAuthenticated, loading, router, initializeDashboard]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 24, paddingVertical: 32, gap: 24 }}>
        <VendorDashboardHeader
          userName={user?.user_metadata?.full_name ?? 'Vendor'}
          categories={vendorCategories}
        />
      </View>
    </ScrollView>
  );
}
