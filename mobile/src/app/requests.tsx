import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MicButton } from '@/components/MicButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { sendRequest } from '@/lib/api';
import type { SentRequest } from '@/lib/api';
import { useVoiceRecorder } from '@/lib/useVoiceRecorder';
import { colors, radius, spacing } from '@/theme';

const categories: { label: string; icon: 'clock' | 'calendar' | 'phone' | 'heart' }[] = [
  { label: 'Deadline extension', icon: 'clock' },
  { label: 'Test reschedule', icon: 'calendar' },
  { label: 'Mentor call', icon: 'phone' },
  { label: 'Wellbeing support', icon: 'heart' },
];

function formatTime(iso: string): string {
  const date = new Date(iso);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes} ${suffix}`;
}

export default function RequestsScreen() {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState(categories[0].label);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const [justSent, setJustSent] = useState(false);
  const [sent, setSent] = useState<SentRequest[]>([]);

  const voice = useVoiceRecorder((text) => {
    setError(false);
    setJustSent(false);
    setMessage((previous) => (previous.trim() ? `${previous.trim()} ${text}` : text));
  });

  const handleVoicePress = () => {
    if (voice.status === 'recording') {
      voice.stop();
    } else {
      void voice.start();
    }
  };

  const canSend = message.trim().length > 0 && !sending;

  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);
    setError(false);
    setJustSent(false);
    const record = await sendRequest({ type: category, message: message.trim() });
    setSending(false);
    if (!record) {
      setError(true);
      return;
    }
    setSent((previous) => [record, ...previous]);
    setMessage('');
    setJustSent(true);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScreenHeader title="Requests" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageSubtitle}>
          Send a request to your counsellor. It appears on their dashboard right away and you will
          hear back through notifications.
        </Text>

        <Text style={styles.sectionLabel}>WHAT DO YOU NEED?</Text>
        <View style={styles.chipRow}>
          {categories.map((item) => {
            const selected = category === item.label;
            return (
              <Pressable
                key={item.label}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => {
                  setCategory(item.label);
                  setJustSent(false);
                }}
                style={({ pressed }) => [
                  styles.chip,
                  selected && styles.chipSelected,
                  pressed && styles.pressed,
                ]}
              >
                <Feather
                  name={item.icon}
                  size={14}
                  color={selected ? colors.white : colors.textBody}
                />
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>YOUR MESSAGE</Text>
        <View style={styles.inputRow}>
          {voice.status === 'idle' ? (
            <TextInput
              accessibilityLabel="Request message"
              style={styles.input}
              placeholder="Describe what you need and why…"
              placeholderTextColor={colors.textMuted}
              value={message}
              onChangeText={(text) => {
                setMessage(text);
                setError(false);
                setJustSent(false);
                voice.clearError();
              }}
              multiline
            />
          ) : (
            <View style={[styles.input, styles.inputPill]}>
              <Text style={styles.pillText}>
                {voice.status === 'recording'
                  ? `Listening… ${voice.durationSec}s`
                  : 'Transcribing…'}
              </Text>
            </View>
          )}
          <MicButton
            status={voice.status}
            disabled={sending}
            size={44}
            onPress={handleVoicePress}
          />
        </View>
        {voice.error ? (
          <Text accessibilityRole="alert" style={styles.errorText}>
            {voice.error}
          </Text>
        ) : null}

        {error ? (
          <Text accessibilityRole="alert" style={styles.errorText}>
            Couldn&apos;t send the request. Check your connection and try again.
          </Text>
        ) : null}
        {justSent ? (
          <View accessibilityRole="alert" style={styles.successRow}>
            <Feather name="check-circle" size={17} color={colors.successText} />
            <Text style={styles.successText}>Sent to your counsellor.</Text>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={!canSend}
          onPress={handleSend}
          style={({ pressed }) => [
            styles.sendButton,
            !canSend && styles.sendButtonDisabled,
            pressed && canSend && styles.pressed,
          ]}
        >
          <Feather name="send" size={17} color={colors.white} />
          <Text style={styles.sendButtonText}>{sending ? 'Send request…' : 'Send request'}</Text>
        </Pressable>

        <Text style={styles.sectionLabel}>SENT THIS SESSION</Text>
        {sent.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="inbox" size={20} color={colors.textMuted} />
            <Text style={styles.emptyText}>Nothing sent yet. Your requests will appear here.</Text>
          </View>
        ) : (
          sent.map((request) => (
            <View key={request.id} style={styles.sentCard}>
              <View style={styles.sentHead}>
                <View style={styles.sentTypeChip}>
                  <Text style={styles.sentTypeText}>{request.type}</Text>
                </View>
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>NEW</Text>
                </View>
                <Text style={styles.sentTime}>{formatTime(request.createdAt)}</Text>
              </View>
              <Text style={styles.sentMessage}>{request.message}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textBody,
  },
  chipTextSelected: {
    color: colors.white,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 120,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.card,
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
    textAlignVertical: 'top',
  },
  inputPill: {
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  pillText: {
    color: colors.textBody,
    fontSize: 15,
  },
  errorText: {
    marginTop: spacing.md,
    fontSize: 13,
    lineHeight: 19,
    color: colors.red,
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.successSoft,
  },
  successText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.successText,
  },
  sendButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  sendButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  emptyText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
  sentCard: {
    marginBottom: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  sentHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sentTypeChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.xs,
    backgroundColor: colors.accentSoft,
  },
  sentTypeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentDark,
  },
  newBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
    backgroundColor: colors.successSoft,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.successText,
  },
  sentTime: {
    marginLeft: 'auto',
    fontSize: 11,
    color: colors.textMuted,
  },
  sentMessage: {
    marginTop: spacing.sm,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textBody,
  },
  pressed: {
    opacity: 0.7,
  },
});
