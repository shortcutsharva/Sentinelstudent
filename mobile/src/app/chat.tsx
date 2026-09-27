import { useEffect, useRef, useState } from 'react';

import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatBubble } from '@/components/ChatBubble';
import { MicButton } from '@/components/MicButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { requestSupport, submitSessionLog } from '@/lib/api';
import { advance, botMessage, buildSessionLog, createFlow, initialMessage, userMessage } from '@/lib/chatFlow';
import type { FlowState } from '@/lib/chatFlow';
import { sendChatMessage } from '@/lib/gemini';
import type { ChatMessage } from '@/lib/types';
import { useVoiceRecorder } from '@/lib/useVoiceRecorder';
import { colors, radius, spacing } from '@/theme';

function PulseDot() {
  const [opacity] = useState(() => new Animated.Value(0.35));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 650, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return <Animated.View style={[styles.pulseDot, { opacity }]} />;
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { repeated, from } = useLocalSearchParams<{ repeated?: string; from?: string }>();
  const isMentorship = from === 'mentorship';
  const sessionIdRef = useRef<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [initialMessage()]);
  const [flow, setFlow] = useState<FlowState>(() => createFlow(repeated === '1'));
  const flowRef = useRef<FlowState>(flow);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const loggedRef = useRef(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const inputRef = useRef<TextInput>(null);

  const voice = useVoiceRecorder((text) => {
    setInput((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text));
  });

  useEffect(() => {
    if (voice.error) inputRef.current?.focus();
  }, [voice.error]);

  const getSessionId = () => {
    if (!sessionIdRef.current) {
      sessionIdRef.current = `sess-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    }
    return sessionIdRef.current;
  };

  const logSession = (state: FlowState) => {
    if (loggedRef.current) return;
    loggedRef.current = true;
    void submitSessionLog(getSessionId(), buildSessionLog(state));
  };

  const applyFlow = (answer: string) => {
    const wasRequested = flowRef.current.supportRequested;
    const result = advance(flowRef.current, answer);
    flowRef.current = result.state;
    setFlow(result.state);
    if (result.messages.length > 0) {
      setMessages((prev) => [...prev, ...result.messages]);
    }
    if (result.state.supportRequested && !wasRequested) {
      void requestSupport({ sessionId: getSessionId(), reason: result.state.issue ?? 'Not specified' });
    }
    if (result.state.step === 'done') {
      logSession(result.state);
    }
    return result.state;
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || thinking || flow.step === 'done') return;
    setInput('');
    const outgoing = userMessage(text);
    setMessages((prev) => [...prev, outgoing]);
    setThinking(true);
    const reply = await sendChatMessage({
      message: text,
      history: messages.map((message) => ({ role: message.role, text: message.text })),
    });
    if (reply) {
      setMessages((prev) => [...prev, botMessage(reply.reply)]);
    } else {
      applyFlow(text);
    }
    setThinking(false);
  };

  const handleVoicePress = () => {
    if (voice.status === 'recording') {
      voice.stop();
    } else {
      void voice.start();
    }
  };

  const endSession = () => {
    logSession(flowRef.current);
    router.back();
  };

  const inputDisabled = flow.step === 'done';
  const showSend = !inputDisabled && voice.status === 'idle' && input.trim().length > 0;

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={isMentorship ? 'Mentorship Agent' : 'Academic Assistant'}
        subtitle={isMentorship ? 'Your study mate, on your side' : 'Ask about workload, focus…'}
        onBack={() => router.back()}
        right={
          <Pressable hitSlop={6} accessibilityRole="button" onPress={endSession}>
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
        }
      />
      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={
            thinking ? (
              <View style={styles.typingBubble}>
                <Text style={styles.typingText}>Typing…</Text>
              </View>
            ) : null
          }
        />
        {voice.error ? <Text style={styles.errorText}>{voice.error}</Text> : null}
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + spacing.sm }]}>
          {voice.status === 'recording' ? (
            <View style={styles.inputPill}>
              <PulseDot />
              <Text style={styles.pillText}>Listening… {voice.durationSec}s</Text>
            </View>
          ) : voice.status === 'transcribing' ? (
            <View style={styles.inputPill}>
              <Text style={styles.pillText}>Transcribing…</Text>
            </View>
          ) : (
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder={inputDisabled ? 'Chat ended' : 'Message'}
              placeholderTextColor={colors.textMuted}
              value={input}
              onChangeText={(text) => {
                voice.clearError();
                setInput(text);
              }}
              editable={!inputDisabled}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
          )}
          {showSend ? (
            <Pressable
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Send message"
              disabled={thinking}
              onPress={handleSend}
              style={({ pressed }) => [
                styles.sendButton,
                thinking && styles.sendButtonDisabled,
                pressed && styles.pressed,
              ]}
            >
              <Feather name="arrow-up" size={20} color={colors.white} />
            </Pressable>
          ) : (
            <MicButton
              status={voice.status}
              disabled={inputDisabled || thinking}
              onPress={handleVoicePress}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  body: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  typingBubble: {
    alignSelf: 'flex-start',
    borderRadius: radius.lg,
    borderBottomLeftRadius: radius.xs,
    backgroundColor: colors.bubbleBot,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md - 2,
  },
  typingText: {
    color: colors.textMuted,
    fontSize: 15,
    fontStyle: 'italic',
  },
  errorText: {
    color: colors.red,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md - 2,
    fontSize: 16,
    color: colors.text,
  },
  inputPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  pillText: {
    color: colors.textBody,
    fontSize: 15,
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.red,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  doneText: {
    color: colors.accent,
    fontSize: 17,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
