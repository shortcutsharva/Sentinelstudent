import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { deadlines } from '@/lib/mockAcademic';
import type { Deadline } from '@/lib/mockAcademic';
import { colors, radius, spacing } from '@/theme';

const groups: { key: Deadline['status']; label: string }[] = [
  { key: 'due-soon', label: 'DUE SOON' },
  { key: 'upcoming', label: 'UPCOMING' },
];

const statusStyles = {
  'due-soon': { backgroundColor: colors.amberSoft, color: colors.amber },
  upcoming: { backgroundColor: colors.accentSoft, color: colors.accentDark },
};

export default function DeadlinesScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScreenHeader title="Deadlines" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageSubtitle}>
          Everything due in your current revision cycle, nearest first.
        </Text>

        {groups.map((group) => (
          <View key={group.key}>
            <Text style={styles.sectionLabel}>{group.label}</Text>
            {deadlines
              .filter((item) => item.status === group.key)
              .map((item) => (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardHead}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <View style={[styles.statusChip, { backgroundColor: statusStyles[item.status].backgroundColor }]}>
                      <Text style={[styles.statusText, { color: statusStyles[item.status].color }]}>
                        {item.dueIn}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.metaRow}>
                    <View style={styles.subjectChip}>
                      <Text style={styles.subjectText}>{item.subject}</Text>
                    </View>
                    <Feather name="clock" size={13} color={colors.textMuted} />
                    <Text style={styles.dueLabel}>{item.dueLabel}</Text>
                  </View>
                  <Text style={styles.detail}>{item.detail}</Text>
                </View>
              ))}
          </View>
        ))}

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/requests')}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        >
          <Feather name="send" size={16} color={colors.white} />
          <Text style={styles.primaryButtonText}>Request an extension</Text>
        </Pressable>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  pageSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textBody,
  },
  sectionLabel: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.textMuted,
  },
  card: {
    marginBottom: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: colors.text,
  },
  statusChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  subjectChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.xs,
    backgroundColor: colors.bg,
  },
  subjectText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textBody,
  },
  dueLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  detail: {
    marginTop: spacing.sm,
    fontSize: 13,
    lineHeight: 19,
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
  pressed: {
    opacity: 0.7,
  },
});
