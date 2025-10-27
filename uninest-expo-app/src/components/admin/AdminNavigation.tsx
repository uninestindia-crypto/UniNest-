import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  CreditCard,
  Trophy,
  Briefcase,
  Lightbulb,
  LifeBuoy,
  Megaphone,
  ScrollText,
  Settings,
} from 'lucide-react-native';

import { colors } from '@/theme/colors';

const NAV_ITEMS = [
  { path: '/(admin)/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/(admin)/users', label: 'Users', icon: Users },
  { path: '/(admin)/listings', label: 'Listings', icon: ShoppingCart },
  { path: '/(admin)/payments', label: 'Payments', icon: CreditCard },
  { path: '/(admin)/competitions', label: 'Competitions', icon: Trophy },
  { path: '/(admin)/internships', label: 'Internships', icon: Briefcase },
  { path: '/(admin)/suggestions', label: 'Suggestions', icon: Lightbulb },
  { path: '/(admin)/tickets', label: 'Support Tickets', icon: LifeBuoy },
  { path: '/(admin)/marketing', label: 'Marketing', icon: Megaphone },
  { path: '/(admin)/logs', label: 'Audit Logs', icon: ScrollText },
  { path: '/(admin)/settings', label: 'Settings', icon: Settings },
] as const;

type NavItem = (typeof NAV_ITEMS)[number];

type AdminNavigationProps = {
  onNavigate?: (path: string) => void;
  variant?: 'vertical' | 'horizontal';
};

export function AdminNavigation({ onNavigate, variant = 'vertical' }: AdminNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();

  const activePath = useMemo(() => {
    if (!pathname) {
      return '/(admin)/dashboard';
    }

    const match = NAV_ITEMS.find((item) => pathname.startsWith(item.path));
    return match?.path ?? '/(admin)/dashboard';
  }, [pathname]);

  const handlePress = (item: NavItem) => {
    router.replace(item.path);
    onNavigate?.(item.path);
  };

  const content = NAV_ITEMS.map((item) => {
    const isActive = item.path === activePath;
    const Icon = item.icon;
    return (
      <Pressable
        key={item.path}
        onPress={() => handlePress(item)}
        style={[
          styles.item,
          variant === 'horizontal' ? styles.itemHorizontal : styles.itemVertical,
          isActive ? styles.itemActive : styles.itemInactive,
        ]}
      >
        <Icon size={18} color={isActive ? colors.primary : colors.textSecondary} />
        <Text
          style={[
            styles.label,
            variant === 'horizontal' ? styles.labelHorizontal : styles.labelVertical,
            isActive ? styles.labelActive : styles.labelInactive,
          ]}
        >
          {item.label}
        </Text>
      </Pressable>
    );
  });

  if (variant === 'horizontal') {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalContainer}
      >
        {content}
      </ScrollView>
    );
  }

  return <View style={styles.verticalContainer}>{content}</View>;
}

const styles = StyleSheet.create({
  verticalContainer: {
    gap: 8,
  },
  horizontalContainer: {
    paddingHorizontal: 4,
    gap: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
  },
  itemVertical: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  itemHorizontal: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  itemActive: {
    backgroundColor: '#e0ecff',
  },
  itemInactive: {
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  labelVertical: {
    textAlign: 'left',
  },
  labelHorizontal: {
    textAlign: 'center',
  },
  labelActive: {
    color: colors.primary,
  },
  labelInactive: {
    color: colors.textSecondary,
  },
});
