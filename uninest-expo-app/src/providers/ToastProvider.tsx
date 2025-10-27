import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { radii, spacing, typography } from '@/theme/tokens';

export type ToastVariant = 'success' | 'error' | 'info';

export type ToastDescriptor = {
  id: string;
  title?: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastContextValue = {
  showToast: (toast: Omit<ToastDescriptor, 'id'> & { id?: string }) => string;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const VARIANT_STYLES: Record<ToastVariant, { borderColor: string; backgroundColor: string; textColor: string }> = {
  success: {
    borderColor: '#34d399',
    backgroundColor: '#ecfdf5',
    textColor: '#047857',
  },
  error: {
    borderColor: '#f87171',
    backgroundColor: '#fef2f2',
    textColor: '#b91c1c',
  },
  info: {
    borderColor: colors.borderMuted,
    backgroundColor: colors.surface,
    textColor: colors.textPrimary,
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastDescriptor[]>([]);
  const [viewportHeight, setViewportHeight] = useState<number>(0);
  const { bottom } = useSafeAreaInsets();

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback<ToastContextValue['showToast']>(({ id, duration = 4000, variant = 'info', ...rest }) => {
    const toastId = id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((current) => {
      const next: ToastDescriptor[] = [...current, { id: toastId, variant, duration, ...rest }];
      return next;
    });
    if (duration > 0) {
      setTimeout(() => {
        dismissToast(toastId);
      }, duration);
    }
    return toastId;
  }, [dismissToast]);

  const handleViewportLayout = useCallback((event: LayoutChangeEvent) => {
    setViewportHeight(event.nativeEvent.layout.height);
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ showToast, dismissToast }), [dismissToast, showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View
        pointerEvents="box-none"
        style={[styles.viewportWrapper, { paddingBottom: bottom + spacing.lg }]}
        onLayout={handleViewportLayout}
      >
        <View style={[styles.viewport, { maxHeight: viewportHeight || undefined }]}
          pointerEvents="box-none"
        >
          {toasts.map((toast) => {
            const variant = toast.variant ?? 'info';
            const palette = VARIANT_STYLES[variant];
            return (
              <View key={toast.id} style={[styles.toast, {
                borderColor: palette.borderColor,
                backgroundColor: palette.backgroundColor,
              }]}
              >
                {toast.title && (
                  <Text style={[styles.title, { color: palette.textColor }]}>{toast.title}</Text>
                )}
                <Text style={[styles.message, { color: palette.textColor }]}>{toast.message}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  viewportWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    pointerEvents: 'box-none',
  },
  viewport: {
    width: '100%',
    gap: spacing.sm,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    pointerEvents: 'box-none',
  },
  toast: {
    width: '100%',
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    shadowColor: '#00000020',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
    gap: spacing.xs,
  },
  title: {
    ...typography.headingSm,
  },
  message: {
    ...typography.body,
  },
});
