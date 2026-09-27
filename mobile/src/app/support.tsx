import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/ScreenHeader';
import { cardShadow, colors, radius, spacing } from '@/theme';

const STUDY_TIPS = [
  'Split large assignments into 30-minute blocks',
  'Start each session with one clearly defined task',
  'Review and adjust your plan at the end of the day',
];

const PLANNING_TIPS = [
  'List upcoming deadlines for the next two weeks',
  'Block fixed study times before the week starts',
  'Keep one buffer block per day for overflow',
];

export default function SupportScreen() {
  const insets = useSafeAreaInsets();

  const openChat = () => router.push('/chat');

  return (
    <View style={styles.container}>
      <ScreenHeader title="Academic Support" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}>
        <Pressable
          accessibilityRole="button"
          onPress={openChat}
          style={({ pressed }) => [styles.card, styles.cardLink, pressed && styles.pressed]}
        >
          <View style={[styles.iconWrap, styles.iconWrapPrimary]}>
            <Feather name="message-circle" size={20} color={colors.accent} />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Chat with Academic Assistant</Text>
            <Text style={styles.cardSubtitle}>→ Describe issues or get help</Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.textMuted} />
        </Pressable>

        <View style={styles.card}>
          <View style={[styles.iconWrap, styles.iconWrapSuccess]}>
            <Feather name="book-open" size={20} color={colors.successText} />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Study Strategies</Text>
            <Text style={styles.cardSubtitle}>→ Tips for managing workload</Text>
            {STUDY_TIPS.map((tip) => (
              <Text key={tip} style={styles.tip}>• {tip}</Text>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={[styles.iconWrap, styles.iconWrapAmber]}>
            <Feather name="calendar" size={20} color={colors.amber} />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Planning Tools</Text>
            <Text style={styles.cardSubtitle}>→ Simple task structuring</Text>
            {PLANNING_TIPS.map((tip) => (
              <Text key={tip} style={styles.tip}>• {tip}</Text>
            ))}
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={openChat}
          style={({ pressed }) => [styles.startChatButton, pressed && styles.pressed]}
        >
          <Feather name="message-circle" size={18} color={colors.white} />
          <Text style={styles.startChatButtonText}>Start Chat</Text>
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
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: spacing.md,
    ...cardShadow,
  },
  cardLink: {
    alignItems: 'center',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapPrimary: {
    backgroundColor: colors.accentSoft,
  },
  iconWrapSuccess: {
    backgroundColor: colors.successSoft,
  },
  iconWrapAmber: {
    backgroundColor: colors.amberSoft,
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
    color: colors.textBody,
  },
  tip: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: colors.textBody,
    lineHeight: 19,
  },
  startChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    paddingVertical: spacing.md + 2,
  },
  startChatButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
