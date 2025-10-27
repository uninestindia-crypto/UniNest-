import { ReactNode, useMemo } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { LogOut } from 'lucide-react-native';

import type { User } from '@supabase/supabase-js';

import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { colors } from '@/theme/colors';

export type AdminShellProps = {
  children: ReactNode;
  user: User | null;
  onSignOut: () => void;
};

export function AdminShell({ children, user, onSignOut }: AdminShellProps) {
  const { width } = useWindowDimensions();
  const isWide = width >= 960;

  const userInitials = useMemo(() => {
    if (!user?.email) {
      return 'A';
    }
    return user.email.slice(0, 2).toUpperCase();
  }, [user?.email]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        {isWide ? (
          <View style={styles.sidebar}>
            <View style={styles.logoBlock}>
              <Text style={styles.logoMark}>UniNest</Text>
              <Text style={styles.logoSub}>Admin</Text>
            </View>
            <AdminNavigation />
            <View style={styles.profileCard}>
              <View style={styles.avatar}>{/* Placeholder avatar */}
                <Text style={styles.avatarLabel}>{userInitials}</Text>
              </View>
              <View style={styles.profileCopy}>
                <Text style={styles.profileName}>{user?.user_metadata?.full_name ?? 'Admin User'}</Text>
                <Text style={styles.profileEmail}>{user?.email ?? 'admin@uninest.com'}</Text>
              </View>
            </View>
            <Pressable onPress={onSignOut} style={styles.signOutButton}>
              <LogOut size={18} color={colors.textSecondary} />
              <Text style={styles.signOutLabel}>Sign out</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.topNavWrapper}>
            <View style={styles.topNavHeader}>
              <View>
                <Text style={styles.logoMark}>UniNest</Text>
                <Text style={styles.logoSub}>Admin</Text>
              </View>
              <Pressable onPress={onSignOut} style={styles.signOutIcon}>
                <LogOut size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
            <AdminNavigation variant="horizontal" />
          </View>
        )}

        <View style={styles.contentWrapper}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background,
  },
  sidebar: {
    width: 280,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.borderMuted,
    paddingHorizontal: 20,
    paddingVertical: 28,
    gap: 24,
    backgroundColor: colors.surface,
  },
  logoBlock: {
    gap: 2,
  },
  logoMark: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  logoSub: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  profileCard: {
    marginTop: 'auto',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    backgroundColor: '#f8fafc',
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  profileCopy: {
    flex: 1,
  },
  profileName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  profileEmail: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  signOutLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  topNavWrapper: {
    position: 'absolute',
    zIndex: 10,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderMuted,
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 12,
    gap: 12,
  },
  topNavHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  signOutIcon: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: '#f1f5f9',
  },
  contentWrapper: {
    flex: 1,
    paddingLeft: 0,
  },
  scroll: {
    flex: 1,
    paddingTop: 80,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 24,
  },
});
