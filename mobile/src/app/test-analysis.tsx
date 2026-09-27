import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { mockTests } from '@/lib/mockAcademic';
import { colors, radius, spacing } from '@/theme';

const [latest, ...earlier] = mockTests;

const subjectColors = [colors.accent, colors.successText, colors.amber];

export default function TestAnalysisScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScreenHeader title="Test Analysis" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.eyebrow}>LATEST RESULT</Text>
              <Text style={styles.testName}>{latest.name}</Text>
              <Text style={styles.testDate}>{latest.date}</Text>
            </View>
            <View style={styles.totalBadge}>
              <Text style={styles.totalValue}>{latest.total}</Text>
              <Text style={styles.totalMax}>/ {latest.max}</Text>
            </View>
          </View>
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Percentile</Text>
              <Text style={styles.statValue}>{latest.percentile}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Trend</Text>
              <Text style={[styles.statValue, styles.statUp]}>
                +{latest.total - earlier[0].total} vs previous
              </Text>
            </View>
          </View>
          <Text style={styles.note}>{latest.note}</Text>
        </View>

        <Text style={styles.sectionLabel}>SUBJECT BREAKDOWN</Text>
        <View style={styles.card}>
          {latest.scores.map((score, index) => (
            <View key={score.subject} style={styles.subjectRow}>
              <View style={styles.subjectHead}>
                <Text style={styles.subjectName}>{score.subject}</Text>
                <Text style={styles.subjectScore}>
                  {score.score}
                  <Text style={styles.subjectMax}>/{score.max}</Text>
                </Text>
              </View>
              <View style={styles.track}>
                <View
                  style={[
                    styles.trackFill,
                    { width: `${(score.score / score.max) * 100}%`, backgroundColor: subjectColors[index] },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>HISTORY</Text>
        {mockTests.map((test, index) => (
          <View key={test.id} style={styles.historyCard}>
            <View style={styles.historyHead}>
              <View style={styles.historyTitleWrap}>
                <Text style={styles.historyName}>{test.name}</Text>
                <Text style={styles.historyDate}>{test.date}</Text>
              </View>
              <View style={styles.historyScores}>
                {test.scores.map((score) => (
                  <Text key={score.subject} style={styles.historyChip}>
                    {score.subject.slice(0, 2)} {score.score}
                  </Text>
                ))}
              </View>
              <Text style={[styles.historyTotal, index === 0 && styles.historyTotalTop]}>
                {test.total}
              </Text>
            </View>
            <View style={styles.track}>
              <View
                style={[
                  styles.trackFill,
                  { width: `${(test.total / test.max) * 100}%` },
                  index === 0 && styles.trackFillTop,
                ]}
              />
            </View>
            <Text style={styles.note}>{test.note}</Text>
          </View>
        ))}

        <View style={styles.tip}>
          <Feather name="trending-up" size={15} color={colors.successText} />
          <Text style={styles.tipText}>
            Your total has risen across the last three mocks. Keep the Chemistry routine and put the
            extra revision hours into Physics section B.
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
    paddingTop: spacing.lg,
  },
  summaryCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.accentDark,
  },
  testName: {
    marginTop: spacing.xs,
    fontSize: 19,
    fontWeight: '700',
    color: colors.text,
  },
  testDate: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textMuted,
  },
  totalBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.accentDark,
    fontVariant: ['tabular-nums'],
  },
  totalMax: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accentDark,
    opacity: 0.7,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  statValue: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  statUp: {
    color: colors.successText,
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
    padding: spacing.lg,
    gap: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  subjectRow: {
    gap: spacing.xs,
  },
  subjectHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subjectName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  subjectScore: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  subjectMax: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
  },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  trackFillTop: {
    backgroundColor: colors.successText,
  },
  historyCard: {
    marginBottom: spacing.sm,
    padding: spacing.lg,
    gap: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  historyHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  historyTitleWrap: {
    flex: 1,
  },
  historyName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  historyDate: {
    marginTop: 1,
    fontSize: 12,
    color: colors.textMuted,
  },
  historyScores: {
    flexDirection: 'row',
    gap: 4,
  },
  historyChip: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: radius.xs,
    backgroundColor: colors.bg,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textBody,
    fontVariant: ['tabular-nums'],
  },
  historyTotal: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  historyTotalTop: {
    color: colors.successText,
  },
  note: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textBody,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.successSoft,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: colors.successText,
  },
});
