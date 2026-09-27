import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { earlierNotifications, notifications, todayNotifications } from '@/lib/notifications';
import type { AppNotification } from '@/lib/notifications';
import { colors, radius, spacing } from '@/theme';

const toneStyles = {
  blue: { backgroundColor: colors.accentSoft, color: colors.accentDark },
  green: { backgroundColor: colors.successSoft, color: colors.successText },
  amber: { backgroundColor: colors.amberSoft, color: colors.amber },
};

export default function BroadcastScreen() {
  const insets = useSafeAreaInsets();

  const openNotification = (notification: AppNotification) => {
    router.push({ pathname: '/notification', params: { id: notification.id } });
  };

  const renderRow = (notification: AppNotification) => (
    <Pressable
      key={notification.id}
      accessibilityRole="button"
      accessibilityLabel={`${notification.title}. ${notification.message}. ${notification.time}`}
      onPress={() => openNotification(notification)}
      style={({ pressed }) => [styles.notification, pressed && styles.pressed]}
    >
      <View style={[styles.iconWrap, { backgroundColor: toneStyles[notification.tone].backgroundColor }]}>
        <Feather name={notification.icon} size={19} color={toneStyles[notification.tone].color} />
      </View>
      <View style={styles.notificationCopy}>
        <View style={styles.notificationHeading}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Feather name="chevron-right" size={16} color={colors.textMuted} />
        </View>
        <Text style={styles.notificationMessage}>{notification.message}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.notificationTime}>{notification.time}</Text>
          <Text style={styles.viewText}>View details</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Notifications" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headingRow}>
          <View>
            <Text style={styles.pageTitle}>Your updates</Text>
            <Text style={styles.pageSubtitle}>A little support for your study day.</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{notifications.length}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>TODAY</Text>
        {todayNotifications.map(renderRow)}

        <Text style={[styles.sectionLabel, styles.earlierLabel]}>EARLIER</Text>
        {earlierNotifications.map(renderRow)}
      </ScrollView>
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
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  pageTitle: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: colors.text,
  },
  pageSubtitle: {
    marginTop: spacing.xs,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textBody,
  },
  countBadge: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
  },
  countText: {
    color: colors.accentDark,
    fontSize: 14,
    fontWeight: '700',
  },
  sectionLabel: {
    marginBottom: spacing.sm,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.textMuted,
  },
  earlierLabel: {
    marginTop: spacing.xl,
  },
  notification: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  notificationCopy: {
    flex: 1,
    minWidth: 0,
  },
  notificationHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: colors.text,
  },
  notificationMessage: {
    marginTop: spacing.xs,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textBody,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  notificationTime: {
    fontSize: 11,
    color: colors.textMuted,
  },
  viewText: {
    color: colors.accentDark,
    fontSize: 12,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
