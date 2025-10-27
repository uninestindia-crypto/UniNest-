import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { radii, spacing, typography } from '@/theme/tokens';

type ModalButton = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
};

type ModalState = {
  id: string;
  title?: string;
  body?: string;
  content?: React.ReactNode;
  primaryButton?: ModalButton;
  secondaryButton?: ModalButton;
};

type ModalContextValue = {
  showModal: (modal: Omit<ModalState, 'id'> & { id?: string }) => string;
  dismissModal: (id?: string) => void;
};

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [activeModal, setActiveModal] = useState<ModalState | null>(null);

  const dismissModal = useCallback<ModalContextValue['dismissModal']>((id) => {
    setActiveModal((current) => {
      if (!current) {
        return null;
      }
      if (id && current.id !== id) {
        return current;
      }
      return null;
    });
  }, []);

  const showModal = useCallback<ModalContextValue['showModal']>((modal) => {
    const modalId = modal.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setActiveModal({ ...modal, id: modalId });
    return modalId;
  }, []);

  const value = useMemo(() => ({ showModal, dismissModal }), [dismissModal, showModal]);

  const renderButton = useCallback((button: ModalButton, role: 'primary' | 'secondary') => {
    const tone = button.variant ?? role;
    const isPrimary = tone === 'primary';
    return (
      <Pressable
        key={tone}
        onPress={() => {
          button.onPress?.();
          dismissModal();
        }}
        style={[styles.button, isPrimary ? styles.buttonPrimary : styles.buttonSecondary]}
      >
        <Text style={[styles.buttonLabel, isPrimary ? styles.buttonPrimaryLabel : styles.buttonSecondaryLabel]}>
          {button.label}
        </Text>
      </Pressable>
    );
  }, [dismissModal]);

  return (
    <ModalContext.Provider value={value}>
      {children}
      {activeModal && (
        <View style={styles.overlay} pointerEvents="auto">
          <Pressable style={StyleSheet.absoluteFill} onPress={() => dismissModal(activeModal.id)} />
          <View style={styles.sheet}>
            {activeModal.title && <Text style={styles.title}>{activeModal.title}</Text>}
            {activeModal.body && <Text style={styles.body}>{activeModal.body}</Text>}
            {activeModal.content}
            <View style={styles.buttonRow}>
              {activeModal.secondaryButton && renderButton(activeModal.secondaryButton, 'secondary')}
              {activeModal.primaryButton && renderButton(activeModal.primaryButton, 'primary')}
            </View>
          </View>
        </View>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0f172a55',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  sheet: {
    width: '100%',
    maxWidth: 480,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    padding: spacing['2xl'],
    gap: spacing.md,
    shadowColor: '#00000033',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
  },
  title: {
    ...typography.headingMd,
    color: colors.textPrimary,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  button: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderColor: colors.borderMuted,
  },
  buttonLabel: {
    ...typography.body,
    fontWeight: '600',
  },
  buttonPrimaryLabel: {
    color: '#ffffff',
  },
  buttonSecondaryLabel: {
    color: colors.textPrimary,
  },
});
