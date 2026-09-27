import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { cardShadow, colors, radius, spacing } from '@/theme';

type Action = {
  key: string;
  title: string;
  subtitle: string;
  icon: 'message-circle' | 'bar-chart-2' | 'calendar' | 'send';
  href: '/chat' | '/test-analysis' | '/deadlines' | '/requests';
  tone: 'blue' | 'green' | 'amber';
};

const actions: Action[] = [
  {
    key: 'agent',
    title: 'Mentorship Agent',
    subtitle: '→ Talk through study plans, focus, or a tough chapter',
    icon: 'message-circle',
    href: '/chat',
    tone: 'blue',
  },
  {
    key: 'tests',
    title: 'Test Analysis',
    subtitle: '→ Scores, subject breakdown, and your trend',
    icon: 'bar-chart-2',
    href: '/test-analysis',
    tone: 'green',
  },
  {
    key: 'deadlines',
    title: 'Deadlines',
    subtitle: '→ What is due this week and what is coming',
    icon: 'calendar',
    href: '/deadlines',
    tone: 'amber',
  },
  {
    key: 'requests',
    title: 'Requests',
    subtitle: '→ Send a request straight to your counsellor',
    icon: 'send',
    href: '/requests',
    tone: 'blue',
  },
];

const toneStyles = {
  blue: { backgroundColor: colors.accentSoft, color: colors.accent },
  green: { backgroundColor: colors.successSoft, color: colors.successText },
  amber: { backgroundColor: colors.amberSoft, color: colors.amber },
};

export default function MentorshipScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScreenHeader title="Mentorship" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>How can we help?</Text>
        <Text style={styles.pageSubtitle}>
          Guidance, your test performance, deadlines, and requests to your counsellor — in one place.
        </Text>

        {actions.map((action) => (
          <Pressable
            key={action.key}
            accessibilityRole="button"
            accessibilityLabel={`${action.title}. ${action.subtitle.replace('→ ', '')}`}
            onPress={() =>
              router.push(
                action.href === '/chat'
                  ? { pathname: '/chat', params: { from: 'mentorship' } }
                  : action.href,
              )
            }
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <View style={[styles.iconWrap, { backgroundColor: toneStyles[action.tone].backgroundColor }]}>
              <Feather name={action.icon} size={20} color={toneStyles[action.tone].color} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{action.title}</Text>
              <Text style={styles.cardSubtitle}>{action.subtitle}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textMuted} />
          </Pressable>
        ))}

        <View style={styles.note}>
          <Feather name="shield" size={15} color={colors.textMuted} />
          <Text style={styles.noteText}>
            Requests are sent to your counsellor and appear on their dashboard straight away.
          </Text>
        </View>
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
    paddingTop: spacing.xl,
  },
  pageTitle: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: colors.text,
  },
  pageSubtitle: {
    marginTop: spacing.sm,
    maxWidth: 360,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textBody,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...cardShadow,
  },
  iconWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  cardSubtitle: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textBody,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xs,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
  },
  pressed: {
    opacity: 0.7,
  },
});
