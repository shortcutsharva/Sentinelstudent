import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { getNotification } from '@/lib/notifications';
import type { NotificationTone } from '@/lib/notifications';
import { colors, radius, spacing } from '@/theme';

const toneStyles: Record<NotificationTone, { backgroundColor: string; color: string }> = {
  blue: { backgroundColor: colors.accentSoft, color: colors.accentDark },
  green: { backgroundColor: colors.successSoft, color: colors.successText },
  amber: { backgroundColor: colors.amberSoft, color: colors.amber },
};

export default function NotificationScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const notification = getNotification(id);
  const [checkupVisible, setCheckupVisible] = useState(notification?.id === 'daily-checkup');

  if (!notification) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Notification" onBack={() => router.back()} />
        <View style={styles.empty}>
          <Feather name="bell-off" size={26} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>This notification is no longer available</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={({ pressed }) => [styles.emptyButton, pressed && styles.pressed]}
          >
            <Text style={styles.emptyButtonText}>Go back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const tone = toneStyles[notification.tone];

  return (
    <View style={styles.container}>
      <ScreenHeader title="Notification" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.iconWrap, { backgroundColor: tone.backgroundColor }]}>
          <Feather name={notification.icon} size={24} color={tone.color} />
        </View>

        <Text style={styles.category}>{notification.category}</Text>
        <Text style={styles.title}>{notification.title}</Text>
        <View style={styles.timeRow}>
          <Feather name="clock" size={13} color={colors.textMuted} />
          <Text style={styles.time}>{notification.time}</Text>
        </View>

        <View style={styles.card}>
          {notification.body.map((paragraph) => (
            <Text key={paragraph} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
        </View>

        {notification.cta ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(notification.cta!.href)}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryButtonText}>{notification.cta.label}</Text>
            <Feather name="arrow-right" size={17} color={colors.white} />
          </Pressable>
        ) : null}
      </ScrollView>

      <Modal
        animationType="fade"
        transparent
        visible={checkupVisible}
        onRequestClose={() => setCheckupVisible(false)}
        statusBarTranslucent
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close daily checkup popup"
            onPress={() => setCheckupVisible(false)}
            style={styles.backdrop}
          />
          <View
            accessibilityViewIsModal
            accessibilityLabel="Daily checkup popup"
            style={[styles.popup, { marginBottom: Math.max(insets.bottom, spacing.lg) }]}
          >
            <View style={styles.popupTopRow}>
              <View style={styles.popupIcon}>
                <Feather name="heart" size={18} color={colors.accentDark} />
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close daily checkup popup"
                hitSlop={10}
                onPress={() => setCheckupVisible(false)}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
              >
                <Feather name="x" size={20} color={colors.textMuted} />
              </Pressable>
            </View>
            <Text style={styles.popupEyebrow}>DAILY CHECKUP</Text>
            <Text style={styles.popupTitle}>How are you doing today?</Text>
            <Text style={styles.popupBody}>
              Reflect on study factors and your wellbeing. Choose a mood and add an optional note.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setCheckupVisible(false);
                router.push('/checkup');
              }}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.primaryButtonText}>Start daily checkup</Text>
              <Feather name="arrow-right" size={17} color={colors.white} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setCheckupVisible(false)}
              style={({ pressed }) => [styles.laterButton, pressed && styles.pressed]}
            >
              <Text style={styles.laterButtonText}>Maybe later</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  iconWrap: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  category: {
    marginTop: spacing.lg,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.accentDark,
  },
  title: {
    marginTop: spacing.sm,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: colors.text,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  time: {
    fontSize: 13,
    color: colors.textMuted,
  },
  card: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    gap: spacing.md,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.textBody,
  },
  primaryButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: 15,
    color: colors.textBody,
    textAlign: 'center',
  },
  emptyButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.accentDark,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  popup: {
    padding: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  popupTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  popupIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.accentSoft,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.bg,
  },
  popupEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.accentDark,
  },
  popupTitle: {
    marginTop: spacing.sm,
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: colors.text,
  },
  popupBody: {
    marginTop: spacing.sm,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textBody,
  },
  laterButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  laterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textBody,
  },
  pressed: {
    opacity: 0.7,
  },
});
