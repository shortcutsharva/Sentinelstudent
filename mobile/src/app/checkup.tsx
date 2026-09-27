import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MicButton } from '@/components/MicButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { submitCheckIn } from '@/lib/api';
import type { CheckIn, Mood } from '@/lib/types';
import { useVoiceRecorder } from '@/lib/useVoiceRecorder';
import { colors, radius, spacing } from '@/theme';

const MOODS: { value: Mood; label: string; descriptor: string }[] = [
  { value: 5, label: 'Great', descriptor: 'Energized' },
  { value: 4, label: 'Good', descriptor: 'On track' },
  { value: 3, label: 'Okay', descriptor: 'Even' },
  { value: 2, label: 'Hard', descriptor: 'Stretched' },
  { value: 1, label: 'A lot', descriptor: 'Overloaded' },
];

const INFLUENCES = ['Coursework', 'Deadlines', 'Focus', 'Energy', 'Group work'];

export default function CheckupScreen() {
  const insets = useSafeAreaInsets();
  const [mood, setMood] = useState<Mood | null>(null);
  const [influences, setInfluences] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [lowCount, setLowCount] = useState(0);
  const [suggestChat, setSuggestChat] = useState(false);

  const voice = useVoiceRecorder((text) => {
    setSaved(false);
    setSaveError(false);
    setNote((previous) => (previous.trim() ? `${previous.trim()} ${text}` : text));
  });

  const toggleInfluence = (label: string) => {
    setSaved(false);
    setSaveError(false);
    setInfluences((current) =>
      current.includes(label) ? current.filter((item) => item !== label) : [...current, label],
    );
  };

  const handleVoicePress = () => {
    if (voice.status === 'recording') {
      voice.stop();
    } else {
      void voice.start();
    }
  };

  const handleDone = async () => {
    if (mood === null || submitting) return;
    setSubmitting(true);
    setSaveError(false);
    const checkIn: CheckIn = {
      mood,
      influences,
      note: note.trim() || undefined,
      timestamp: new Date().toISOString(),
    };
    const result = await submitCheckIn(checkIn);
    setSubmitting(false);
    if (!result) {
      setSaved(false);
      setSaveError(true);
      return;
    }
    const nextLowCount = lowCount + (mood <= 2 ? 1 : 0);
    setLowCount(nextLowCount);
    setSuggestChat(result.suggestChat || nextLowCount >= 2);
    setSaved(true);
  };

  const openChat = () => {
    const repeated = suggestChat || lowCount >= 2 ? '1' : '0';
    router.push({ pathname: '/chat', params: { repeated } });
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Daily checkup" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.intro}>
          This check-in combines academic reflection with a wellbeing check. Saving sends your selected
          mood, study factors, optional note, and submission time to the check-in service. Mood is required;
          a note is optional.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Academic reflection</Text>
          <Text style={styles.question}>What’s been shaping your study day?</Text>
          <Text style={styles.helper}>Choose any that apply.</Text>
          <View style={styles.chipRow}>
            {INFLUENCES.map((label) => {
              const selected = influences.includes(label);
              return (
                <Pressable
                  key={label}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => toggleInfluence(label)}
                  style={({ pressed }) => [
                    styles.chip,
                    selected && styles.chipSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Wellbeing check-in</Text>
          <Text style={styles.question}>How are you feeling today?</Text>
          <Text style={styles.helper}>Choose the one that feels closest. Select one to save.</Text>
          <View style={styles.moodList}>
            {MOODS.map((item) => {
              const selected = mood === item.value;
              return (
                <Pressable
                  key={item.value}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.label}, ${item.descriptor}`}
                  accessibilityState={{ selected }}
                  onPress={() => {
                    setSaved(false);
                    setSaveError(false);
                    setMood(item.value);
                  }}
                  style={({ pressed }) => [
                    styles.moodOption,
                    selected && styles.moodOptionSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.moodLabel, selected && styles.moodLabelSelected]}>{item.label}</Text>
                  <Text style={[styles.moodDescriptor, selected && styles.moodLabelSelected]}>
                    {item.descriptor}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={[styles.question, styles.noteQuestion]}>Anything else on your mind?</Text>
          <Text style={styles.helper}>Add an optional note if it would help to put it into words.</Text>
          <View style={styles.noteRow}>
            {voice.status === 'recording' ? (
              <View style={[styles.noteInput, styles.notePill]}>
                <Text style={styles.pillText}>Listening… {voice.durationSec}s</Text>
              </View>
            ) : voice.status === 'transcribing' ? (
              <View style={[styles.noteInput, styles.notePill]}>
                <Text style={styles.pillText}>Transcribing…</Text>
              </View>
            ) : (
              <TextInput
                accessibilityLabel="Additional thoughts"
                style={styles.noteInput}
                placeholder="Write a few thoughts…"
                placeholderTextColor={colors.textMuted}
                value={note}
                onChangeText={(text) => {
                  setSaved(false);
                  setSaveError(false);
                  voice.clearError();
                  setNote(text);
                }}
                multiline
              />
            )}
            <MicButton status={voice.status} size={44} onPress={handleVoicePress} />
          </View>
          {voice.error ? <Text style={styles.errorText}>{voice.error}</Text> : null}
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={mood === null || submitting}
          onPress={handleDone}
          style={({ pressed }) => [
            styles.doneButton,
            (mood === null || submitting) && styles.doneButtonDisabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.doneButtonText}>{submitting ? 'Saving checkup…' : 'Save checkup'}</Text>
        </Pressable>

        {saveError ? (
          <Text accessibilityRole="alert" style={styles.errorMessage}>
            Couldn’t save your checkup. Check your connection and try again.
          </Text>
        ) : null}
        {saved ? (
          <View accessibilityRole="alert" style={styles.savedRow}>
            <Feather name="check-circle" size={17} color={colors.successText} />
            <Text style={styles.savedText}>Your checkup is saved.</Text>
          </View>
        ) : null}

        {suggestChat ? (
          <View style={styles.supportPrompt}>
            <Text style={styles.supportTitle}>It sounds like things have felt full lately.</Text>
            <Text style={styles.supportBody}>Would it help to talk through what’s on your mind?</Text>
            <Pressable
              accessibilityRole="button"
              onPress={openChat}
              style={({ pressed }) => [styles.supportButton, pressed && styles.pressed]}
            >
              <Text style={styles.supportButtonText}>Talk with the academic assistant</Text>
            </Pressable>
          </View>
        ) : null}
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
  intro: {
    marginBottom: spacing.xl,
    fontSize: 16,
    lineHeight: 23,
    color: colors.textBody,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
    fontSize: 13,
    fontWeight: '700',
    color: colors.accentDark,
  },
  question: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '700',
    color: colors.text,
  },
  noteQuestion: {
    marginTop: spacing.xl,
  },
  helper: {
    marginTop: spacing.xs,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textBody,
  },
  moodList: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  moodOption: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  moodOptionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  moodLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  moodDescriptor: {
    fontSize: 14,
    color: colors.textBody,
  },
  moodLabelSelected: {
    color: colors.accentDark,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  chip: {
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textBody,
  },
  chipTextSelected: {
    color: colors.accentDark,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  noteInput: {
    flex: 1,
    minHeight: 104,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
    textAlignVertical: 'top',
  },
  notePill: {
    justifyContent: 'center',
    minHeight: 56,
  },
  pillText: {
    color: colors.textBody,
    fontSize: 15,
  },
  doneButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  doneButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  savedText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.successText,
  },
  errorText: {
    marginTop: spacing.sm,
    fontSize: 13,
    lineHeight: 19,
    color: colors.red,
  },
  errorMessage: {
    marginTop: spacing.md,
    fontSize: 14,
    lineHeight: 20,
    color: colors.red,
  },
  supportPrompt: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
  },
  supportTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: colors.text,
  },
  supportBody: {
    marginTop: spacing.xs,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textBody,
  },
  supportButton: {
    minHeight: 44,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accentDark,
  },
  pressed: {
    opacity: 0.7,
  },
});
